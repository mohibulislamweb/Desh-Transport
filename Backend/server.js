process.env.TZ = 'Asia/Dhaka';
const express = require('express');
const cors = require('cors');
const path = require('path');
const dbConnection = require('./database/dbConnection');

// Routes Import
const adminRoutes = require('./routes/adminRoutes');
const driverRoutes = require('./routes/driverRoutes');
const tripRoutes = require('./routes/tripRoutes');

// Env Config path setup
require('dotenv').config({ path: path.join(__dirname, 'config', 'config.env') });

// Startup Environment Validation
if (!process.env.JWT_SECRET) {
  console.warn('⚠️ WARNING: JWT_SECRET variable missing. Setting fallback key.');
  process.env.JWT_SECRET = 'default_jwt_secret_key_123';
}

const app = express();

// Render/Vercel প্রক্সির জন্য সেটআপ
app.set('trust proxy', 1);

// NoSQL Injection আটকানোর জন্য সনাতন ফিল্টার
require('mongoose').set('sanitizeFilter', true);

// ===============================
// CORS Configuration (FRONTEND_URL Support)
// ===============================
const allowedOrigins = (process.env.FRONTEND_URL || process.env.ALLOWED_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim().replace(/\/$/, ''))
  .filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    const allowed =
      allowedOrigins.includes(origin) ||
      /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
    callback(null, allowed);
  },
  credentials: true
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '100kb' }));

// ===============================
// API Routes
// ===============================
app.use('/api/admin', adminRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/trips', tripRoutes);

// ===============================
// Server Test Route
// ===============================
app.get('/', (req, res) => {
  res.send('🚚 দেশ ট্রান্সপোর্ট এজেন্সির সার্ভার চালু আছে');
});

// ===============================
// 404 + Central Error Handler
// ===============================
app.use((req, res) => {
  res.status(404).json({ message: 'এই API পাওয়া যায় নি' });
});

app.use((error, req, res, next) => {
  if (error.name === 'CastError' || error.name === 'ValidationError') {
    return res.status(400).json({ message: 'পাঠানো তথ্য সঠিক নয়' });
  }

  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'পাঠানো তথ্য সঠিক নয় (Invalid JSON)' });
  }

  console.error('❌ Server error:', error);
  res.status(500).json({ message: 'সার্ভারে সমস্যা হয়েছে, আবার চেষ্টা করুন' });
});

// ===============================
// Database Connect & Server Start
// ===============================
const PORT = process.env.PORT || 4000;

dbConnection()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Failed to start server due to DB connection issue:', err);
  });

module.exports = app;