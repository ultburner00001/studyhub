import express from "express";
import Doubt from "../models/Doubt.js";

const router = express.Router();

// ✅ Get all doubts
router.get("/", async (req, res) => {
  try {
    const doubts = await Doubt.find().sort({ date: -1 });
    res.status(200).json({ success: true, data: doubts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ Add a new doubt
router.post("/", async (req, res) => {
  try {
    const { title, subject, description } = req.body;
    const newDoubt = new Doubt({ title, subject, description });
    await newDoubt.save();
    res.status(201).json({ success: true, data: newDoubt });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// ✅ Delete a doubt
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Doubt.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Doubt not found" });
    }
    res.status(200).json({ success: true, message: "Doubt deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
