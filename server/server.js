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

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middleware
app.use(helmet()); // Set security headers
app.use(xss()); // Prevent XSS attacks
app.use(mongoSanitize()); // Sanitize data to prevent NoSQL injection
app.use(globalLimiter); // Rate limiting

// Regular Middleware
app.use(cors());
app.use(express.json({ limit: '10kb' }));  // Limit JSON body size

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.log('MongoDB connection error: ', err));

// Base route
app.get('/', (req, res) => {
  res.send('Portfolio API is running');
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
