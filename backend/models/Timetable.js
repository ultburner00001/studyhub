import mongoose from "mongoose";

const timetableSchema = new mongoose.Schema(
  {
    day: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    startTime: { type: String, required: true, trim: true },
    endTime: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

export default mongoose.model("Timetable", timetableSchema);
