import mongoose from "mongoose";

const doubtSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subject: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, default: Date.now },
});

export default mongoose.model("Doubt", doubtSchema);
