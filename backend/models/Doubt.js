import mongoose from "mongoose";

const doubtSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      default: "Anonymous",
    },
    subject: {
      type: String,
      trim: true,
    },
    question: {
      type: String,
      required: [true, "Question is required"],
      trim: true,
      minlength: [5, "Question must be at least 5 characters long"],
    },
    status: {
      type: String,
      enum: ["Pending", "Answered"],
      default: "Pending",
    },
  },
  {
    timestamps: true, // automatically adds createdAt and updatedAt
  }
);

export default mongoose.model("Doubt", doubtSchema);
