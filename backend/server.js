// Dependency Imports
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const net = require('net');
require('dotenv').config();

// Validate required environment variables early
if (!process.env.MONGODB_URI || !process.env.JWT_SECRET) {
  console.error('Missing required environment variables. Please set MONGODB_URI and JWT_SECRET in backend/.env');
  console.error('Copy backend/.env.example to backend/.env and fill in values, then restart the server. See README.md for details.');
  process.exit(1);
}

// Validate ALLOWED_ORIGINS in production
if (process.env.NODE_ENV === 'production' && !process.env.ALLOWED_ORIGINS) {
  console.error('ALLOWED_ORIGINS must be set in production for CORS configuration.');
  console.error('Set ALLOWED_ORIGINS in backend/.env with your production frontend URLs.');
  process.exit(1);
}

// Shared token helper
const { generateToken } = require('./utils/token');

// Express App Initialization
const app = express();

// Middleware Configuration
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS Configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['https://studyhub-rouge.vercel.app', 'http://127.0.0.1:3000'];
console.log('Allowed origins for CORS:', allowedOrigins);

function isOriginAllowed(origin, allowedOrigins) {
  for (let allowed of allowedOrigins) {
    allowed = allowed.trim();
    if (allowed === origin) return true;
    if (allowed.startsWith('*.')) {
      const domain = allowed.slice(2);
      if (origin === domain || origin.endsWith('.' + domain)) return true;
    }
  }
  return false;
}

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || isOriginAllowed(origin, allowedOrigins)) {
      callback(null, true);
    } else {
      console.error(`CORS blocked origin: ${origin}. Allowed origins: ${allowedOrigins.join(', ')}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  maxAge: 86400, // 24 hours preflight cache
};
app.use(cors(corsOptions));

// MongoDB Connection — connect and start server only after successful connection
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');

    const port = process.env.PORT || 5000;

    const server = app.listen(port, () => {
      console.log(`\n✅ Using configured port ${port}`);
      console.log(`🚀 StudyHub Backend Server Started!`);
      console.log(`📍 Port: ${port}`);
      console.log(`🌐 API: http://localhost:${port}/api`);
      console.log(`❤️  Health: http://localhost:${port}/api/health`);
      console.log(`⏰ Started at: ${new Date().toLocaleString()}`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`Port ${port} is already in use.`);
        console.error('To resolve this:');
        console.error('- On Windows: Run `netstat -ano | findstr :${port}` to find PID, then `taskkill /PID <PID> /F`');
        console.error('- On Unix/Mac: Run `lsof -ti:${port} | xargs kill -9`');
        console.error('- Alternatively, set PORT in backend/.env to a different value.');
        process.exit(1);
      } else {
        console.error('Server error:', err);
        process.exit(1);
      }
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Connection event listeners
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected');
});

// Graceful shutdown handlers
const shutdown = async () => {
  console.log('Shutting down gracefully...');
  await mongoose.connection.close();
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Model Imports
const User = require('./models/User');
const Note = require('./models/Note');
const Doubt = require('./models/Doubt');
const Timetable = require('./models/Timetable');

// Middleware Imports
const { auth, adminOnly } = require('./middleware/auth');

// Mount auth routes (exposes /api/auth/register, /api/auth/login, /api/auth/me)
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running'
  });
});

// Admin Dashboard Stats
app.get('/api/admin/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalNotes = await Note.countDocuments();
    const totalDoubts = await Doubt.countDocuments();
    const totalTimetables = await Timetable.countDocuments();

    // Get today's stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayUsers = await User.countDocuments({ createdAt: { $gte: today } });
    const todayNotes = await Note.countDocuments({ createdAt: { $gte: today } });
    const todayDoubts = await Doubt.countDocuments({ createdAt: { $gte: today } });

    // Get recent activity
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
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Admin Users Management
app.get('/api/admin/users', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const notesCount = await Note.countDocuments({ author: user._id });
        const doubtsCount = await Doubt.countDocuments({ author: user._id });
        const timetableCount = await Timetable.countDocuments({ author: user._id });

        return {
          ...user.toObject(),
          notesCount,
          doubtsCount,
          timetableCount
        };
      })
    );

    res.json({
      success: true,
      users: usersWithStats
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

app.delete('/api/admin/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    
    await User.findByIdAndDelete(userId);
    await Note.deleteMany({ author: userId });
    await Doubt.deleteMany({ author: userId });
    await Timetable.deleteMany({ author: userId });

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Admin Notes Management
app.get('/api/admin/notes', async (req, res) => {
  try {
    const notes = await Note.find()
      .populate('author', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      notes
    });
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

app.delete('/api/admin/notes/:id', async (req, res) => {
  try {
    await Note.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Note deleted successfully'
    });
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Admin Doubts Management
app.get('/api/admin/doubts', async (req, res) => {
  try {
    const doubts = await Doubt.find()
      .populate('author', 'name email')
      .populate('answers.author', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      doubts
    });
  } catch (error) {
    console.error('Get doubts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

app.delete('/api/admin/doubts/:id', async (req, res) => {
  try {
    await Doubt.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Doubt deleted successfully'
    });
  } catch (error) {
    console.error('Delete doubt error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

app.put('/api/admin/doubts/:id/resolve', async (req, res) => {
  try {
    const doubt = await Doubt.findById(req.params.id);
    
    if (!doubt) {
      return res.status(404).json({
        success: false,
        message: 'Doubt not found'
      });
    }

    doubt.isResolved = !doubt.isResolved;
    await doubt.save();

    res.json({
      success: true,
      message: `Doubt ${doubt.isResolved ? 'resolved' : 'unresolved'}`,
      doubt
    });
  } catch (error) {
    console.error('Resolve doubt error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Notes Routes
app.get('/api/notes', auth, async (req, res) => {
  try {
    const notes = await Note.find({ author: req.user._id }).sort({ updatedAt: -1 });
    res.json({
      success: true,
      notes
    });
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

app.post('/api/notes', auth, async (req, res) => {
  try {
    const { title, content, tags } = req.body;

    const note = new Note({
      title,
      content,
      tags: tags || [],
      author: req.user._id
    });

    await note.save();

    res.status(201).json({
      success: true,
      message: 'Note created successfully',
      note
    });
  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

app.put('/api/notes/:id', auth, async (req, res) => {
  try {
    const { title, content, tags } = req.body;

    const note = await Note.findOne({ _id: req.params.id, author: req.user._id });
    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    if (title) note.title = title;
    if (content) note.content = content;
    if (tags) note.tags = tags;

    await note.save();

    res.json({
      success: true,
      message: 'Note updated successfully',
      note
    });
  } catch (error) {
    console.error('Update note error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

app.delete('/api/notes/:id', auth, async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, author: req.user._id });
    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    await Note.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Note deleted successfully'
    });
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Doubts Routes
// Public: list all doubts
app.get('/api/doubts', async (req, res) => {
  try {
    const doubts = await Doubt.find()
      .populate('author', 'name avatar')
      .populate('answers.author', 'name avatar')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      doubts
    });
  } catch (error) {
    console.error('Get doubts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

app.post('/api/doubts', auth, async (req, res) => {
  try {
    const { question, description, tags } = req.body;

    const doubt = new Doubt({
      question,
      description,
      tags: tags || [],
      author: req.user._id
    });

    await doubt.save();
    await doubt.populate('author', 'name avatar');

    res.status(201).json({
      success: true,
      message: 'Doubt posted successfully',
      doubt
    });
  } catch (error) {
    console.error('Create doubt error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

app.post('/api/doubts/:id/answers', auth, async (req, res) => {
  try {
    const { text } = req.body;

    const doubt = await Doubt.findById(req.params.id);
    if (!doubt) {
      return res.status(404).json({
        success: false,
        message: 'Doubt not found'
      });
    }

    const answer = {
      text,
      author: req.user._id
    };

    doubt.answers.push(answer);
    await doubt.save();
    await doubt.populate('answers.author', 'name avatar');

    res.json({
      success: true,
      message: 'Answer added successfully',
      doubt
    });
  } catch (error) {
    console.error('Add answer error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// User-level resolve route: only the author or admin may toggle
app.put('/api/doubts/:id/resolve', auth, async (req, res) => {
  try {
    const doubt = await Doubt.findById(req.params.id);
    if (!doubt) {
      return res.status(404).json({ success: false, message: 'Doubt not found' });
    }

    // Allow if author or admin
    const requesterId = String(req.user._id || req.user.id);
    const authorId = String(doubt.author);

    if (requesterId !== authorId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to resolve this doubt' });
    }

    doubt.isResolved = !doubt.isResolved;
    await doubt.save();
    await doubt.populate('author', 'name avatar');

    res.json({ success: true, message: `Doubt ${doubt.isResolved ? 'resolved' : 'unresolved'}`, doubt });
  } catch (error) {
    console.error('Resolve doubt (user) error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Timetable Routes
app.get('/api/timetable', auth, async (req, res) => {
  try {
    let timetable = await Timetable.findOne({ author: req.user._id });
    
    if (!timetable) {
      timetable = new Timetable({
        author: req.user._id,
        schedule: [
          { day: 'Monday', slots: [] },
          { day: 'Tuesday', slots: [] },
          { day: 'Wednesday', slots: [] },
          { day: 'Thursday', slots: [] },
          { day: 'Friday', slots: [] },
          { day: 'Saturday', slots: [] },
          { day: 'Sunday', slots: [] }
        ]
      });
      await timetable.save();
    }

    res.json({
      success: true,
      timetable
    });
  } catch (error) {
    console.error('Get timetable error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

app.post('/api/timetable', auth, async (req, res) => {
  try {
    const { schedule } = req.body;

    let timetable = await Timetable.findOne({ author: req.user._id });

    if (timetable) {
      timetable.schedule = schedule;
    } else {
      timetable = new Timetable({
        schedule,
        author: req.user._id
      });
    }

    await timetable.save();

    res.json({
      success: true,
      message: 'Timetable saved successfully',
      timetable
    });
  } catch (error) {
    console.error('Save timetable error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Handle 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  res.status(500).json({ 
    success: false,
    message: 'Something went wrong!'
  });
});

// Server is started after successful MongoDB connection above
