const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: String,
  content: String,
  tags: [String]
}, { timestamps: true });

module.exports = mongoose.model('Note', NoteSchema);
