const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, no token',
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
      message: 'Not authorized, token failed',
    });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required',
    });
  }

  return next();
};

module.exports = {
  protect,
  adminOnly,
};
