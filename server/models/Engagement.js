const mongoose = require("mongoose");

const engagementSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    program: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Program",
      required: true,
    },

    sessionsAttended: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalSessions: {
      type: Number,
      default: 0,
      min: 0,
    },

    engagementScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    satisfactionScore: {
      type: Number,
      min: 1,
      max: 5,
    },

    feedback: {
      type: String,
      trim: true,
    },

    lastAttended: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Engagement", engagementSchema);