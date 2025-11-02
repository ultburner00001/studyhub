import mongoose from "mongoose";

const doubtSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    question: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

export default mongoose.model("Doubt", doubtSchema);
