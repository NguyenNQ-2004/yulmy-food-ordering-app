const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * JWT authentication middleware.
 * Extracts Bearer token from Authorization header,
 * verifies it, and attaches the full user document to req.user.
 * Also checks if the user is blocked.
 */
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'yulmy_secret_key');

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, user not found',
      });
    }

    if (user.status === 'blocked') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been blocked',
      });
    }

    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token.',
    });
  }
};

/**
 * Role-based access control middleware.
 * Usage: requireRole('restaurant_owner') or requireRole('admin', 'restaurant_owner')
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to access this resource.',
      });
    }

    next();
  };
};

/**
 * Convenience middleware: admin-only access.
 */
const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required',
    });
  }

  return next();
};

// Export both naming conventions for backward compatibility.
// - `protect` / `adminOnly` used by Nguyen/Duy/Ngoc's routes
// - `authMiddleware` / `requireRole` used by Manh's owner/chat/AI routes
module.exports = {
  protect,
  authMiddleware: protect,
  requireRole,
  adminOnly,
};
