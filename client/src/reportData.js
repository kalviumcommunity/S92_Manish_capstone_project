// ======================================================
// REPORT BUILDERS
// Each function returns CSV rows: a header row, then data rows.
// ======================================================

const percent = (attended, total) =>
  total > 0 ? Math.round((Math.min(attended, total) / total) * 100) : "";

// Program statistics from GET /api/analytics/summary
export const programPerformanceRows = (programs) => [
  [
    "Program",
    "Category",
    "Status",
    "Participants",
    "Average Engagement",
    "Average Satisfaction",
    "Attendance Rate (%)",
  ],
  ...programs.map((program) => [
    program.name,
    program.category,
    program.status,
    program.participants,
    program.averageEngagement ?? "",
    program.averageSatisfaction ?? "",
    program.attendanceRate ?? "",
  ]),
];

// One row per engagement record from GET /api/engagements
export const engagementRows = (engagements) => [
  [
    "Participant",
    "Email",
    "Program",
    "Sessions Attended",
    "Total Sessions",
    "Attendance (%)",
    "Engagement Score",
    "Satisfaction Score",
    "Feedback",
  ],
  ...engagements.map((engagement) => [
    engagement.user?.name || "Deleted user",
    engagement.user?.email || "",
    engagement.program?.name || "Deleted program",
    engagement.sessionsAttended ?? "",
    engagement.totalSessions ?? "",
    percent(engagement.sessionsAttended || 0, engagement.totalSessions || 0),
    engagement.engagementScore ?? "",
    engagement.satisfactionScore ?? "",
    engagement.feedback || "",
  ]),
];

// One row per participant, combining all of their programs
export const summarizeParticipants = (engagements) => {
  const participants = new Map();

  engagements.forEach((engagement) => {
    if (!engagement.user) {
      return;
    }

    const id = engagement.user._id;

    if (!participants.has(id)) {
      participants.set(id, {
        id,
        name: engagement.user.name,
        email: engagement.user.email,
        joined: engagement.user.createdAt,
        programs: [],
        activePrograms: 0,
        attended: 0,
        total: 0,
        scores: [],
      });
    }

    const participant = participants.get(id);

    if (engagement.program) {
      participant.programs.push(engagement.program.name);

      if (engagement.program.status === "active") {
        participant.activePrograms++;
      }
    }

    participant.attended += Math.min(
      engagement.sessionsAttended || 0,
      engagement.totalSessions || 0
    );
    participant.total += engagement.totalSessions || 0;
    participant.scores.push(engagement.engagementScore || 0);
  });

  return [...participants.values()].map((participant) => ({
    ...participant,
    attendance:
      participant.total > 0
        ? Math.round((participant.attended / participant.total) * 100)
        : null,
    averageEngagement: Math.round(
      participant.scores.reduce((sum, score) => sum + score, 0) /
        participant.scores.length
    ),
  }));
};

export const participantRows = (engagements) => [
  ["Participant", "Email", "Programs", "Attendance (%)", "Average Engagement"],
  ...summarizeParticipants(engagements).map((participant) => [
    participant.name,
    participant.email,
    participant.programs.join("; "),
    participant.attendance ?? "",
    participant.averageEngagement,
  ]),
];
