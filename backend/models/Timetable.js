import mongoose from "mongoose";

const slotSchema = new mongoose.Schema({
  time: String,
  subject: String,
  topic: String,
});

const daySchema = new mongoose.Schema({
  day: String,
  slots: [slotSchema],
});

const timetableSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true }, // ✅ each user has their own timetable
    schedule: [daySchema],
  },
  { timestamps: true }
);

export default mongoose.model("Timetable", timetableSchema);
