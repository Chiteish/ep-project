const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
  {
    assetName: {
      type: String,
      default: null
    },

    uid: {
      type: String,
      required: true,
      uppercase: true,
      trim: true
    },

    action: {
      type: String,
      enum: [
        "CHECKED_OUT",
        "RETURNED",
        "ACCESS_DENIED"
      ],
      required: true
    },

    location: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Activity", activitySchema);