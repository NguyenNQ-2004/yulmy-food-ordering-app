const express = require('express');
const router = express.Router();
const {
  login,
  register,
  resetPassword,
  getCurrentUser,
  updatePreferences,
  changePassword,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/login', login);
router.post('/register', register);
router.post('/reset-password', resetPassword);
router.get('/me', protect, getCurrentUser);
router.patch('/preferences', protect, updatePreferences);
router.post('/change-password', protect, changePassword);

module.exports = router;
