const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// Security Headers (Helmet)
// We configure it to allow cross-origin requests for resources (especially local dev with vite)
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// NoSQL Injection Protection
app.use(mongoSanitize());

// Middleware
app.use(cors({
  origin: function(origin, callback) {
    const allowedOrigins = [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      process.env.CLIENT_URL
    ].filter(Boolean);
    
    if (!origin || allowedOrigins.includes(origin) || origin.includes('vercel.app')) {
      return callback(null, true);
    }
    return callback(new Error('CORS Error: Origin not allowed'), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/parking/recommendations', require('./routes/parkingRecommendationRoutes'));
app.use('/api/parking/capacity', require('./routes/parkingCapacityRoutes'));
app.use('/api/parking/favorites', require('./routes/favoriteParkingRoutes'));
app.use('/api/parking/recent', require('./routes/recentParkingRoutes'));
app.use('/api/parking/availability', require('./routes/parkingAvailabilityRoutes'));
app.use('/api/parking', require('./routes/parkingRoutes'));
app.use('/api/reservations', require('./routes/reservationRoutes'));
app.use('/api/vehicles', require('./routes/vehicleRoutes'));
app.use('/api/visitors', require('./routes/visitorRoutes'));
app.use('/api/gate', require('./routes/gateRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/activity-logs', require('./routes/activityLogRoutes'));
app.use('/api/activity-history', require('./routes/activityHistoryRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/preferences', require('./routes/preferenceRoutes'));
app.use('/api/settings', require('./routes/systemSettingRoutes'));
app.use('/api/operations/calendar', require('./routes/operationsCalendarRoutes'));

// Health Route (Phase 12)
app.get('/api/health', (req, res) => {
  const mongoose = require('mongoose');
  const isDbConnected = mongoose.connection.readyState === 1;
  
  if (!isDbConnected) {
    return res.status(503).json({
      success: false,
      message: 'Database connection failed',
      environment: process.env.NODE_ENV || 'development'
    });
  }
  
  res.status(200).json({ 
    success: true, 
    message: 'ParkNexus API is running', 
    environment: process.env.NODE_ENV || 'development' 
  });
});

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));

  app.get('*', (req, res) =>
    res.sendFile(
      path.resolve(__dirname, '../', 'frontend', 'dist', 'index.html')
    )
  );
} else {
  app.get('/', (req, res) => res.send('Please set to production'));
}

app.use(notFound);
app.use(errorHandler);

module.exports = app;
