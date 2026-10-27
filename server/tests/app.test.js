const { app, request } = require("./helpers");

describe("General routes", () => {
  it("responds on the root route", async () => {
    const response = await request(app).get("/").expect(200);
    expect(response.text).toBe("Community Connect server is running");
  });

  it("reports a healthy database connection", async () => {
    const response = await request(app).get("/api/health").expect(200);
    expect(response.body).toEqual({ status: "ok", database: "connected" });
  });

  it("returns JSON for unknown routes", async () => {
    const response = await request(app).get("/api/does-not-exist").expect(404);
    expect(response.body.message).toBe("Route not found");
  });

  it("returns JSON for a malformed JSON body", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .set("Content-Type", "application/json")
      .send("{bad json")
      .expect(400);

    expect(response.body.message).toBe("Invalid JSON body");
  });
});
