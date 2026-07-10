const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : null;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token missing',
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'yulmy_secret_key'
    );

    req.user = decoded;
    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, token invalid',
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
