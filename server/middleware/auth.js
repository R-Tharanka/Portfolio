const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

// Protect routes
exports.protect = async (req, res, next) => {
  let token;

  // Check if token exists in headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Set token from Bearer token
    token = req.headers.authorization.split(' ')[1];
  }

  // Check if token exists
  if (!token) {
    return res.status(401).json({ msg: 'Not authorized to access this route' });
  }
  try {
    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log(`Token verified successfully. Expires in: ${decoded.exp - Math.floor(Date.now() / 1000)} seconds`);
    } catch (jwtError) {
      console.error('JWT verification failed:', jwtError.message);
      return res.status(401).json({ msg: 'Token invalid or expired, please log in again' });
    }

    // Double check token expiration explicitly
    const currentTimestamp = Math.floor(Date.now() / 1000);
    if (decoded.exp <= currentTimestamp) {
      console.log('Token expired explicitly:', new Date(decoded.exp * 1000).toISOString());
      return res.status(401).json({ msg: 'Token expired, please log in again' });
    }

    // Get admin from the token
    req.admin = await Admin.findById(decoded.id);
    
    if (!req.admin) {
      return res.status(401).json({ msg: 'Not authorized to access this route' });
    }

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ msg: 'Not authorized to access this route' });
  }
};
