const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const User = require("../models/User");
const { app, request, createUserAndLogin, auth } = require("./helpers");

describe("POST /api/auth/register", () => {
  const newUser = {
    name: "Asha Rao",
    username: "asha",
    email: "Asha@Example.com",
    password: "Password123",
  };

  it("creates a user with a hashed password", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send(newUser)
      .expect(201);

    expect(response.body.user).toMatchObject({
      username: "asha",
      email: "asha@example.com",
      role: "participant",
    });
    expect(response.body.user.password).toBeUndefined();

    const saved = await User.findOne({ username: "asha" }).select("+password");
    expect(saved.password).not.toBe("Password123");
    expect(saved.password).toMatch(/^\$2[aby]\$/);
  });

  it("does not allow registering as an admin", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({ ...newUser, role: "admin" })
      .expect(201);

    expect(response.body.user.role).toBe("participant");
  });

  it("allows registering as an organizer", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({ ...newUser, role: "organizer" })
      .expect(201);

    expect(response.body.user.role).toBe("organizer");
  });

  it("rejects missing fields", async () => {
    await request(app)
      .post("/api/auth/register")
      .send({ username: "asha" })
      .expect(400);
  });

  it("rejects a password shorter than 8 characters", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({ ...newUser, password: "short" })
      .expect(400);

    expect(response.body.message).toBe("Password must be at least 8 characters");
  });

  it("rejects a duplicate username or email", async () => {
    await request(app).post("/api/auth/register").send(newUser).expect(201);

    await request(app)
      .post("/api/auth/register")
      .send({ ...newUser, username: "other" })
      .expect(409);
  });
});

describe("POST /api/auth/login", () => {
  it("returns a valid JWT for correct credentials", async () => {
    const { token, user } = await createUserAndLogin();

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    expect(decoded.id).toBe(String(user.id));
  });

  it("rejects a wrong password", async () => {
    const { username } = await createUserAndLogin();

    const response = await request(app)
      .post("/api/auth/login")
      .send({ username, password: "wrong" })
      .expect(401);

    expect(response.body.message).toBe("Invalid username or password");
  });

  it("rejects an unknown username", async () => {
    await request(app)
      .post("/api/auth/login")
      .send({ username: "nobody", password: "Password123" })
      .expect(401);
  });

  it("rejects missing fields", async () => {
    await request(app).post("/api/auth/login").send({}).expect(400);
  });
});

describe("GET /api/auth/me", () => {
  it("returns the logged-in user", async () => {
    const { token, username } = await createUserAndLogin();

    const response = await request(app)
      .get("/api/auth/me")
      .set(auth(token))
      .expect(200);

    expect(response.body.user.username).toBe(username);
  });

  it("requires a token", async () => {
    await request(app).get("/api/auth/me").expect(401);
  });

  it("rejects an invalid token", async () => {
    await request(app).get("/api/auth/me").set(auth("not-a-jwt")).expect(401);
  });

  it("rejects an expired token", async () => {
    const expired = jwt.sign(
      { id: "000000000000000000000000" },
      process.env.JWT_SECRET,
      { expiresIn: -10 }
    );

    await request(app).get("/api/auth/me").set(auth(expired)).expect(401);
  });
});

describe("POST /api/auth/google", () => {
  it("requires a credential", async () => {
    await request(app).post("/api/auth/google").send({}).expect(400);
  });

  it("rejects an invalid Google credential", async () => {
    const response = await request(app)
      .post("/api/auth/google")
      .send({ credential: "invalid-token" })
      .expect(401);

    expect(response.body.message).toBe("Google authentication failed");
  });

  describe("with a verified Google token", () => {
    // Pretend Google verified the token and returned this payload.
    const mockGooglePayload = (payload) =>
      jest
        .spyOn(OAuth2Client.prototype, "verifyIdToken")
        .mockResolvedValue({ getPayload: () => payload });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it("creates a participant on first sign-in and reuses it afterwards", async () => {
      mockGooglePayload({
        email: "Google.User@Gmail.com",
        email_verified: true,
        name: "Google User",
      });

      const first = await request(app)
        .post("/api/auth/google")
        .send({ credential: "token" })
        .expect(200);

      expect(first.body.user).toMatchObject({
        email: "google.user@gmail.com",
        username: "googleuser",
        role: "participant",
      });
      expect(jwt.verify(first.body.token, process.env.JWT_SECRET).id).toBe(
        String(first.body.user.id)
      );

      const second = await request(app)
        .post("/api/auth/google")
        .send({ credential: "token" })
        .expect(200);

      expect(second.body.user.id).toBe(first.body.user.id);
      expect(await User.countDocuments()).toBe(1);
    });

    it("picks a free username when the email prefix is taken", async () => {
      await createUserAndLogin({ username: "asha" });

      mockGooglePayload({ email: "asha@gmail.com", email_verified: true });

      const response = await request(app)
        .post("/api/auth/google")
        .send({ credential: "token" })
        .expect(200);

      expect(response.body.user.username).toBe("asha1");
    });

    it("rejects an unverified Google email", async () => {
      mockGooglePayload({ email: "new@gmail.com", email_verified: false });

      await request(app)
        .post("/api/auth/google")
        .send({ credential: "token" })
        .expect(401);
    });
  });
});
