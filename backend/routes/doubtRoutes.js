import express from "express";
import Doubt from "../models/Doubt.js";

const router = express.Router();

// ✅ Get all doubts
router.get("/", async (req, res) => {
  try {
    const doubts = await Doubt.find().sort({ createdAt: -1 });
    res.json({ success: true, data: doubts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ✅ Post a new doubt
router.post("/", async (req, res) => {
  try {
    const { name, question, subject } = req.body;
    const newDoubt = new Doubt({ name, question, subject });
    await newDoubt.save();
    res.status(201).json({ success: true, data: newDoubt });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ✅ Delete a doubt
router.delete("/:id", async (req, res) => {
  try {
    const doubt = await Doubt.findByIdAndDelete(req.params.id);
    if (!doubt) return res.status(404).json({ success: false, message: "Doubt not found" });
    res.json({ success: true, message: "Doubt deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
