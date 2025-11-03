import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import noteRoutes from "./routes/noteRoutes.js";
import timetableRoutes from "./routes/timetableRoutes.js";
import doubtRoutes from "./routes/doubtRoutes.js";
import courseRoutes from "./routes/courses.js";
import authRoutes from "./routes/authRoutes.js"; // ✅ Added for login/register

dotenv.config();
const app = express();

// ✅ Enable CORS (simple, global)
app.use(
  cors({
    origin: "*", // You can restrict this later if needed
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);
app.use(express.json());

// ✅ MongoDB Connection
const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb+srv://ultburner00001_db_user:burner1234@studyhub.nwqwfgv.mongodb.net/?retryWrites=true&w=majority";

mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ✅ API Routes
app.use("/api/auth", authRoutes); // login/register
app.use("/api/notes", noteRoutes); // notes per user
app.use("/api/timetable", timetableRoutes); // timetable per user
app.use("/api/doubts", doubtRoutes); // ask doubts
app.use("/api/courses", courseRoutes); // static course data

// ✅ Health Check Route
app.get("/", (req, res) => {
  res.send("📚 StudyHub Backend is running successfully!");
});

// ✅ 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
