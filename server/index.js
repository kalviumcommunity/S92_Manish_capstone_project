const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const app = require("./app");

// ======================================================
// CHECK REQUIRED ENVIRONMENT VARIABLES
// ======================================================

const PORT = process.env.PORT || 5000;

if (!process.env.MONGO_URI) {
  console.error("MONGO_URI is missing from server/.env");
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET is missing from server/.env");
  process.exit(1);
}

// ======================================================
// CONNECT TO MONGODB, THEN START THE SERVER
// ======================================================

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");

    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    // Close connections cleanly when the platform stops the app
    const shutdown = (signal) => {
      console.log(`${signal} received, shutting down`);

      server.close(() => {
        mongoose.connection.close().finally(() => process.exit(0));
      });
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  });
