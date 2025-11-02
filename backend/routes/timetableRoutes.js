// backend/routes/timetableRoutes.js
import express from "express";
import Timetable from "../models/Timetable.js";

const router = express.Router();

// 🧩 GET timetable (read from MongoDB)
router.get("/", async (req, res) => {
  try {
    const timetable = await Timetable.find().lean();

    if (!timetable || timetable.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No timetable found yet",
        timetable: [],
      });
    }

    // ✅ Format the output for readability
    const formatted = timetable.map((entry) => ({
      _id: entry._id,
      schedule: entry.schedule.map((dayObj) => ({
        day: dayObj.day,
        slots: dayObj.slots.map((slot) => ({
          time: slot.time,
          subject: slot.subject,
          topic: slot.topic || "—",
        })),
      })),
    }));

    res.status(200).json({
      success: true,
      count: formatted.length,
      timetable: formatted,
    });
  } catch (error) {
    console.error("❌ Error fetching timetable:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// 🧩 POST timetable (save/update)
router.post("/", async (req, res) => {
  try {
    const { schedule } = req.body;

    if (!schedule) {
      return res
        .status(400)
        .json({ success: false, message: "Schedule is required" });
    }

    // Overwrite existing or create new
    let existing = await Timetable.findOne();
    if (existing) {
      existing.schedule = schedule;
      await existing.save();
    } else {
      existing = await Timetable.create({ schedule });
    }

    res.status(200).json({ success: true, message: "Timetable saved", data: existing });
  } catch (error) {
    console.error("❌ Error saving timetable:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

export default router;
