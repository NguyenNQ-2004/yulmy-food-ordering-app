const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Restaurant = require('../models/Restaurant');

/**
 * Helper: get the restaurant ID for the logged-in owner.
 */
const getOwnerRestaurantId = async (userId) => {
  const restaurant = await Restaurant.findOne({ ownerId: userId });
  return restaurant ? restaurant._id : null;
};

/**
 * GET /api/owner/orders
 * Get all orders for the owner's restaurant.
 * Supports optional query param: ?status=Pending
 */
const getOrders = async (req, res) => {
  try {
    const restaurantId = await getOwnerRestaurantId(req.user.id);

    if (!restaurantId) {
      return res.status(404).json({
        success: false,
        message: 'No restaurant found for this owner.',
      });
    }

    const filter = { restaurant: restaurantId };

    if (req.query.status) {
      filter.orderStatus = req.query.status;
    }

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .populate('user', 'fullName email phone');

    // For each order, fetch order items with food details
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const items = await OrderItem.find({ order: order._id })
          .populate('food', 'name price image');
        return {
          ...order.toObject(),
          items,
        };
      })
    );

    return res.status(200).json({
      success: true,
      data: ordersWithItems,
    });
  } catch (error) {
    console.error('getOrders error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching orders.',
    });
  }
};

/**
 * PUT /api/owner/orders/:id/status
 * Update order status with validation of allowed transitions.
 */
const updateOrderStatus = async (req, res) => {
  try {
    const restaurantId = await getOwnerRestaurantId(req.user.id);

    if (!restaurantId) {
      return res.status(404).json({
        success: false,
        message: 'No restaurant found for this owner.',
      });
    }

    const order = await Order.findOne({
      _id: req.params.id,
      restaurant: restaurantId,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or does not belong to your restaurant.',
      });
    }

    const { status } = req.body;

    // Define allowed status transitions
    const allowedTransitions = {
      Pending: ['Confirmed', 'Cancelled'],
      Confirmed: ['Preparing', 'Cancelled'],
      Preparing: ['Delivering'],
      Delivering: ['Completed'],
      Completed: [],
      Cancelled: [],
    };

    const currentStatus = order.orderStatus;
    const allowed = allowedTransitions[currentStatus] || [];

    if (!allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot transition from "${currentStatus}" to "${status}". Allowed: ${allowed.join(', ') || 'none'}.`,
      });
    }

    order.orderStatus = status;
    await order.save();

    return res.status(200).json({
      success: true,
      message: `Order status updated to "${status}".`,
      data: order,
    });
  } catch (error) {
    console.error('updateOrderStatus error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while updating order status.',
    });
  }
};

module.exports = {
  getOrders,
  updateOrderStatus,
};
