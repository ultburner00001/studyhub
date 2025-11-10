// ✅ ESM-compatible server.js for "type": "module"

import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Load .env variables
dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Example routes
app.get("/", (req, res) => {
  res.send("✅ StudyHub backend is running (ESM version)!");
});

// Example endpoint for login (fake simple)
app.post("/login", (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "Name required" });
  res.json({ message: `Welcome, ${name}!` });
});

// Example endpoint for notes (temporary in-memory data)
let notes = [];
app.get("/notes", (req, res) => {
  res.json(notes);
});

app.post("/notes", (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: "Note text required" });
  const note = { id: Date.now(), text };
  notes.push(note);
  res.json(note);
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
