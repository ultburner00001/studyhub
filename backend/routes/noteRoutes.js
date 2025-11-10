import express from "express";
import Note from "../models/Note.js";

const router = express.Router();

// ✅ Get all notes for a specific user
router.get("/", async (req, res) => {
  try {
    const { userId } = req.query; // from frontend (localStorage)
    if (!userId)
      return res.status(400).json({ success: false, message: "Missing userId" });

    const notes = await Note.find({ userId }).sort({ createdAt: -1 });
    res.json({ success: true, data: notes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ✅ Create a new note
router.post("/", async (req, res) => {
  try {
    const { title, content, subject, userId } = req.body;
    if (!userId)
      return res.status(400).json({ success: false, message: "Missing userId" });

    const newNote = new Note({ title, content, subject, userId });
    await newNote.save();
    res.status(201).json({ success: true, data: newNote });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ✅ Delete a note
router.delete("/:id", async (req, res) => {
  try {
    const note = await Note.findByIdAndDelete(req.params.id);
    if (!note)
      return res.status(404).json({ success: false, message: "Note not found" });
    res.json({ success: true, message: "Note deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
