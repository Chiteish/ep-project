const mongoose = require("mongoose");

const scanSchema = new mongoose.Schema(
  {
    uid: {
      type: String,
      required: true,
      trim: true,
      uppercase: true
    },

    assetName: {
      type: String,
      default: "Unknown RFID"
    },

    action: {
      type: String,
      required: true,
      enum: [
        "CHECKED_OUT",
        "RETURNED",
        "ACCESS_DENIED"
      ]
    },

    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model(
  "Scan",
  scanSchema
);