// ✅ Simple StudyHub backend (ESM, Render-ready)
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// ✅ MongoDB Atlas connection (optional)
// If you don’t have it, comment this section and data will be stored in memory.
const MONGO_URI = process.env.MONGO_URI || "";
if (MONGO_URI) {
  mongoose
    .connect(MONGO_URI)
    .then(() => console.log("✅ MongoDB connected"))
    .catch((err) => console.log("❌ MongoDB error:", err));
}

// ✅ Schemas
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
});
const noteSchema = new mongoose.Schema({
  userId: String,
  title: String,
  content: String,
});
const timetableSchema = new mongoose.Schema({
  userId: String,
  day: String,
  start: String,
  end: String,
  title: String,
});

const User = mongoose.models.User || mongoose.model("User", userSchema);
const Note = mongoose.models.Note || mongoose.model("Note", noteSchema);
const Timetable = mongoose.models.Timetable || mongoose.model("Timetable", timetableSchema);

// ✅ In-memory fallback if Mongo not connected
const mem = { users: [], notes: [], timetables: [] };

// --- ROUTES ---

// ✅ Register
app.post("/api/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.json({ success: false, message: "All fields required" });

  try {
    const existing = await User.findOne({ email });
    if (existing) return res.json({ success: false, message: "Email already registered" });

    const user = new User({ name, email, password });
    await user.save();
    res.json({ success: true, userId: user._id, name: user.name });
  } catch {
    // fallback (in-memory)
    const id = "user_" + Math.random().toString(36).slice(2, 9);
    mem.users.push({ id, name, email, password });
    res.json({ success: true, userId: id, name });
  }
});

// ✅ Login
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email, password });
    if (!user) return res.json({ success: false, message: "Invalid credentials" });
    res.json({ success: true, userId: user._id, name: user.name });
  } catch {
    const u = mem.users.find((u) => u.email === email && u.password === password);
    if (!u) return res.json({ success: false, message: "Invalid credentials" });
    res.json({ success: true, userId: u.id, name: u.name });
  }
});

// ✅ Notes CRUD
app.get("/api/notes/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const notes = await Note.find({ userId });
    res.json({ success: true, notes });
  } catch {
    res.json({ success: true, notes: mem.notes.filter((n) => n.userId === userId) });
  }
});

app.post("/api/notes", async (req, res) => {
  const { userId, title, content } = req.body;
  try {
    const note = new Note({ userId, title, content });
    await note.save();
    res.json({ success: true, note });
  } catch {
    const n = { id: Date.now().toString(), userId, title, content };
    mem.notes.push(n);
    res.json({ success: true, note: n });
  }
});

app.delete("/api/notes/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await Note.findByIdAndDelete(id);
    res.json({ success: true });
  } catch {
    mem.notes = mem.notes.filter((n) => n.id !== id);
    res.json({ success: true });
  }
});

// ✅ Timetable
app.get("/api/timetable/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const t = await Timetable.find({ userId });
    res.json({ success: true, timetable: t });
  } catch {
    res.json({ success: true, timetable: mem.timetables.filter((t) => t.userId === userId) });
  }
});

app.post("/api/timetable", async (req, res) => {
  const { userId, day, start, end, title } = req.body;
  try {
    const row = new Timetable({ userId, day, start, end, title });
    await row.save();
    res.json({ success: true, row });
  } catch {
    const r = { id: Date.now().toString(), userId, day, start, end, title };
    mem.timetables.push(r);
    res.json({ success: true, row: r });
  }
});

// ✅ Base route
app.get("/", (req, res) => res.send("✅ StudyHub backend running"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server on ${PORT}`));
