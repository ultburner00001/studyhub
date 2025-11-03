import express from "express";
import Timetable from "../models/Timetable.js";

const router = express.Router();

// Get all timetable entries for user
router.get("/", async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ success: false, message: "User ID required" });

    const data = await Timetable.find({ userId });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Add new timetable entry
router.post("/", async (req, res) => {
  try {
    const { day, subject, time, userId } = req.body;
    if (!userId) return res.status(400).json({ success: false, message: "User ID required" });

    const entry = new Timetable({ day, subject, time, userId });
    await entry.save();
    res.status(201).json({ success: true, data: entry });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Delete entry
router.delete("/:id", async (req, res) => {
  try {
    const { userId } = req.query;
    const entry = await Timetable.findOneAndDelete({ _id: req.params.id, userId });
    if (!entry)
      return res.status(404).json({ success: false, message: "Not found or unauthorized" });
    res.json({ success: true, message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
