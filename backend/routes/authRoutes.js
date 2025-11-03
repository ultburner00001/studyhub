import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// ✅ Register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: "All fields required" });

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ success: false, message: "Email already registered" });

    const user = new User({ name, email, password });
    await user.save();

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ success: true, token, user: { id: user._id, name, email } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ success: false, message: "Invalid credentials" });

    const match = await user.comparePassword(password);
    if (!match)
      return res.status(400).json({ success: false, message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ success: true, token, user: { id: user._id, name: user.name, email } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
