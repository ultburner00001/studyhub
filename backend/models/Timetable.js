import mongoose from "mongoose";

const timetableSchema = new mongoose.Schema({
  day: { type: String, required: true },
  subject: { type: String, required: true },
  time: { type: String, required: true },
  teacher: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Timetable", timetableSchema);
