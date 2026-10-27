const {
  app,
  request,
  createUserAndLogin,
  auth,
  programData,
} = require("./helpers");

describe("Program APIs", () => {
  let token;

  beforeEach(async () => {
    ({ token } = await createUserAndLogin());
  });

  it("requires a token for every program route", async () => {
    await request(app).get("/api/programs").expect(401);
    await request(app).post("/api/programs").send(programData()).expect(401);
    await request(app)
      .put("/api/programs/000000000000000000000000")
      .send({ name: "x" })
      .expect(401);
    await request(app)
      .delete("/api/programs/000000000000000000000000")
      .expect(401);
  });

  it("creates and lists programs", async () => {
    const created = await request(app)
      .post("/api/programs")
      .set(auth(token))
      .send(programData())
      .expect(201);

    expect(created.body).toMatchObject({
      name: "Youth Coding Club",
      category: "Education",
      capacity: 30,
      status: "upcoming",
    });

    const list = await request(app)
      .get("/api/programs")
      .set(auth(token))
      .expect(200);

    expect(list.body).toHaveLength(1);
    expect(list.body[0]._id).toBe(created.body._id);
  });

  it("rejects a program without required fields", async () => {
    await request(app)
      .post("/api/programs")
      .set(auth(token))
      .send({ name: "No category" })
      .expect(400);
  });

  it("rejects an invalid status", async () => {
    await request(app)
      .post("/api/programs")
      .set(auth(token))
      .send(programData({ status: "cancelled" }))
      .expect(400);
  });

  it("updates a program", async () => {
    const created = await request(app)
      .post("/api/programs")
      .set(auth(token))
      .send(programData())
      .expect(201);

    const updated = await request(app)
      .put(`/api/programs/${created.body._id}`)
      .set(auth(token))
      .send({ status: "active", capacity: 50 })
      .expect(200);

    expect(updated.body.status).toBe("active");
    expect(updated.body.capacity).toBe(50);
    expect(updated.body.name).toBe("Youth Coding Club");
  });

  it("validates updates", async () => {
    const created = await request(app)
      .post("/api/programs")
      .set(auth(token))
      .send(programData())
      .expect(201);

    await request(app)
      .put(`/api/programs/${created.body._id}`)
      .set(auth(token))
      .send({ status: "unknown" })
      .expect(400);
  });

  it("returns 404 when updating or deleting a missing program", async () => {
    const missingId = "000000000000000000000000";

    await request(app)
      .put(`/api/programs/${missingId}`)
      .set(auth(token))
      .send({ name: "x" })
      .expect(404);

    await request(app)
      .delete(`/api/programs/${missingId}`)
      .set(auth(token))
      .expect(404);
  });

  it("returns 400 for an invalid ID", async () => {
    await request(app)
      .delete("/api/programs/not-an-id")
      .set(auth(token))
      .expect(400);
  });

  it("deletes a program", async () => {
    const created = await request(app)
      .post("/api/programs")
      .set(auth(token))
      .send(programData())
      .expect(201);

    await request(app)
      .delete(`/api/programs/${created.body._id}`)
      .set(auth(token))
      .expect(200);

    const list = await request(app)
      .get("/api/programs")
      .set(auth(token))
      .expect(200);

    expect(list.body).toHaveLength(0);
  });
});
