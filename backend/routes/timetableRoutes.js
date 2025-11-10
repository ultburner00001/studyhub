import express from "express";
import Timetable from "../models/Timetable.js";

const router = express.Router();

// ✅ Get timetable for a user
router.get("/", async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId)
      return res.status(400).json({ success: false, message: "Missing userId" });

    const timetable = await Timetable.findOne({ userId });
    if (!timetable)
      return res.json({ success: true, data: { schedule: [] } }); // default empty
    res.json({ success: true, data: timetable });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ✅ Save or update timetable for a user
router.post("/", async (req, res) => {
  try {
    const { userId, schedule } = req.body;
    if (!userId)
      return res.status(400).json({ success: false, message: "Missing userId" });

    let timetable = await Timetable.findOne({ userId });
    if (timetable) {
      timetable.schedule = schedule;
      await timetable.save();
    } else {
      timetable = new Timetable({ userId, schedule });
      await timetable.save();
    }

    res.json({ success: true, message: "Timetable saved successfully", data: timetable });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
