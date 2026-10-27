const { parse } = require("csv-parse/sync");

const User = require("../models/User");
const Program = require("../models/Program");
const Engagement = require("../models/Engagement");

const MAX_ROWS = 1000;
const MAX_REPORTED_ERRORS = 20;

// Accepted CSV headers (lowercase, without spaces/underscores) -> field name
const HEADER_ALIASES = {
  name: "name",
  participantname: "name",
  email: "email",
  program: "program",
  programname: "program",
  sessionsattended: "sessionsAttended",
  totalsessions: "totalSessions",
  engagementscore: "engagementScore",
  satisfactionscore: "satisfactionScore",
  feedback: "feedback",
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const normalizeHeader = (header) => {
  const key = String(header).toLowerCase().replace(/[\s_-]/g, "");
  return HEADER_ALIASES[key] || key;
};

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Empty cell -> undefined, otherwise a number (throws on invalid input)
const toNumber = (value, label) => {
  if (value === undefined || value === "") {
    return undefined;
  }

  const number = Number(value);

  if (!Number.isFinite(number)) {
    throw new Error(`${label} must be a number`);
  }

  return number;
};

// ======================================================
// PARSE CSV FILE
// ======================================================

const parseCsv = (buffer) => {
  const rows = parse(buffer, {
    bom: true,
    columns: (headers) => headers.map(normalizeHeader),
    skip_empty_lines: true,
    trim: true,
  });

  if (rows.length === 0) {
    throw new Error("The CSV file has no data rows");
  }

  if (rows.length > MAX_ROWS) {
    throw new Error(`A CSV file can contain at most ${MAX_ROWS} rows`);
  }

  const headers = Object.keys(rows[0]);
  const missing = ["name", "email", "program"].filter(
    (field) => !headers.includes(field)
  );

  if (missing.length > 0) {
    throw new Error(`Missing required column(s): ${missing.join(", ")}`);
  }

  return rows;
};

// ======================================================
// IMPORT ONE ROW
// ======================================================

const importRow = async (row, programCache) => {
  const name = row.name;
  const email = (row.email || "").toLowerCase();
  const programName = row.program;

  if (!name || !email || !programName) {
    throw new Error("Name, email and program are required");
  }

  if (!EMAIL_PATTERN.test(email)) {
    throw new Error(`"${row.email}" is not a valid email`);
  }

  const engagementData = {
    sessionsAttended: toNumber(row.sessionsAttended, "Sessions attended"),
    totalSessions: toNumber(row.totalSessions, "Total sessions"),
    engagementScore: toNumber(row.engagementScore, "Engagement score"),
    satisfactionScore: toNumber(row.satisfactionScore, "Satisfaction score"),
    feedback: row.feedback || undefined,
  };

  if (
    engagementData.sessionsAttended !== undefined &&
    engagementData.totalSessions !== undefined &&
    engagementData.sessionsAttended > engagementData.totalSessions
  ) {
    throw new Error("Sessions attended cannot exceed total sessions");
  }

  // Remove empty fields so existing values are not overwritten
  Object.keys(engagementData).forEach((key) => {
    if (engagementData[key] === undefined) {
      delete engagementData[key];
    }
  });

  // Programs must already exist (matched by name, case-insensitive)
  const programKey = programName.toLowerCase();

  if (!programCache.has(programKey)) {
    const program = await Program.findOne({
      name: new RegExp(`^${escapeRegex(programName)}$`, "i"),
    });

    programCache.set(programKey, program);
  }

  const program = programCache.get(programKey);

  if (!program) {
    throw new Error(`Program "${programName}" does not exist`);
  }

  // Participants are created on first import
  let user = await User.findOne({ email });

  if (!user) {
    user = await User.create({
      name,
      email,
      role: "participant",
    });
  }

  // One engagement record per participant and program
  await Engagement.findOneAndUpdate(
    { user: user._id, program: program._id },
    { $set: engagementData },
    {
      upsert: true,
      returnDocument: "after",
      runValidators: true,
      setDefaultsOnInsert: true,
    }
  );
};

// ======================================================
// IMPORT ALL ROWS
// ======================================================

const importEngagementRows = async (rows) => {
  const programCache = new Map();
  const errors = [];
  let imported = 0;

  // Rows are imported one at a time so repeated emails reuse the same user
  for (let index = 0; index < rows.length; index++) {
    try {
      await importRow(rows[index], programCache);
      imported++;
    } catch (error) {
      if (errors.length < MAX_REPORTED_ERRORS) {
        // Show the first field error instead of mongoose's long summary
        const message =
          error.name === "ValidationError"
            ? Object.values(error.errors)[0].message
            : error.message;

        // +2: header row, and spreadsheet rows start at 1
        errors.push({ row: index + 2, message });
      }
    }
  }

  return {
    rowCount: rows.length,
    imported,
    skipped: rows.length - imported,
    errors,
  };
};

module.exports = {
  parseCsv,
  importEngagementRows,
  MAX_ROWS,
};
