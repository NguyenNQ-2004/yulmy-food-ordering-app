const Food = require('../models/Food');
const Restaurant = require('../models/Restaurant');

/**
 * Helper: get the restaurant ID for the logged-in owner.
 */
const getOwnerRestaurantId = async (userId) => {
  const restaurant = await Restaurant.findOne({ owner: userId });
  return restaurant ? restaurant._id : null;
};

/**
 * GET /api/owner/foods
 * List all foods for the owner's restaurant.
 */
const getFoods = async (req, res) => {
  try {
    const restaurantId = await getOwnerRestaurantId(req.user.id);

    if (!restaurantId) {
      return res.status(404).json({
        success: false,
        message: 'No restaurant found for this owner.',
      });
    }

    const foods = await Food.find({ restaurant: restaurantId }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: foods,
    });
  } catch (error) {
    console.error('getFoods error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching foods.',
    });
  }
};

/**
 * POST /api/owner/foods
 * Create a new food item for the owner's restaurant.
 */
const createFood = async (req, res) => {
  try {
    const restaurantId = await getOwnerRestaurantId(req.user.id);

    if (!restaurantId) {
      return res.status(404).json({
        success: false,
        message: 'No restaurant found for this owner.',
      });
    }

    const { name, description, price, image, category } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Name and price are required.',
      });
    }

    const food = await Food.create({
      restaurant: restaurantId,
      name,
      description: description || '',
      price,
      image: image || '',
      category: category || 'Food',
    });

    return res.status(201).json({
      success: true,
      message: 'Food item created successfully.',
      data: food,
    });
  } catch (error) {
    console.error('createFood error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while creating food.',
    });
  }
};

/**
 * PUT /api/owner/foods/:id
 * Update a food item (verify ownership via restaurant).
 */
const updateFood = async (req, res) => {
  try {
    const restaurantId = await getOwnerRestaurantId(req.user.id);

    if (!restaurantId) {
      return res.status(404).json({
        success: false,
        message: 'No restaurant found for this owner.',
      });
    }

    const food = await Food.findOne({
      _id: req.params.id,
      restaurant: restaurantId,
    });

    if (!food) {
      return res.status(404).json({
        success: false,
        message: 'Food item not found or you do not own it.',
      });
    }

    const allowedFields = ['name', 'description', 'price', 'image', 'category', 'isAvailable'];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        food[field] = req.body[field];
      }
    });

    await food.save();

    return res.status(200).json({
      success: true,
      message: 'Food item updated successfully.',
      data: food,
    });
  } catch (error) {
    console.error('updateFood error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while updating food.',
    });
  }
};

/**
 * DELETE /api/owner/foods/:id
 * Delete a food item (verify ownership via restaurant).
 */
const deleteFood = async (req, res) => {
  try {
    const restaurantId = await getOwnerRestaurantId(req.user.id);

    if (!restaurantId) {
      return res.status(404).json({
        success: false,
        message: 'No restaurant found for this owner.',
      });
    }

    const food = await Food.findOneAndDelete({
      _id: req.params.id,
      restaurant: restaurantId,
    });

    if (!food) {
      return res.status(404).json({
        success: false,
        message: 'Food item not found or you do not own it.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Food item deleted successfully.',
    });
  } catch (error) {
    console.error('deleteFood error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while deleting food.',
    });
  }
};

module.exports = {
  getFoods,
  createFood,
  updateFood,
  deleteFood,
};
