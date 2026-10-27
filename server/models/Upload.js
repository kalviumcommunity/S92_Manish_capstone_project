const mongoose = require("mongoose");

const uploadSchema = new mongoose.Schema(
  {
    originalName: {
      type: String,
      required: true,
      trim: true,
    },

    mimeType: {
      type: String,
      required: true,
    },

    size: {
      type: Number,
      required: true,
      min: 0,
    },

    // File contents are stored in MongoDB so uploads survive
    // redeploys on hosts with temporary disks.
    data: {
      type: Buffer,
      required: true,
      select: false,
    },

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    rowCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    importedCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    skippedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Upload", uploadSchema);
