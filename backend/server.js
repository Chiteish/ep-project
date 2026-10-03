const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const Asset = require("./models/Asset");
const Scan = require("./models/Scan");


// =====================================================
// EXPRESS APP
// =====================================================

const app = express();


// =====================================================
// MIDDLEWARE
// =====================================================

app.use(
  cors({
    origin: "*"
  })
);

app.use(express.json());


// =====================================================
// MONGODB CONNECTION
// =====================================================

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {

  console.error(
    "ERROR: MONGO_URI is missing in .env"
  );

  process.exit(1);
}


mongoose
  .connect(MONGO_URI)
  .then(() => {

    console.log(
      "MongoDB connected successfully"
    );

  })
  .catch((error) => {

    console.error(
      "MongoDB connection failed:"
    );

    console.error(error.message);

  });


// =====================================================
// ROOT ROUTE
// =====================================================

app.get("/", (req, res) => {

  res.json({
    success: true,
    message: "Smart Asset Tracking API is running"
  });

});


// =====================================================
// GET ALL ASSETS
// =====================================================

app.get("/api/assets", async (req, res) => {

  try {

    const assets = await Asset.find()
      .sort({
        createdAt: -1
      });

    res.json({

      success: true,

      count: assets.length,

      assets: assets

    });

  } catch (error) {

    console.error(
      "Failed to fetch assets:",
      error
    );

    res.status(500).json({

      success: false,

      message: "Failed to fetch assets",

      error: error.message

    });

  }

});


// =====================================================
// GET RECENT RFID SCANS
// =====================================================

app.get("/api/scans", async (req, res) => {

  try {

    const scans = await Scan.find()
      .sort({
        timestamp: -1
      })
      .limit(20);

    res.json({

      success: true,

      count: scans.length,

      scans: scans

    });

  } catch (error) {

    console.error(
      "Failed to fetch scan history:",
      error
    );

    res.status(500).json({

      success: false,

      message: "Failed to fetch scan history",

      error: error.message

    });

  }

});


// =====================================================
// RFID SCAN
// ESP32 → POST /api/scan
// =====================================================

app.post("/api/scan", async (req, res) => {

  try {

    console.log();
    console.log(
      "========================================"
    );

    console.log(
      "       RFID SCAN REQUEST RECEIVED"
    );

    console.log(
      "========================================"
    );


    // -------------------------------------------------
    // GET UID
    // -------------------------------------------------

    let uid = req.body.uid;


    if (!uid) {

      console.log(
        "ERROR: UID not provided"
      );

      return res.status(400).json({

        success: false,

        message: "RFID UID is required"

      });

    }


    // -------------------------------------------------
    // NORMALIZE UID
    // -------------------------------------------------

    uid = uid
      .trim()
      .toUpperCase()
      .replace(/\s+/g, " ");


    console.log(
      "Received UID:",
      uid
    );


    // -------------------------------------------------
    // SEARCH ASSET
    // -------------------------------------------------

    console.log(
      "Searching for asset..."
    );


    const asset = await Asset.findOne({
      uid: uid
    });


    // =================================================
    // UNKNOWN RFID
    // =================================================

    if (!asset) {

      console.log(
        "UNKNOWN RFID - ACCESS DENIED"
      );


      // Save denied scan
      await Scan.create({

        uid: uid,

        assetName: "Unknown RFID",

        action: "ACCESS_DENIED",

        timestamp: new Date()

      });


      console.log(
        "Access denied scan recorded."
      );


      return res.status(403).json({

        success: false,

        message: "Access denied",

        action: "ACCESS_DENIED",

        uid: uid

      });

    }


    console.log(
      "Asset found:",
      asset.name
    );

    console.log(
      "Current status:",
      asset.status
    );


    // =================================================
    // ASSET AVAILABLE
    // → CHECKED OUT
    // =================================================

    if (asset.status === "AVAILABLE") {

      console.log(
        "Asset is AVAILABLE."
      );

      console.log(
        "Changing status to CHECKED_OUT..."
      );


      asset.status = "CHECKED_OUT";

      asset.lastScan = new Date();


      await asset.save();


      // Record scan
      await Scan.create({

        uid: uid,

        assetName: asset.name,

        action: "CHECKED_OUT",

        timestamp: new Date()

      });


      console.log(
        "Asset checked out successfully."
      );


      console.log(
        "========================================"
      );


      return res.status(200).json({

        success: true,

        message: "Asset checked out successfully",

        action: "CHECKED_OUT",

        uid: uid,

        asset: {

          id: asset._id,

          name: asset.name,

          category: asset.category,

          location: asset.location,

          status: asset.status,

          lastScan: asset.lastScan

        }

      });

    }


    // =================================================
    // ASSET CHECKED OUT
    // → RETURNED
    // → AVAILABLE
    // =================================================

    if (asset.status === "CHECKED_OUT") {

      console.log(
        "Asset is currently CHECKED_OUT."
      );

      console.log(
        "Processing return..."
      );


      asset.status = "AVAILABLE";

      asset.lastScan = new Date();


      await asset.save();


      // Record scan
      await Scan.create({

        uid: uid,

        assetName: asset.name,

        action: "RETURNED",

        timestamp: new Date()

      });


      console.log(
        "Asset returned successfully."
      );


      console.log(
        "========================================"
      );


      return res.status(200).json({

        success: true,

        message: "Asset returned successfully",

        action: "RETURNED",

        uid: uid,

        asset: {

          id: asset._id,

          name: asset.name,

          category: asset.category,

          location: asset.location,

          status: asset.status,

          lastScan: asset.lastScan

        }

      });

    }


    // =================================================
    // UNEXPECTED STATUS
    // =================================================

    console.log(
      "Unexpected asset status:",
      asset.status
    );


    return res.status(500).json({

      success: false,

      message: "Unknown asset status",

      status: asset.status

    });


  } catch (error) {

    console.error();
    console.error(
      "========================================"
    );

    console.error(
      "RFID SCAN PROCESSING FAILED"
    );

    console.error(
      "========================================"
    );

    console.error(
      error
    );


    return res.status(500).json({

      success: false,

      message: "RFID scan processing failed",

      error: error.message

    });

  }

});


// =====================================================
// SERVER
// =====================================================

const PORT = 5000;

app.listen(
  PORT,
  "0.0.0.0",
  () => {

    console.log();
    console.log(
      "========================================"
    );

    console.log(
      "       Smart Asset Tracking API"
    );

    console.log(
      "========================================"
    );

    console.log(
      `Server running on port ${PORT}`
    );

    console.log(
      `http://localhost:${PORT}`
    );

    console.log(
      "========================================"
    );

  }
);
// =====================================================
// DEMO STATUS
// =====================================================

let demoStatus = "READY";


// GET DEMO STATUS
app.get("/api/demo-status", (req, res) => {

    res.json({
        success: true,
        status: demoStatus
    });

});


// CHANGE DEMO STATUS
app.post("/api/demo-status", (req, res) => {

    const { status } = req.body;

    const allowedStatuses = [
        "READY",
        "CHECKED_OUT",
        "RETURNED",
        "ACCESS_DENIED"
    ];

    if (!allowedStatuses.includes(status)) {

        return res.status(400).json({
            success: false,
            message: "Invalid demo status"
        });

    }

    demoStatus = status;

    console.log("DEMO STATUS:", demoStatus);

    res.json({
        success: true,
        status: demoStatus
    });

});