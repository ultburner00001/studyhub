// routes/timetableRoutes.js
import express from "express";
import Timetable from "../models/Timetable.js";

const router = express.Router();

// Get timetable
router.get("/", async (req, res) => {
  try {
    const data = await Timetable.find();
    res.json({ success: true, timetable: data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Save timetable (replace existing)
router.post("/", async (req, res) => {
  try {
    const { schedule } = req.body;
    if (!schedule) {
      return res.status(400).json({ success: false, message: "No schedule provided" });
    }

    // Replace all existing data with new one
    await Timetable.deleteMany();
    const newData = await Timetable.create({ schedule });

    res.json({ success: true, message: "Timetable saved successfully", data: newData });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
