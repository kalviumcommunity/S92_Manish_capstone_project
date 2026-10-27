const User = require("../models/User");
const {
  app,
  request,
  createUserAndLogin,
  auth,
  programData,
} = require("./helpers");

describe("User APIs", () => {
  let token;

  beforeEach(async () => {
    ({ token } = await createUserAndLogin());
  });

  it("requires a token", async () => {
    await request(app).get("/api/users").expect(401);
    await request(app).post("/api/users").send({}).expect(401);
  });

  it("lists users without passwords", async () => {
    const response = await request(app)
      .get("/api/users")
      .set(auth(token))
      .expect(200);

    expect(response.body).toHaveLength(1);
    expect(response.body[0].password).toBeUndefined();
  });

  it("gets a user by ID", async () => {
    const created = await request(app)
      .post("/api/users")
      .set(auth(token))
      .send({ name: "Ravi", email: "ravi@example.com" })
      .expect(201);

    const response = await request(app)
      .get(`/api/users/${created.body._id}`)
      .set(auth(token))
      .expect(200);

    expect(response.body.email).toBe("ravi@example.com");
  });

  it("returns 404 for a missing user and 400 for an invalid ID", async () => {
    await request(app)
      .get("/api/users/000000000000000000000000")
      .set(auth(token))
      .expect(404);

    await request(app)
      .get("/api/users/not-an-id")
      .set(auth(token))
      .expect(400);
  });

  it("hashes the password of a created user", async () => {
    const response = await request(app)
      .post("/api/users")
      .set(auth(token))
      .send({ name: "Meena", email: "meena@example.com", password: "secret1" })
      .expect(201);

    expect(response.body.password).toBeUndefined();

    const saved = await User.findById(response.body._id).select("+password");
    expect(saved.password).not.toBe("secret1");
  });

  it("only lets admins create admins", async () => {
    const response = await request(app)
      .post("/api/users")
      .set(auth(token))
      .send({ name: "Sneaky", email: "sneaky@example.com", role: "admin" })
      .expect(201);

    expect(response.body.role).toBe("participant");
  });

  it("rejects a duplicate email", async () => {
    const user = { name: "Ravi", email: "ravi@example.com" };

    await request(app).post("/api/users").set(auth(token)).send(user).expect(201);
    await request(app).post("/api/users").set(auth(token)).send(user).expect(400);
  });
});

describe("Engagement APIs", () => {
  let token;
  let userId;
  let programId;

  beforeEach(async () => {
    let user;
    ({ token, user } = await createUserAndLogin());
    userId = user.id;

    const program = await request(app)
      .post("/api/programs")
      .set(auth(token))
      .send(programData())
      .expect(201);

    programId = program.body._id;
  });

  it("requires a token", async () => {
    await request(app).get("/api/engagements").expect(401);
  });

  it("creates an engagement with the user and program populated", async () => {
    const response = await request(app)
      .post("/api/engagements")
      .set(auth(token))
      .send({
        user: userId,
        program: programId,
        sessionsAttended: 8,
        totalSessions: 10,
        engagementScore: 85,
      })
      .expect(201);

    expect(response.body.program.name).toBe("Youth Coding Club");
    expect(response.body.user._id).toBe(String(userId));
    expect(response.body.user.password).toBeUndefined();

    const list = await request(app)
      .get("/api/engagements")
      .set(auth(token))
      .expect(200);

    expect(list.body).toHaveLength(1);
  });

  it("rejects an engagement score above 100", async () => {
    await request(app)
      .post("/api/engagements")
      .set(auth(token))
      .send({ user: userId, program: programId, engagementScore: 150 })
      .expect(400);
  });

  it("rejects an engagement without a user or program", async () => {
    await request(app)
      .post("/api/engagements")
      .set(auth(token))
      .send({ engagementScore: 50 })
      .expect(400);
  });
});
