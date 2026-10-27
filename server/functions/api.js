// Netlify Function that runs the Express API.
// netlify.toml sends every /api/* request here.
const express = require("express");
const serverless = require("serverless-http");
const mongoose = require("mongoose");

const app = require("../app");

const FUNCTION_PREFIX = "/.netlify/functions/api";

// Reuse the MongoDB connection between requests on a warm function
let connection = null;

const connectToDatabase = () => {
  if (!connection) {
    connection = mongoose
      .connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 })
      .catch((error) => {
        // Try again on the next request
        connection = null;
        throw error;
      });
  }

  return connection;
};

// serverless-http hands Express the body as a Buffer and marks the request
// as already read, so express.json() skips it. Parse JSON bodies here instead.
const parseJsonBody = (request) => {
  const isJson = (request.headers["content-type"] || "").includes("application/json");

  if (!isJson || !Buffer.isBuffer(request.body)) {
    return;
  }

  const text = request.body.toString("utf8");

  try {
    request.body = text.trim() ? JSON.parse(text) : {};
  } catch {
    request.body = {};
    request.invalidJson = true;
  }
};

// Same response the normal server gives for malformed JSON
const wrapper = express();

wrapper.use((req, res, next) => {
  if (req.invalidJson) {
    return res.status(400).json({ message: "Invalid JSON body" });
  }

  next();
});

wrapper.use(app);

const handler = serverless(wrapper, {
  request(request) {
    // Requests may arrive as /.netlify/functions/api/... ; Express expects /api/...
    if (request.url.startsWith(FUNCTION_PREFIX)) {
      request.url = `/api${request.url.slice(FUNCTION_PREFIX.length)}`;
    }

    parseJsonBody(request);
  },
});

exports.handler = async (event, context) => {
  // Return the response without waiting for the open MongoDB connection to close
  context.callbackWaitsForEmptyEventLoop = false;

  if (!process.env.MONGO_URI || !process.env.JWT_SECRET) {
    console.error("MONGO_URI or JWT_SECRET is not set in Netlify");

    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Server is not configured" }),
    };
  }

  try {
    await connectToDatabase();
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);

    return {
      statusCode: 503,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Database unavailable" }),
    };
  }

  return handler(event, context);
};
