import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import noteRoutes from "./routes/noteRoutes.js";
import timetableRoutes from "./routes/timetableRoutes.js";
import doubtRoutes from "./routes/doubtRoutes.js"; // ✅ Added (for AskDoubt.js)
import courseRoutes from "./routes/courses.js"; // ✅ Existing
// If you want authentication later, we’ll add authRoutes here

dotenv.config();
const app = express();

// ✅ Allowed origins (local + main vercel + preview subdomains)
const allowedOrigins = [
  "http://localhost:3000",
  "https://studyhub-5gij.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (
        !origin || // allow server-to-server requests
        allowedOrigins.includes(origin) ||
        /\.vercel\.app$/.test(origin) // allow Vercel preview deployments
      ) {
        callback(null, true);
      } else {
        console.warn("❌ Blocked by CORS:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());

// ✅ MongoDB connection
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
app.use("/api/doubts", doubtRoutes); // ✅ Added Ask Doubt route
app.use("/api/courses", courseRoutes); // ✅ Static courses route

// ✅ Health check route
app.get("/", (req, res) => {
  res.send("📚 StudyHub Backend is running successfully!");
});

// ✅ 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
