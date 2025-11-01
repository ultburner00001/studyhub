import express from "express";
import Note from "../models/Note.js";
const router = express.Router();

router.get("/", async (req, res) => {
  const notes = await Note.find();
  res.json(notes);
});

router.post("/", async (req, res) => {
  try {
    const note = await Note.create(req.body);
    res.json({ success: true, note });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
