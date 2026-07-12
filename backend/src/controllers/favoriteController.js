const Favorite = require('../models/Favorite');
const Food = require('../models/Food');
const Restaurant = require('../models/Restaurant');

/**
 * GET /api/customer/favorites
 * Get all favorites for the logged-in customer.
 */
const getFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.find({ user: req.user._id })
      .populate('food')
      .populate('restaurant')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: favorites,
    });
  } catch (error) {
    console.error('getFavorites error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching favorites.',
    });
  }
};

/**
 * POST /api/customer/favorites/toggle
 * Toggle favorite status for a food or restaurant.
 * Body: { foodId?: string, restaurantId?: string }
 */
const toggleFavorite = async (req, res) => {
  try {
    const { foodId, restaurantId } = req.body;

    if (!foodId && !restaurantId) {
      return res.status(400).json({
        success: false,
        message: 'Must provide foodId or restaurantId.',
      });
    }

    // Check if it exists
    const query = { user: req.user._id };
    if (foodId) query.food = foodId;
    if (restaurantId) query.restaurant = restaurantId;

    const existing = await Favorite.findOne(query);

    if (existing) {
      // Remove it
      await existing.deleteOne();
      return res.status(200).json({
        success: true,
        message: 'Removed from favorites.',
        data: { isFavorite: false },
      });
    } else {
      // Add it
      const newFav = await Favorite.create(query);
      return res.status(201).json({
        success: true,
        message: 'Added to favorites.',
        data: { isFavorite: true },
      });
    }
  } catch (error) {
    console.error('toggleFavorite error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while toggling favorite.',
    });
  }
};

module.exports = {
  getFavorites,
  toggleFavorite,
};
