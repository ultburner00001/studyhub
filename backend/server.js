import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import noteRoutes from "./routes/noteRoutes.js";
import timetableRoutes from "./routes/timetableRoutes.js";
import doubtRoutes from "./routes/doubtRoutes.js";
import courseRoutes from "./routes/courses.js";
import authRoutes from "./routes/authRoutes.js"; // ✅ Added

dotenv.config();
const app = express();

// Basic CORS (no restriction)
app.use(cors());
app.use(express.json());

// MongoDB
const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb+srv://ultburner00001_db_user:burner1234@studyhub.nwqwfgv.mongodb.net/?retryWrites=true&w=majority";

mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/timetable", timetableRoutes);
app.use("/api/doubts", doubtRoutes);
app.use("/api/courses", courseRoutes);

app.get("/", (req, res) => res.send("📚 StudyHub Backend Running"));

app.listen(process.env.PORT || 5000, () =>
  console.log(`🚀 Server running on port ${process.env.PORT || 5000}`)
);
