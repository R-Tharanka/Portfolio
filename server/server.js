const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
require('dotenv').config();

// Import routes
const skillsRoutes = require('./routes/skills');
const projectsRoutes = require('./routes/projects');
const educationRoutes = require('./routes/education');
const contactRoutes = require('./routes/contact');
const authRoutes = require('./routes/auth');

// Import middleware
const { globalLimiter, notFound, errorHandler } = require('./middleware/errorHandler');
const corsHeadersMiddleware = require('./middleware/corsHeaders');

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy - important for Railway/Heroku/etc. that use reverse proxies
// This ensures that X-Forwarded-For headers are trusted for determining client IP
app.set('trust proxy', 1);

// Security Middleware
app.use(helmet()); // Set security headers
app.use(xss()); // Prevent XSS attacks
app.use(mongoSanitize()); // Sanitize data to prevent NoSQL injection
app.use(globalLimiter); // Rate limiting

// Regular Middleware
// Apply custom CORS headers middleware
app.use(corsHeadersMiddleware);
// Configure CORS to accept requests from your frontend domain
// Using a simpler origin configuration with our known domains
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, etc)
    if (!origin) return callback(null, true);

    // Parse allowed origins from environment variables
    const primaryDomain = process.env.CORS_ORIGIN || '';
    const allowedOriginsStr = process.env.ALLOWED_ORIGINS || '';
    const allowedOrigins = [
      primaryDomain,
      ...allowedOriginsStr.split(',').filter(Boolean)
    ].filter(Boolean);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      // For development/debugging - log rejected origins
      console.log(`CORS rejected origin: ${origin}`);
      callback(new Error(`CORS not allowed for origin: ${origin}`), false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'Pragma',
    'Expires'
  ],
  exposedHeaders: ['Content-Length', 'ETag'],
  preflightContinue: false,
  optionsSuccessStatus: 204,
  maxAge: 86400 // Cache preflight for 24 hours
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10kb' }));  // Limit JSON body size

// Handle OPTIONS preflight requests explicitly 
app.options('*', cors(corsOptions));

// Connect to MongoDB with improved options and retry logic
const connectDB = async () => {
  try {
    const mongoOptions = {
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    };
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, mongoOptions);
    console.log('Connected to MongoDB successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    console.log('Retrying connection in 5 seconds...');
    setTimeout(connectDB, 5000); // Retry after 5 seconds
  }
};

connectDB();

// Base route
app.get('/', (req, res) => {
  res.send('Portfolio API is running');
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  // Check if MongoDB is connected
  const dbStatus = mongoose.connection.readyState === 1 ?
    'Connected' : 'Disconnected';

  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: {
      status: dbStatus
    }
  });
});

// Mount routes
app.use('/api/skills', skillsRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/education', educationRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/auth', authRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
