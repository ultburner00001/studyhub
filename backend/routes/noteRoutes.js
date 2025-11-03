import express from "express";
import Note from "../models/Note.js";

const router = express.Router();

/**
 * ✅ Get all notes for a specific user
 * Send userId in query or request body (once auth is ready, we’ll extract from token)
 */
router.get("/", async (req, res) => {
  try {
    const { userId } = req.query; // e.g. /api/notes?userId=abc123
    if (!userId) return res.status(400).json({ success: false, message: "User ID required" });

    const notes = await Note.find({ userId }).sort({ createdAt: -1 });
    res.json({ success: true, data: notes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * ✅ Create a new note for the logged-in user
 */
router.post("/", async (req, res) => {
  try {
    const { title, content, subject, userId } = req.body;
    if (!userId) return res.status(400).json({ success: false, message: "User ID required" });

    const newNote = new Note({ title, content, subject, userId });
    await newNote.save();

    res.status(201).json({ success: true, data: newNote });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

/**
 * ✅ Delete a note (only by its owner)
 */
router.delete("/:id", async (req, res) => {
  try {
    const { userId } = req.query; // Verify note ownership
    const note = await Note.findOneAndDelete({ _id: req.params.id, userId });

    if (!note)
      return res.status(404).json({ success: false, message: "Note not found or unauthorized" });

    res.json({ success: true, message: "Note deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
