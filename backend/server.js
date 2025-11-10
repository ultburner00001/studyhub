// backend/server.js (ESM) — enable CORS and handle preflight
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();
const app = express();

// --- CORS setup ---
// Use env var CORS_ORIGIN to restrict; default '*' (all origins)
const CORS_ORIGIN = process.env.CORS_ORIGIN || "*";

// If you want to allow credentials (cookies/Authorization header), set:
// - CORS_ORIGIN must be a specific origin (not '*')
// - then pass credentials: true
const corsOptions = {
  origin: CORS_ORIGIN,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: CORS_ORIGIN !== "*", // allow credentials if origin is specific
};

app.use(cors(corsOptions));
// Also explicitly respond to OPTIONS for all routes (preflight)
app.options("*", cors(corsOptions));

app.use(express.json());

// Optional MongoDB connection (if MONGO_URI provided)
const MONGO_URI = process.env.MONGO_URI || "";
if (MONGO_URI) {
  mongoose
    .connect(MONGO_URI)
    .then(() => console.log("✅ MongoDB connected"))
    .catch((err) => console.log("❌ MongoDB error:", err));
}

// Minimal schemas if using Mongo (optional)
const userSchema = new mongoose.Schema({ name: String, email: String, password: String });
const noteSchema = new mongoose.Schema({ userId: String, title: String, content: String });
const timetableSchema = new mongoose.Schema({ userId: String, day: String, start: String, end: String, title: String });

const User = mongoose.models.User || mongoose.model("User", userSchema);
const Note = mongoose.models.Note || mongoose.model("Note", noteSchema);
const Timetable = mongoose.models.Timetable || mongoose.model("Timetable", timetableSchema);

// In-memory fallback store if Mongo not present
const mem = { users: [], notes: [], timetables: [] };

// --- Routes ---
// Health
app.get("/", (req, res) => res.send("✅ StudyHub backend running with CORS"));

// Register
app.post("/api/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ success: false, message: "All fields required" });

  try {
    // try Mongo
    if (MONGO_URI) {
      const existing = await User.findOne({ email });
      if (existing) return res.json({ success: false, message: "Email already registered" });
      const user = new User({ name, email, password });
      await user.save();
      return res.json({ success: true, userId: user._id, name: user.name });
    }
    // fallback
    const id = "user_" + Math.random().toString(36).slice(2, 9);
    mem.users.push({ id, name, email, password });
    return res.json({ success: true, userId: id, name });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// Login
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    if (MONGO_URI) {
      const user = await User.findOne({ email, password });
      if (!user) return res.json({ success: false, message: "Invalid credentials" });
      return res.json({ success: true, userId: user._id, name: user.name });
    }
    const u = mem.users.find((u) => u.email === email && u.password === password);
    if (!u) return res.json({ success: false, message: "Invalid credentials" });
    return res.json({ success: true, userId: u.id, name: u.name });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get notes for user
app.get("/api/notes/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    if (MONGO_URI) {
      const notes = await Note.find({ userId });
      return res.json({ success: true, notes });
    }
    return res.json({ success: true, notes: mem.notes.filter((n) => n.userId === userId) });
  } catch (err) {
    console.error("Notes fetch error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// Create note
app.post("/api/notes", async (req, res) => {
  const { userId, title, content } = req.body;
  try {
    if (MONGO_URI) {
      const note = new Note({ userId, title, content });
      await note.save();
      return res.json({ success: true, note });
    }
    const note = { id: Date.now().toString(), userId, title, content };
    mem.notes.push(note);
    return res.json({ success: true, note });
  } catch (err) {
    console.error("Note create error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// Timetable: get by user
app.get("/api/timetable/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    if (MONGO_URI) {
      const t = await Timetable.find({ userId });
      return res.json({ success: true, timetable: t });
    }
    return res.json({ success: true, timetable: mem.timetables.filter((t) => t.userId === userId) });
  } catch (err) {
    console.error("Timetable fetch error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// Timetable: add row
app.post("/api/timetable", async (req, res) => {
  const { userId, day, start, end, title } = req.body;
  try {
    if (MONGO_URI) {
      const row = new Timetable({ userId, day, start, end, title });
      await row.save();
      return res.json({ success: true, row });
    }
    const row = { id: Date.now().toString(), userId, day, start, end, title };
    mem.timetables.push(row);
    return res.json({ success: true, row });
  } catch (err) {
    console.error("Timetable create error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server listening on port ${PORT} (CORS origin: ${CORS_ORIGIN})`));
