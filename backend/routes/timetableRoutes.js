import express from "express";
import Timetable from "../models/Timetable.js";

const router = express.Router();

// ✅ Get all timetable entries for a user
router.get("/", async (req, res) => {
  try {
    const userId = req.query.userId;
    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID required" });
    }

    const timetable = await Timetable.find({ userId }).sort({ day: 1 });
    res.json({ success: true, data: timetable });
  } catch (err) {
    console.error("Error fetching timetable:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ✅ Add a new entry
router.post("/", async (req, res) => {
  try {
    const { day, subject, time, userId } = req.body;
    if (!userId || !day || !subject || !time) {
      return res
        .status(400)
        .json({ success: false, message: "Missing fields (userId, day, subject, time)" });
    }

    const newEntry = new Timetable({ userId, day, subject, time });
    await newEntry.save();
    res.status(201).json({ success: true, data: newEntry });
  } catch (err) {
    console.error("Error creating timetable entry:", err);
    res.status(400).json({ success: false, message: err.message });
  }
});

// ✅ Delete an entry
router.delete("/:id", async (req, res) => {
  try {
    const userId = req.query.userId;
    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID required" });
    }

    const entry = await Timetable.findOneAndDelete({ _id: req.params.id, userId });
    if (!entry) {
      return res.status(404).json({ success: false, message: "Entry not found" });
    }

    res.json({ success: true, message: "Entry deleted successfully" });
  } catch (err) {
    console.error("Error deleting timetable entry:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
