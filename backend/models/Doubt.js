import mongoose from "mongoose";

const doubtSchema = new mongoose.Schema({
  name: { type: String },
  question: { type: String, required: true },
  subject: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Doubt", doubtSchema);
