const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    role: {
      type: String,
      enum: ["participant", "organizer", "admin"],
      default: "participant",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);