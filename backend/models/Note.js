import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true }, // ✅ added for user-specific notes
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true, trim: true },
    subject: { type: String, trim: true },
  },
  { timestamps: true }
);

export default mongoose.model("Note", noteSchema);
