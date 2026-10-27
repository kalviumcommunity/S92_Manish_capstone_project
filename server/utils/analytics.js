const Program = require("../models/Program");
const Engagement = require("../models/Engagement");

const TREND_MONTHS = 6;

// Average of the numeric values, rounded; null when there are none
const average = (values, decimals = 0) => {
  const numbers = values.filter((value) => typeof value === "number");

  if (numbers.length === 0) {
    return null;
  }

  const factor = 10 ** decimals;
  const total = numbers.reduce((sum, value) => sum + value, 0);

  return Math.round((total / numbers.length) * factor) / factor;
};

// Attended sessions as a percentage of total sessions; null without data
const attendanceRate = (engagements) => {
  let attended = 0;
  let total = 0;

  engagements.forEach((engagement) => {
    if (engagement.totalSessions > 0) {
      attended += Math.min(engagement.sessionsAttended || 0, engagement.totalSessions);
      total += engagement.totalSessions;
    }
  });

  return total > 0 ? Math.round((attended / total) * 100) : null;
};

// Average engagement per month for the last TREND_MONTHS months
const buildTrend = (engagements, now) => {
  const months = [];

  for (let offset = TREND_MONTHS - 1; offset >= 0; offset--) {
    const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - offset, 1));

    months.push({
      month: date.toISOString().slice(0, 7),
      label: date.toLocaleString("en-US", { month: "short", timeZone: "UTC" }),
      scores: [],
    });
  }

  engagements.forEach((engagement) => {
    const date = engagement.lastAttended || engagement.createdAt;
    const month = months.find(
      (item) => item.month === new Date(date).toISOString().slice(0, 7)
    );

    if (month) {
      month.scores.push(engagement.engagementScore);
    }
  });

  return months.map(({ month, label, scores }) => ({
    month,
    label,
    averageEngagement: average(scores),
  }));
};

// ======================================================
// ANALYTICS SUMMARY
// ======================================================

const getAnalyticsSummary = async (now = new Date()) => {
  const [programs, engagements] = await Promise.all([
    Program.find().lean(),
    Engagement.find().lean(),
  ]);

  const engagementsByProgram = new Map();

  engagements.forEach((engagement) => {
    const key = String(engagement.program);

    if (!engagementsByProgram.has(key)) {
      engagementsByProgram.set(key, []);
    }

    engagementsByProgram.get(key).push(engagement);
  });

  const programStats = programs
    .map((program) => {
      const records = engagementsByProgram.get(String(program._id)) || [];

      return {
        id: program._id,
        name: program.name,
        category: program.category,
        status: program.status,
        capacity: program.capacity || 0,
        participants: new Set(records.map((record) => String(record.user))).size,
        averageEngagement: average(records.map((record) => record.engagementScore)),
        averageSatisfaction: average(
          records.map((record) => record.satisfactionScore),
          1
        ),
        attendanceRate: attendanceRate(records),
        feedback: records
          .map((record) => record.feedback)
          .filter(Boolean)
          .slice(0, 3)
          .map((text) => text.slice(0, 200)),
      };
    })
    // Highest engagement first; programs without data last
    .sort((a, b) => (b.averageEngagement ?? -1) - (a.averageEngagement ?? -1));

  const categories = [...new Set(programs.map((program) => program.category))]
    .map((category) => {
      const inCategory = programStats.filter((program) => program.category === category);
      const ids = new Set(inCategory.map((program) => String(program.id)));

      return {
        category,
        programs: inCategory.length,
        averageEngagement: average(
          engagements
            .filter((engagement) => ids.has(String(engagement.program)))
            .map((engagement) => engagement.engagementScore)
        ),
      };
    })
    .sort((a, b) => (b.averageEngagement ?? -1) - (a.averageEngagement ?? -1));

  return {
    totals: {
      programs: programs.length,
      activePrograms: programs.filter((program) => program.status === "active").length,
      participants: new Set(engagements.map((engagement) => String(engagement.user))).size,
      engagements: engagements.length,
      averageEngagement: average(engagements.map((engagement) => engagement.engagementScore)),
      averageSatisfaction: average(
        engagements.map((engagement) => engagement.satisfactionScore),
        1
      ),
      attendanceRate: attendanceRate(engagements),
    },
    categories,
    programs: programStats,
    trend: buildTrend(engagements, now),
  };
};

module.exports = { getAnalyticsSummary, average, attendanceRate };
