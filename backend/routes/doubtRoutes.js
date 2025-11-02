// 📁 routes/doubtRoutes.js
import express from "express";
import Doubt from "../models/Doubt.js";

const router = express.Router();

// ✅ Get all doubts
router.get("/doubts", async (req, res) => {
  try {
    const doubts = await Doubt.find().sort({ createdAt: -1 });
    res.json({ success: true, data: doubts });
  } catch (err) {
    console.error("Error fetching doubts:", err);
    res.status(500).json({ success: false, message: "Failed to fetch doubts" });
  }
});

// ✅ Create a new doubt
router.post("/doubts", async (req, res) => {
  try {
    const { name, question, description, subject } = req.body;

    if (!question || question.trim() === "") {
      return res
        .status(400)
        .json({ success: false, message: "Question is required" });
    }

    const newDoubt = new Doubt({
      name: name || "Guest User",
      question,
      description,
      subject,
      answers: [],
    });

    const savedDoubt = await newDoubt.save();
    res.status(201).json({ success: true, data: savedDoubt });
  } catch (err) {
    console.error("Error saving doubt:", err);
    res.status(500).json({ success: false, message: "Failed to save doubt" });
  }
});

// ✅ Add an answer to a doubt
router.post("/doubts/:id/answers", async (req, res) => {
  try {
    const { id } = req.params;
    const { text, author } = req.body;

    if (!text || text.trim() === "") {
      return res
        .status(400)
        .json({ success: false, message: "Answer text is required" });
    }

    const doubt = await Doubt.findById(id);
    if (!doubt) {
      return res
        .status(404)
        .json({ success: false, message: "Doubt not found" });
    }

    doubt.answers.push({
      text,
      author: author || { name: "Anonymous" },
    });

    const updatedDoubt = await doubt.save();
    res.json({ success: true, data: updatedDoubt });
  } catch (err) {
    console.error("Error adding answer:", err);
    res.status(500).json({ success: false, message: "Failed to add answer" });
  }
});

// ✅ Delete a doubt (optional admin route)
router.delete("/doubts/:id", async (req, res) => {
  try {
    const deleted = await Doubt.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res
        .status(404)
        .json({ success: false, message: "Doubt not found" });
    res.json({ success: true, message: "Doubt deleted successfully" });
  } catch (err) {
    console.error("Error deleting doubt:", err);
    res.status(500).json({ success: false, message: "Failed to delete doubt" });
  }
});

export default router;
