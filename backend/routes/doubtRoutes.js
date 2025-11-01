import express from "express";
import Doubt from "../models/Doubt.js";
const router = express.Router();

router.get("/", async (req, res) => {
  const doubts = await Doubt.find();
  res.json(doubts);
});

router.post("/", async (req, res) => {
  try {
    const doubt = await Doubt.create(req.body);
    res.json({ success: true, doubt });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
