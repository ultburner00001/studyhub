const mongoose = require('mongoose');

const TimetableSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  // store as array of day objects or simple JSON
  items: [
    {
      day: String,         // "Monday"
      start: String,       // "09:00"
      end: String,         // "10:00"
      title: String,       // "Math"
      location: String
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Timetable', TimetableSchema);
