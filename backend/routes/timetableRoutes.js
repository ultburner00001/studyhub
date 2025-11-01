import express from "express";
import Timetable from "../models/Timetable.js";
const router = express.Router();

router.get("/", async (req, res) => {
  const data = await Timetable.find();
  res.json(data);
});

router.post("/", async (req, res) => {
  try {
    const item = await Timetable.create(req.body);
    res.json({ success: true, item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
