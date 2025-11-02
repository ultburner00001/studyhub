// backend/models/Timetable.js
import mongoose from "mongoose";

const SlotSchema = new mongoose.Schema({
  time: String,
  subject: String,
  topic: String,
  isCompleted: Boolean,
});

const DaySchema = new mongoose.Schema({
  day: String,
  slots: [SlotSchema],
});

const TimetableSchema = new mongoose.Schema({
  schedule: [DaySchema],
});

export default mongoose.model("Timetable", TimetableSchema);
