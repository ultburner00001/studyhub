// ---------------------------
// 📦 Dependency Imports
// ---------------------------
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// ---------------------------
// ✅ Environment Variable Validation
// ---------------------------
if (!process.env.MONGODB_URI || !process.env.JWT_SECRET) {
  console.error('❌ Missing required environment variables: MONGODB_URI or JWT_SECRET.');
  process.exit(1);
}

// ---------------------------
// 🧩 Shared Utils & Models
// ---------------------------
const { generateToken } = require('./utils/token');
const User = require('./models/User');
const Note = require('./models/Note');
const Doubt = require('./models/Doubt');
const Timetable = require('./models/Timetable');
const { auth, adminOnly } = require('./middleware/auth');

// ---------------------------
// 🚀 Express App Initialization
// ---------------------------
const app = express();

// ---------------------------
// 🌐 CORS Configuration
// ---------------------------
const allowedOrigins = [
  'https://studyhub-rouge.vercel.app',
  'https://studyhub-cqor2e33g-siddharth-amraotkars-u.projects.vercel.app',
  'http://localhost:3000',
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // Allow requests with no origin (mobile apps, Postman)
      if (allowedOrigins.includes(origin)) return callback(null, true);
      console.warn(`🚫 Blocked by CORS: ${origin}`);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Allow preflight (CORS) checks
app.options('*', cors());

// ---------------------------
// ⚙️ Middleware
// ---------------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---------------------------
// 🧠 MongoDB Connection
// ---------------------------
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');

    const port = process.env.PORT || 5000;
    const baseURL =
      process.env.NODE_ENV === 'production'
        ? process.env.RENDER_EXTERNAL_URL || 'https://studyhub-21ux.onrender.com'
        : `http://localhost:${port}`;

    app.listen(port, () => {
      console.log(`🚀 StudyHub Backend running on port ${port}`);
      console.log(`🌐 API base: ${baseURL}/api`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// ---------------------------
// 🧭 Routes
// ---------------------------

// Auth Routes
app.use('/api/auth', require('./routes/auth'));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server is running fine ✅' });
});

// ---------------------------
// 👑 Admin Dashboard Stats
// ---------------------------
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
      ...recentUsers.map((user) => ({
        type: 'user',
        action: 'registered',
        title: user.name,
        user: 'System',
        time: user.createdAt,
      })),
      ...recentNotes.map((note) => ({
        type: 'note',
        action: 'created',
        title: note.title,
        user: note.author.name,
        time: note.createdAt,
      })),
      ...recentDoubts.map((doubt) => ({
        type: 'doubt',
        action: 'asked',
        title: doubt.question,
        user: doubt.author.name,
        time: doubt.createdAt,
      })),
    ]
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .slice(0, 6);

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
        recentActivity,
      },
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ---------------------------
// 📝 Notes Routes
// ---------------------------
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

// ---------------------------
// 🚫 Fallback & Error Handling
// ---------------------------
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: 'API endpoint not found' });
});

app.use((err, req, res, next) => {
  console.error('💥 Unhandled Error:', err);
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ success: false, message: 'CORS error: Origin not allowed' });
  }
  res.status(500).json({ success: false, message: 'Something went wrong!' });
});
