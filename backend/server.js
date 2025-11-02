import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import noteRoutes from "./routes/noteRoutes.js";
import timetableRoutes from "./routes/timetableRoutes.js";
import doubtRoutes from "./routes/doubtRoutes.js";

dotenv.config();
const app = express();

// ✅ Allowed Origins (Frontend URLs)
const allowedOrigins = [
  "http://localhost:5173", // Local dev
  "http://localhost:3000",
  "https://studyhub-21ux.vercel.app", // Your Vercel frontend
  "https://studyhub-git-main-siddharth-amraotkars-projects.vercel.app/", // optional preview builds
];

// ✅ CORS Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g., server-to-server, curl)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`❌ Blocked by CORS: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());

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
  .catch((err) => console.error("❌ MongoDB connection failed:", err));

// ✅ API Routes
app.use("/api/notes", noteRoutes);
app.use("/api/timetable", timetableRoutes);
app.use("/api/doubts", doubtRoutes);

// ✅ Health check route
app.get("/", (req, res) => {
  res.send("📚 StudyHub Backend is running successfully!");
});

// ✅ 404 route handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
