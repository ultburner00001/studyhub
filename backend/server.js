// Dependency Imports
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Validate required environment variables early
if (!process.env.MONGODB_URI || !process.env.JWT_SECRET) {
  console.error('Missing required environment variables. Please set MONGODB_URI and JWT_SECRET in backend/.env');
  process.exit(1);
}

// Shared token helper
const { generateToken } = require('./utils/token');

// Express App Initialization
const app = express();

// ✅ Configure CORS properly for production + dev
const allowedOrigins = [
  'https://studyhub-rouge.vercel.app',
  'http://localhost:3000'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log("❌ Blocked by CORS:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));

// Middleware Configuration
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection — connect and start server only after successful connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');

    const port = process.env.PORT || 5000;
    app.listen(port, () => {
      console.log(`🚀 StudyHub Backend running on port ${port}`);
      console.log(`🌐 API base: http://localhost:${port}/api`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// Model Imports
const User = require('./models/User');
const Note = require('./models/Note');
const Doubt = require('./models/Doubt');
const Timetable = require('./models/Timetable');

// Middleware Imports
const { auth, adminOnly } = require('./middleware/auth');

// Mount auth routes (exposes /api/auth/register, /api/auth/login, /api/auth/me)
app.use('/api/auth', require('./routes/auth'));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server is running fine ✅' });
});

// Admin Dashboard Stats
app.get('/api/admin/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalNotes = await Note.countDocuments();
    const totalDoubts = await Doubt.countDocuments();
    const totalTimetables = await Timetable.countDocuments();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayUsers = await User.countDocuments({ createdAt: { $gte: today } });
    const todayNotes = await Note.countDocuments({ createdAt: { $gte: today } });
    const todayDoubts = await Doubt.countDocuments({ createdAt: { $gte: today } });

    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(3);
    const recentNotes = await Note.find().populate('author', 'name').sort({ createdAt: -1 }).limit(3);
    const recentDoubts = await Doubt.find().populate('author', 'name').sort({ createdAt: -1 }).limit(3);

    const recentActivity = [
      ...recentUsers.map(user => ({
        type: 'user',
        action: 'registered',
        title: user.name,
        user: 'System',
        time: user.createdAt
      })),
      ...recentNotes.map(note => ({
        type: 'note',
        action: 'created',
        title: note.title,
        user: note.author.name,
        time: note.createdAt
      })),
      ...recentDoubts.map(doubt => ({
        type: 'doubt',
        action: 'asked',
        title: doubt.question,
        user: doubt.author.name,
        time: doubt.createdAt
      }))
    ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 6);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalNotes,
        totalDoubts,
        totalTimetables,
        todayUsers,
        todayNotes,
        todayDoubts,
        recentActivity
      }
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Example Notes Routes
app.get('/api/notes', auth, async (req, res) => {
  try {
    const notes = await Note.find({ author: req.user._id }).sort({ updatedAt: -1 });
    res.json({ success: true, notes });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.post('/api/notes', auth, async (req, res) => {
  try {
    const note = new Note({
      title: req.body.title,
      content: req.body.content,
      tags: req.body.tags || [],
      author: req.user._id,
    });
    await note.save();
    res.status(201).json({ success: true, note });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Fallback for unknown endpoints
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: 'API endpoint not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ success: false, message: 'Something went wrong!' });
});
