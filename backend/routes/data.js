const express = require('express');
const auth = require('../middleware/auth');
const Timetable = require('../models/Timetable');
const Note = require('../models/Note');

const router = express.Router();

// Get user's timetable (create if not exist)
router.get('/timetable', auth, async (req, res) => {
  const userId = req.userId;
  let tt = await Timetable.findOne({ user: userId });
  if (!tt) {
    tt = await Timetable.create({ user: userId, items: [] });
  }
  res.json(tt);
});

// Update entire timetable
router.put('/timetable', auth, async (req, res) => {
  const userId = req.userId;
  const { items } = req.body;
  let tt = await Timetable.findOneAndUpdate({ user: userId }, { items }, { new: true, upsert: true });
  res.json(tt);
});

// Notes: list
router.get('/notes', auth, async (req, res) => {
  const notes = await Note.find({ user: req.userId }).sort({ updatedAt: -1 });
  res.json(notes);
});

// Create note
router.post('/notes', auth, async (req, res) => {
  const { title, content, tags = [] } = req.body;
  const note = await Note.create({ user: req.userId, title, content, tags });
  res.json(note);
});

// Update note
router.put('/notes/:id', auth, async (req, res) => {
  const { id } = req.params;
  const note = await Note.findOneAndUpdate({ _id: id, user: req.userId }, req.body, { new: true });
  if (!note) return res.status(404).json({ error: 'Note not found' });
  res.json(note);
});

// Delete note
router.delete('/notes/:id', auth, async (req, res) => {
  const { id } = req.params;
  await Note.findOneAndDelete({ _id: id, user: req.userId });
  res.json({ success: true });
});

module.exports = router;
