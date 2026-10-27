const request = require("supertest");
const app = require("../app");

let counter = 0;

// Register a user and log in. Returns { token, user, username, password }.
const createUserAndLogin = async (overrides = {}) => {
  counter++;

  const details = {
    name: `Test User ${counter}`,
    username: `user${counter}`,
    email: `user${counter}@example.com`,
    password: "Password123",
    ...overrides,
  };

  await request(app).post("/api/auth/register").send(details).expect(201);

  const response = await request(app)
    .post("/api/auth/login")
    .send({ username: details.username, password: details.password })
    .expect(200);

  return {
    token: response.body.token,
    user: response.body.user,
    username: details.username,
    password: details.password,
  };
};

const auth = (token) => ({ Authorization: `Bearer ${token}` });

const programData = (overrides = {}) => ({
  name: "Youth Coding Club",
  category: "Education",
  startDate: "2026-11-01",
  capacity: 30,
  ...overrides,
});

module.exports = { app, request, createUserAndLogin, auth, programData };
