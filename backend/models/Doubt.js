// 📁 models/Doubt.js
import mongoose from "mongoose";

const answerSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
      trim: true,
    },
    author: {
      name: { type: String, default: "Anonymous" },
    },
  },
  { timestamps: true }
);

const doubtSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: "Guest User",
    },
    question: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    subject: {
      type: String,
      trim: true,
    },
    answers: [answerSchema],
  },
  { timestamps: true }
);

export default mongoose.model("Doubt", doubtSchema);
