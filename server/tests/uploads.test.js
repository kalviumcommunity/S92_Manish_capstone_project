const Engagement = require("../models/Engagement");
const User = require("../models/User");
const {
  app,
  request,
  createUserAndLogin,
  auth,
  programData,
} = require("./helpers");

const HEADER =
  "Participant Name,Email,Program,Sessions Attended,Total Sessions,Engagement Score,Satisfaction Score,Feedback";

const csv = (...rows) => Buffer.from([HEADER, ...rows].join("\n"));

const upload = (token, buffer, fileName = "data.csv") =>
  request(app)
    .post("/api/uploads")
    .set(auth(token))
    .attach("file", buffer, fileName);

describe("Upload APIs", () => {
  let token;

  beforeEach(async () => {
    ({ token } = await createUserAndLogin());

    await request(app)
      .post("/api/programs")
      .set(auth(token))
      .send(programData())
      .expect(201);
  });

  it("requires a token", async () => {
    await request(app)
      .post("/api/uploads")
      .attach("file", csv(), "data.csv")
      .expect(401);
  });

  it("imports valid rows and reports invalid ones", async () => {
    const response = await upload(
      token,
      csv(
        'Arun Kumar,ARUN@example.com,youth coding club,11,12,88,5,"Great, really"',
        "Priya,priya@example.com,Unknown Program,9,10,92,4,",
        "Bad Email,not-an-email,Youth Coding Club,,,,,",
        "Too High,high@example.com,Youth Coding Club,1,2,150,,",
        "Too Many,many@example.com,Youth Coding Club,5,2,50,,"
      )
    ).expect(201);

    expect(response.body.imported).toBe(1);
    expect(response.body.skipped).toBe(4);
    expect(response.body.errors.map((error) => error.row)).toEqual([3, 4, 5, 6]);
    expect(response.body.errors[0].message).toMatch(/does not exist/);
    expect(response.body.upload.rowCount).toBe(5);

    const engagement = await Engagement.findOne().populate("user");
    expect(engagement.user.email).toBe("arun@example.com");
    expect(engagement.engagementScore).toBe(88);
    expect(engagement.feedback).toBe("Great, really");
  });

  it("updates an existing engagement instead of duplicating it", async () => {
    await upload(
      token,
      csv("Arun,arun@example.com,Youth Coding Club,5,12,60,,")
    ).expect(201);

    await upload(
      token,
      csv("Arun,arun@example.com,Youth Coding Club,10,12,90,,")
    ).expect(201);

    expect(await Engagement.countDocuments()).toBe(1);
    expect(await User.countDocuments({ email: "arun@example.com" })).toBe(1);

    const engagement = await Engagement.findOne();
    expect(engagement.engagementScore).toBe(90);
    expect(engagement.sessionsAttended).toBe(10);
  });

  it("rejects requests without a file", async () => {
    await request(app).post("/api/uploads").set(auth(token)).expect(400);
  });

  it("rejects files that are not CSV", async () => {
    const response = await upload(token, csv(), "data.txt").expect(400);
    expect(response.body.message).toBe("Only .csv files are allowed");

    await upload(token, csv(), "datacsv").expect(400);
  });

  it("rejects files over 2 MB", async () => {
    const response = await upload(
      token,
      Buffer.alloc(2 * 1024 * 1024 + 1, "a")
    ).expect(400);

    expect(response.body.message).toBe("File must be 2 MB or smaller");
  });

  it("rejects a CSV with missing columns or no rows", async () => {
    const missing = await upload(token, Buffer.from("a,b\n1,2")).expect(400);
    expect(missing.body.message).toMatch(/Missing required column/);

    const empty = await upload(token, Buffer.from(HEADER)).expect(400);
    expect(empty.body.message).toMatch(/no data rows/);
  });

  it("lists, downloads and deletes uploads", async () => {
    const file = csv("Arun,arun@example.com,Youth Coding Club,5,12,60,,");
    const created = await upload(token, file, "engagement.csv").expect(201);
    const uploadId = created.body.upload.id;

    const list = await request(app)
      .get("/api/uploads")
      .set(auth(token))
      .expect(200);

    expect(list.body).toHaveLength(1);
    expect(list.body[0].originalName).toBe("engagement.csv");
    expect(list.body[0].data).toBeUndefined();

    const download = await request(app)
      .get(`/api/uploads/${uploadId}/download`)
      .set(auth(token))
      .buffer(true)
      .parse((res, callback) => {
        const chunks = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => callback(null, Buffer.concat(chunks)));
      })
      .expect(200);

    expect(download.headers["content-type"]).toMatch(/text\/csv/);
    expect(download.headers["content-disposition"]).toMatch(/engagement\.csv/);
    expect(download.body.equals(file)).toBe(true);

    await request(app)
      .delete(`/api/uploads/${uploadId}`)
      .set(auth(token))
      .expect(200);

    await request(app)
      .get(`/api/uploads/${uploadId}/download`)
      .set(auth(token))
      .expect(404);

    // Imported records are kept
    expect(await Engagement.countDocuments()).toBe(1);
  });

  it("only lets the uploader delete an upload", async () => {
    const created = await upload(
      token,
      csv("Arun,arun@example.com,Youth Coding Club,5,12,60,,")
    ).expect(201);

    const other = await createUserAndLogin();

    await request(app)
      .delete(`/api/uploads/${created.body.upload.id}`)
      .set(auth(other.token))
      .expect(403);
  });

  it("returns 400 for an invalid upload ID", async () => {
    await request(app)
      .get("/api/uploads/not-an-id/download")
      .set(auth(token))
      .expect(400);
  });
});
