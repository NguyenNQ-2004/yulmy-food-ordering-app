const Restaurant = require('../models/Restaurant');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Food = require('../models/Food');

/**
 * GET /api/owner/restaurant
 * Get the restaurant belonging to the logged-in owner.
 */
const getMyRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'No restaurant found for this owner. Please contact admin.',
      });
    }

    return res.status(200).json({
      success: true,
      data: restaurant,
    });
  } catch (error) {
    console.error('getMyRestaurant error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching restaurant.',
    });
  }
};

/**
 * PUT /api/owner/restaurant
 * Update the restaurant belonging to the logged-in owner.
 */
const updateMyRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'No restaurant found for this owner.',
      });
    }

    const allowedFields = [
      'name', 'address', 'category', 'image',
      'phone', 'hours', 'description', 'status',
      'deliveryTime',
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        restaurant[field] = req.body[field];
      }
    });

    await restaurant.save();

    return res.status(200).json({
      success: true,
      message: 'Restaurant updated successfully.',
      data: restaurant,
    });
  } catch (error) {
    console.error('updateMyRestaurant error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while updating restaurant.',
    });
  }
};

/**
 * GET /api/owner/dashboard
 * Get dashboard statistics for the owner's restaurant.
 */
const getDashboardStats = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'No restaurant found for this owner.',
      });
    }

    const restaurantId = restaurant._id;

    // Count total orders
    const totalOrders = await Order.countDocuments({ restaurant: restaurantId });

    // Calculate total revenue from completed orders
    const revenueResult = await Order.aggregate([
      { $match: { restaurant: restaurantId, orderStatus: 'Completed' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    // Count active dishes
    const activeDishes = await Food.countDocuments({
      restaurant: restaurantId,
      isAvailable: true,
    });

    // Get recent orders (latest 5)
    const recentOrders = await Order.find({ restaurant: restaurantId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'fullName email');

    // Revenue per day for the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailyRevenue = await Order.aggregate([
      {
        $match: {
          restaurant: restaurantId,
          orderStatus: 'Completed',
          createdAt: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: { $dayOfWeek: '$createdAt' },
          total: { $sum: '$totalAmount' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Build chart data array (7 days, Sun=1 to Sat=7)
    const chartData = [0, 0, 0, 0, 0, 0, 0];
    dailyRevenue.forEach((item) => {
      chartData[item._id - 1] = item.total;
    });

    return res.status(200).json({
      success: true,
      data: {
        totalOrders,
        totalRevenue,
        activeDishes,
        rating: restaurant.rating,
        recentOrders,
        chartData,
      },
    });
  } catch (error) {
    console.error('getDashboardStats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard stats.',
    });
  }
};

module.exports = {
  getMyRestaurant,
  updateMyRestaurant,
  getDashboardStats,
};
