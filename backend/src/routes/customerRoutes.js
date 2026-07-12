const express = require('express');
const router = express.Router();
const Restaurant = require('../models/Restaurant');
const Food = require('../models/Food');

const { getFavorites, toggleFavorite } = require('../controllers/favoriteController');
const { protect } = require('../middleware/authMiddleware');

// GET all restaurants
router.get('/restaurants', async (req, res) => {
  try {
    const restaurants = await Restaurant.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: restaurants });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET all foods for a restaurant
router.get('/restaurants/:id/foods', async (req, res) => {
  try {
    const foods = await Food.find({ restaurant: req.params.id }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: foods });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Favorites routes (require authentication)
router.get('/favorites', protect, getFavorites);
router.post('/favorites/toggle', protect, toggleFavorite);

module.exports = router;
