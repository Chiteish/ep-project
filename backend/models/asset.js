const mongoose = require("mongoose");

const assetSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    uid: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true
    },

    category: {
      type: String,
      required: true,
      trim: true
    },

    location: {
      type: String,
      required: true,
      trim: true
    },

    status: {
      type: String,
      enum: [
        "AVAILABLE",
        "CHECKED_OUT"
      ],
      default: "AVAILABLE"
    },

    lastScan: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model(
  "Asset",
  assetSchema
);