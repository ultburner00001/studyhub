import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import noteRoutes from "./routes/noteRoutes.js";
import timetableRoutes from "./routes/timetableRoutes.js";
import doubtRoutes from "./routes/doubtRoutes.js";
import courseRoutes from "./routes/courses.js";

dotenv.config();
const app = express();

// ✅ Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Allowed Origins — localhost, production, and all Vercel preview URLs
const allowedOrigins = [
  "http://localhost:3000",
  "https://studyhub-5gij.vercel.app",
  "https://studyhub-5gij-8u2vf7j6s-mehul-swamis-projects.vercel.app", // optional specific preview
];

// ✅ CORS configuration
app.use(
  cors({
    origin: function (origin, callback) {
      if (
        !origin || // Allow requests from server or tools like Postman
        allowedOrigins.includes(origin) ||
        /\.vercel\.app$/.test(origin) // Allow any Vercel preview URL
      ) {
        callback(null, true);
      } else {
        console.warn("🚫 Blocked by CORS:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// ✅ MongoDB Connection
const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb+srv://ultburner00001_db_user:burner1234@studyhub.nwqwfgv.mongodb.net/?retryWrites=true&w=majority";

mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.error("❌ MongoDB connection failed:", err.message));

// ✅ Routes
app.use("/api/notes", noteRoutes);
app.use("/api/timetable", timetableRoutes);
app.use("/api/doubts", doubtRoutes);
app.use("/api/courses", courseRoutes);

// ✅ Health Check Route
app.get("/", (req, res) => {
  res.status(200).send("📚 StudyHub Backend is running successfully!");
});

// ✅ 404 Error Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// ✅ Global Error Handler (optional)
app.use((err, req, res, next) => {
  console.error("🔥 Server error:", err.message);
  res.status(500).json({ success: false, message: err.message || "Server error" });
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT} — http://localhost:${PORT}`)
);
