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
const serviceWorkerManager = require('./middleware/serviceWorkerManager');

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
// Add service worker management middleware
app.use(serviceWorkerManager);
// Configure CORS to accept requests from your frontend domain
// Using a simpler origin configuration with our known domains 
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, etc)
    if (!origin) return callback(null, true);

    // Parse allowed origins from environment variables
    const primaryDomain = process.env.CORS_ORIGIN || '';
    const allowedOriginsStr = process.env.ALLOWED_ORIGINS || '';

    // Create a comprehensive list of allowed origins
    const allowedOrigins = [
      primaryDomain,
      ...allowedOriginsStr.split(',').filter(Boolean),
      // Add any known variations that might be cached from previous deployments
      'https://ruchira-portfolio.vercel.app',
      'https://www.ruchira-portfolio.vercel.app'
    ].filter(Boolean);

    // For development environments, be more lenient
    if (process.env.NODE_ENV === 'development' || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      // For development/debugging - log rejected origins
      console.log(`CORS rejected origin: ${origin}`);
      console.log(`Allowed origins: ${allowedOrigins.join(', ')}`);
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

// Add global error handler for unhandled Promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

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

// Enhanced Service worker diagnostics endpoint with more detailed information
app.get('/api/service-worker-diagnostics', (req, res) => {
  // Special headers to help with service worker issues
  res.header('Service-Worker-Allowed', '/');
  // Only include Clear-Site-Data if explicitly requested via query param
  // to avoid accidentally clearing data during normal diagnostic checks
  if (req.query.clearData === 'true') {
    console.log('Client requested site data clearing via Clear-Site-Data header');
    res.header('Clear-Site-Data', '"cache", "cookies", "storage"');
  }

  // Enhanced response with more diagnostic information
  res.json({
    timestamp: new Date().toISOString(),
    serverTime: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    request: {
      userAgent: req.headers['user-agent'],
      origin: req.headers.origin || 'Unknown',
      referer: req.headers.referer || 'None',
      acceptEncoding: req.headers['accept-encoding'] || 'None',
      contentType: req.headers['content-type'] || 'None',
      serviceWorkerHeader: req.headers['service-worker'] || 'None'
    },
    corsSetup: {
      primaryDomain: process.env.CORS_ORIGIN || 'Not configured',
      allowedOrigins: process.env.ALLOWED_ORIGINS || 'Not configured'
    },
    responseSecurity: {
      corsEnabled: true,
      cacheControl: res.getHeader('Cache-Control') || 'Not set',
      contentSecurityPolicy: res.getHeader('Content-Security-Policy') || 'Not set'
    },
    serviceWorkerStatus: 'API is reachable',
    connectionInfo: {
      protocol: req.protocol,
      secure: req.secure,
      ip: req.ip,
      forwardedFor: req.headers['x-forwarded-for'] || 'None'
    },
    serverInfo: {
      nodeVersion: process.version,
      platform: process.platform,
      memoryUsage: process.memoryUsage().rss / (1024 * 1024) + 'MB'
    }
  });
});

// New endpoint specifically for service worker recovery
app.get('/api/service-worker-recovery', (req, res) => {
  // Set aggressive headers to help browsers clean up problem service workers
  res.header('Service-Worker-Allowed', '/');
  res.header('Clear-Site-Data', '"cache", "cookies", "storage"');
  res.header('Cache-Control', 'no-cache, no-store, must-revalidate, private');
  res.header('Pragma', 'no-cache');
  res.header('Expires', '0');

  res.json({
    timestamp: new Date().toISOString(),
    action: 'recovery',
    instructions: 'Browser was instructed to clear site data',
    nextSteps: 'Reload the page completely'
  });
});

// Dedicated endpoint for service worker testing
app.get('/api/test-service-worker', (req, res) => {
  // This endpoint intentionally returns different cache headers based on query parameters
  // to help test service worker behavior with different caching strategies

  const { cache } = req.query;

  if (cache === 'long') {
    // Test with long cache
    res.header('Cache-Control', 'public, max-age=31536000'); // 1 year
  } else if (cache === 'no-store') {
    // Test with no-store directive
    res.header('Cache-Control', 'no-store, must-revalidate');
    res.header('Pragma', 'no-cache');
  } else if (cache === 'etag') {
    // Test with ETag-based caching
    const etag = `"${Math.random().toString(36).substring(2, 15)}"`;
    res.header('ETag', etag);
    res.header('Cache-Control', 'no-cache');

    // Check if the request has a matching If-None-Match header
    const ifNoneMatch = req.headers['if-none-match'];
    if (ifNoneMatch && ifNoneMatch.includes(etag)) {
      return res.status(304).end(); // Not Modified
    }
  }

  res.json({
    timestamp: new Date().toISOString(),
    cacheMode: cache || 'default',
    randomValue: Math.random().toString(36).substring(2, 15),
    serviceWorkerTest: true
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
