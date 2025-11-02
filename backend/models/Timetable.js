// models/Timetable.js
import mongoose from "mongoose";

const timetableSchema = new mongoose.Schema({
  schedule: [
    {
      day: String,
      slots: [
        {
          time: String,
          subject: String,
          topic: String,
          isCompleted: Boolean,
        },
      ],
    },
  ],
});

export default mongoose.model("Timetable", timetableSchema);
