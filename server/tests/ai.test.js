const Engagement = require("../models/Engagement");
const User = require("../models/User");
const { parseInsights } = require("../utils/aiInsights");
const {
  app,
  request,
  createUserAndLogin,
  auth,
  programData,
} = require("./helpers");

const createProgram = async (token, overrides) =>
  (
    await request(app)
      .post("/api/programs")
      .set(auth(token))
      .send(programData(overrides))
      .expect(201)
  ).body;

// Mock a successful Gemini reply containing `text`
const mockGemini = (text, status = 200) =>
  jest.spyOn(global, "fetch").mockResolvedValue({
    ok: status === 200,
    status,
    json: async () =>
      status === 200
        ? { candidates: [{ content: { parts: [{ text }] } }] }
        : { error: { message: "failure" } },
  });

const INSIGHTS = {
  summary: "Engagement is strong in Education.",
  highlights: ["Youth Coding Club scores 90."],
  concerns: ["Garden Club has low attendance."],
  recommendations: ["Add reminders for Garden Club."],
};

afterEach(() => {
  jest.restoreAllMocks();
  delete process.env.GEMINI_API_KEY;
  delete process.env.GEMINI_MODEL;
});

describe("GET /api/analytics/summary", () => {
  it("requires a token", async () => {
    await request(app).get("/api/analytics/summary").expect(401);
  });

  it("calculates totals, categories and program stats", async () => {
    const { token } = await createUserAndLogin();
    const coding = await createProgram(token, { status: "active" });
    const garden = await createProgram(token, {
      name: "Garden Club",
      category: "Environment",
    });

    const [arun, priya] = await User.create([
      { name: "Arun", email: "arun@example.com" },
      { name: "Priya", email: "priya@example.com" },
    ]);

    await Engagement.create([
      {
        user: arun._id,
        program: coding._id,
        sessionsAttended: 9,
        totalSessions: 10,
        engagementScore: 90,
        satisfactionScore: 5,
        feedback: "Great",
      },
      {
        user: priya._id,
        program: coding._id,
        sessionsAttended: 7,
        totalSessions: 10,
        engagementScore: 80,
        satisfactionScore: 4,
      },
      {
        user: arun._id,
        program: garden._id,
        sessionsAttended: 1,
        totalSessions: 10,
        engagementScore: 30,
      },
    ]);

    const response = await request(app)
      .get("/api/analytics/summary")
      .set(auth(token))
      .expect(200);

    expect(response.body.totals).toEqual({
      programs: 2,
      activePrograms: 1,
      participants: 2,
      engagements: 3,
      averageEngagement: 67,
      averageSatisfaction: 4.5,
      attendanceRate: 57,
    });

    expect(response.body.programs[0]).toMatchObject({
      name: "Youth Coding Club",
      participants: 2,
      averageEngagement: 85,
      averageSatisfaction: 4.5,
      attendanceRate: 80,
      feedback: ["Great"],
    });

    expect(response.body.categories).toEqual([
      { category: "Education", programs: 1, averageEngagement: 85 },
      { category: "Environment", programs: 1, averageEngagement: 30 },
    ]);

    expect(response.body.trend).toHaveLength(6);
    expect(response.body.trend[5].averageEngagement).toBe(67);
  });

  it("returns empty stats when there is no data", async () => {
    const { token } = await createUserAndLogin();

    const response = await request(app)
      .get("/api/analytics/summary")
      .set(auth(token))
      .expect(200);

    expect(response.body.totals.programs).toBe(0);
    expect(response.body.totals.averageEngagement).toBeNull();
    expect(response.body.programs).toEqual([]);
  });
});

describe("POST /api/ai/insights", () => {
  it("requires a token", async () => {
    await request(app).post("/api/ai/insights").expect(401);
  });

  it("returns 503 when no API key is configured", async () => {
    const { token } = await createUserAndLogin();
    await createProgram(token);

    const response = await request(app)
      .post("/api/ai/insights")
      .set(auth(token))
      .expect(503);

    expect(response.body.message).toMatch(/not configured/);
  });

  it("returns 400 when there are no programs", async () => {
    process.env.GEMINI_API_KEY = "test-key";
    const { token } = await createUserAndLogin();

    await request(app).post("/api/ai/insights").set(auth(token)).expect(400);
  });

  it("sends the analytics to Gemini and returns the insights", async () => {
    process.env.GEMINI_API_KEY = "test-key";
    process.env.GEMINI_MODEL = "test-model";
    const fetchMock = mockGemini(JSON.stringify(INSIGHTS));

    const { token } = await createUserAndLogin();
    await createProgram(token);

    const response = await request(app)
      .post("/api/ai/insights")
      .set(auth(token))
      .expect(200);

    expect(response.body).toMatchObject({ ...INSIGHTS, model: "test-model" });
    expect(response.body.generatedAt).toBeDefined();

    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toContain("/models/test-model:generateContent");
    expect(options.headers["x-goog-api-key"]).toBe("test-key");
    expect(options.body).toContain("Youth Coding Club");
  });

  it("limits each user to one request every 10 seconds", async () => {
    process.env.GEMINI_API_KEY = "test-key";
    mockGemini(JSON.stringify(INSIGHTS));

    const { token } = await createUserAndLogin();
    await createProgram(token);

    await request(app).post("/api/ai/insights").set(auth(token)).expect(200);

    const response = await request(app)
      .post("/api/ai/insights")
      .set(auth(token))
      .expect(429);

    expect(response.body.message).toMatch(/Please wait/);
  });

  it("returns 502 when Gemini fails", async () => {
    process.env.GEMINI_API_KEY = "test-key";
    mockGemini("", 500);

    const { token } = await createUserAndLogin();
    await createProgram(token);

    await request(app).post("/api/ai/insights").set(auth(token)).expect(502);
  });

  it("returns 502 when Gemini replies with something other than JSON", async () => {
    process.env.GEMINI_API_KEY = "test-key";
    mockGemini("Sorry, I cannot help with that.");

    const { token } = await createUserAndLogin();
    await createProgram(token);

    await request(app).post("/api/ai/insights").set(auth(token)).expect(502);
  });
});

describe("parseInsights", () => {
  it("accepts JSON inside a code fence and trims the lists", () => {
    const text = "```json\n" + JSON.stringify({
      ...INSIGHTS,
      highlights: ["a", "b", "c", "d", "e", "f", 42, " "],
    }) + "\n```";

    const insights = parseInsights(text);

    expect(insights.summary).toBe(INSIGHTS.summary);
    expect(insights.highlights).toEqual(["a", "b", "c", "d", "e"]);
  });

  it("rejects a reply without a summary", () => {
    expect(() => parseInsights('{"highlights": []}')).toThrow(/invalid response/);
  });
});
