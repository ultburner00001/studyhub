import express from "express";
import Timetable from "../models/Timetable.js";

const router = express.Router();

// ✅ Get all timetable entries
router.get("/", async (req, res) => {
  try {
    const timetable = await Timetable.find().sort({ day: 1, startTime: 1 });
    res.json({ success: true, data: timetable });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ✅ Add a timetable entry
router.post("/", async (req, res) => {
  try {
    const { day, subject, startTime, endTime } = req.body;
    const newEntry = new Timetable({ day, subject, startTime, endTime });
    await newEntry.save();
    res.status(201).json({ success: true, data: newEntry });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ✅ Delete a timetable entry
router.delete("/:id", async (req, res) => {
  try {
    const entry = await Timetable.findByIdAndDelete(req.params.id);
    if (!entry) return res.status(404).json({ success: false, message: "Entry not found" });
    res.json({ success: true, message: "Entry deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
