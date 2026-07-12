const Cart = require('../models/Cart');
const Food = require('../models/Food');
const Notification = require('../models/Notification');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Payment = require('../models/Payment');
const Restaurant = require('../models/Restaurant');
const Voucher = require('../models/Voucher');
require('../models/User');

// ──────────────────────────────────────
// CONSTANTS & HELPERS
// ──────────────────────────────────────
const ALLOWED_STATUS = ['Pending', 'Confirmed', 'Preparing', 'Delivering', 'Completed', 'Cancelled'];
const ORDER_STATUS_TRANSITIONS = {
  Pending: ['Confirmed', 'Cancelled'],
  Confirmed: ['Preparing', 'Cancelled'],
  Preparing: ['Delivering', 'Cancelled'],
  Delivering: ['Completed', 'Cancelled'],
  Completed: [],
  Cancelled: [],
};
const MOCK_PAYMENT_RESULTS = ['success', 'failed'];

const populateOrder = (query) =>
  query.populate('user', 'fullName email phone address').populate('restaurant');

const buildOrderCode = () => {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomPart = Math.random().toString(36).slice(2, 7).toUpperCase();

  return `YULMY-${datePart}-${randomPart}`;
};

const calculateDiscount = async (voucherCode, itemsAmount) => {
  if (!voucherCode) {
    return {
      voucher: null,
      discountAmount: 0,
    };
  }

  const voucher = await Voucher.findOne({
    code: voucherCode.trim().toUpperCase(),
    status: 'active',
  });

  const now = new Date();
  if (!voucher || voucher.startDate > now || voucher.endDate < now) {
    throw new Error('Voucher is invalid or expired');
  }

  if (itemsAmount < voucher.minOrderAmount) {
    throw new Error(`Minimum order amount for this voucher is ${voucher.minOrderAmount}`);
  }

  let discountAmount = 0;
  if (voucher.discountType === 'percent') {
    discountAmount = (itemsAmount * voucher.discountValue) / 100;
    if (voucher.maxDiscountAmount > 0) {
      discountAmount = Math.min(discountAmount, voucher.maxDiscountAmount);
    }
  } else {
    discountAmount = voucher.discountValue;
    if (voucher.maxDiscountAmount > 0) {
      discountAmount = Math.min(discountAmount, voucher.maxDiscountAmount);
    }
  }

  return {
    voucher,
    discountAmount: Math.min(discountAmount, itemsAmount),
  };
};

const buildMockTransactionCode = () => {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomPart = Math.random().toString(36).slice(2, 10).toUpperCase();

  return `MOCK-${datePart}-${randomPart}`;
};

const canAccessOrder = (order, user) => {
  const isOwner = order.user.toString() === user._id.toString();
  const isAdmin = user.role === 'admin';

  return isOwner || isAdmin;
};

const canUpdateOrderStatus = (user) => user.role === 'admin' || user.role === 'restaurant_owner';

const isValidStatusTransition = (currentStatus, nextStatus, force = false) => {
  if (force) {
    return true;
  }

  return ORDER_STATUS_TRANSITIONS[currentStatus]?.includes(nextStatus);
};

const getOrderDetailPayload = async (orderId) => {
  const order = await populateOrder(Order.findById(orderId));
  const items = await OrderItem.find({ order: orderId }).populate('food');
  const payment = await Payment.findOne({ order: orderId });

  return {
    order,
    items,
    payment,
  };
};

/**
 * Helper: get the restaurant ID for the logged-in owner.
 */
const getOwnerRestaurantId = async (userId) => {
  const restaurant = await Restaurant.findOne({ owner: userId });
  return restaurant ? restaurant._id : null;
};

// ──────────────────────────────────────
// CUSTOMER ORDER FUNCTIONS (Duy)
// ──────────────────────────────────────

const checkout = async (req, res) => {
  try {
    const {
      receiverName,
      deliveryAddress,
      phone,
      note = '',
      paymentMethod = 'COD',
      voucherCode = '',
      deliveryFee = 1.5,
    } = req.body;

    if (!receiverName || !deliveryAddress || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide receiverName, deliveryAddress, and phone',
      });
    }

    if (!['COD', 'MOCK_PAYMENT'].includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment method',
      });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty',
      });
    }

    const orderItemsData = [];
    let itemsAmount = 0;
    let orderRestaurant = cart.restaurant;

    for (const cartItem of cart.items) {
      const food = await Food.findById(cartItem.food);
      if (!food || !food.isAvailable) {
        return res.status(400).json({
          success: false,
          message: `${cartItem.name} is no longer available`,
        });
      }

      if (!orderRestaurant) {
        orderRestaurant = food.restaurant;
      }

      const subtotal = food.price * cartItem.quantity;
      itemsAmount += subtotal;

      orderItemsData.push({
        food: food._id,
        restaurant: food.restaurant,
        foodName: food.name,
        foodImage: food.image || '',
        quantity: cartItem.quantity,
        price: food.price,
        subtotal,
      });
    }

    let discountAmount = 0;
    try {
      const discountResult = await calculateDiscount(voucherCode, itemsAmount);
      discountAmount = discountResult.discountAmount;
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    const normalizedDeliveryFee = Math.max(Number(deliveryFee) || 0, 0);
    const totalAmount = Math.max(itemsAmount + normalizedDeliveryFee - discountAmount, 0);
    const order = await Order.create({
      orderCode: buildOrderCode(),
      user: req.user._id,
      restaurant: orderRestaurant,
      receiverName,
      deliveryAddress,
      phone,
      note,
      itemsAmount,
      deliveryFee: normalizedDeliveryFee,
      discountAmount,
      totalAmount,
      paymentMethod,
      paymentStatus: 'unpaid',
      orderStatus: 'Pending',
    });

    const orderItems = await OrderItem.insertMany(
      orderItemsData.map((item) => ({
        ...item,
        order: order._id,
      }))
    );

    await Payment.create({
      order: order._id,
      user: req.user._id,
      amount: totalAmount,
      method: paymentMethod,
      status: 'pending',
      transactionCode: '',
    });

    await Notification.create({
      user: req.user._id,
      title: 'Dat hang thanh cong',
      message: `Don ${order.orderCode} da duoc tao thanh cong.`,
      type: 'order',
      relatedOrder: order._id,
    });

    await Cart.findByIdAndDelete(cart._id);

    const payload = await getOrderDetailPayload(order._id);

    return res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: {
        ...payload,
        items: orderItems,
      },
    });
  } catch (error) {
    console.error('Checkout error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during checkout',
    });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await populateOrder(
      Order.find({ user: req.user._id }).sort({ createdAt: -1 })
    );

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
    console.error('Get orders error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while getting orders',
    });
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    if (!canAccessOrder(order, req.user)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this order',
      });
    }

    const payload = await getOrderDetailPayload(order._id);

    return res.status(200).json({
      success: true,
      data: payload,
    });
  } catch (error) {
    console.error('Get order detail error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while getting order detail',
    });
  }
};

const getOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    if (!canAccessOrder(order, req.user)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this order status',
      });
    }

    const payment = await Payment.findOne({ order: order._id });

    return res.status(200).json({
      success: true,
      data: {
        orderId: order._id,
        orderCode: order.orderCode,
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        payment: payment
          ? {
              id: payment._id,
              method: payment.method,
              status: payment.status,
              transactionCode: payment.transactionCode,
              paidAt: payment.paidAt,
              failureReason: payment.failureReason,
            }
          : null,
        updatedAt: order.updatedAt,
      },
    });
  } catch (error) {
    console.error('Get order status error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while getting order status',
    });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status, force = false } = req.body;

    if (!ALLOWED_STATUS.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order status',
      });
    }

    if (!canUpdateOrderStatus(req.user)) {
      return res.status(403).json({
        success: false,
        message: 'Only admin or restaurant owner can update order status',
      });
    }

    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    if (!isValidStatusTransition(order.orderStatus, status, force)) {
      return res.status(400).json({
        success: false,
        message: `Cannot update order status from ${order.orderStatus} to ${status}`,
        data: {
          currentStatus: order.orderStatus,
          allowedNextStatuses: ORDER_STATUS_TRANSITIONS[order.orderStatus] || [],
        },
      });
    }

    order.orderStatus = status;

    if (status === 'Completed' && order.paymentMethod === 'COD') {
      order.paymentStatus = 'paid';

      await Payment.findOneAndUpdate(
        { order: order._id },
        {
          status: 'success',
          paidAt: new Date(),
          failureReason: '',
          transactionCode: buildMockTransactionCode(),
        },
        { new: true }
      );
    }

    await order.save();

    await Notification.create({
      user: order.user,
      title: 'Cap nhat don hang',
      message: `Don ${order.orderCode} da chuyen sang ${status}.`,
      type: 'order',
      relatedOrder: order._id,
    });

    const payload = await getOrderDetailPayload(order._id);

    return res.status(200).json({
      success: true,
      message: 'Order status updated',
      data: payload,
    });
  } catch (error) {
    console.error('Update order status error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while updating order status',
    });
  }
};

const mockPayment = async (req, res) => {
  try {
    const { result = 'success', failureReason = 'Mock payment failed' } = req.body;

    if (!MOCK_PAYMENT_RESULTS.includes(result)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid mock payment result',
      });
    }

    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    if (!canAccessOrder(order, req.user)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to pay this order',
      });
    }

    if (order.paymentMethod !== 'MOCK_PAYMENT') {
      return res.status(400).json({
        success: false,
        message: 'This order does not use mock payment',
      });
    }

    if (order.orderStatus === 'Cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot pay a cancelled order',
      });
    }

    const payment = await Payment.findOne({ order: order._id });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment record not found',
      });
    }

    if (payment.status === 'success') {
      return res.status(400).json({
        success: false,
        message: 'Order has already been paid',
      });
    }

    const isSuccess = result === 'success';

    payment.status = isSuccess ? 'success' : 'failed';
    payment.transactionCode = isSuccess ? buildMockTransactionCode() : '';
    payment.paidAt = isSuccess ? new Date() : null;
    payment.failureReason = isSuccess ? '' : failureReason;
    await payment.save();

    order.paymentStatus = isSuccess ? 'paid' : 'failed';

    if (isSuccess && order.orderStatus === 'Pending') {
      order.orderStatus = 'Confirmed';
    }

    await order.save();

    await Notification.create({
      user: order.user,
      title: isSuccess ? 'Thanh toan thanh cong' : 'Thanh toan that bai',
      message: isSuccess
        ? `Don ${order.orderCode} da duoc thanh toan thanh cong.`
        : `Thanh toan don ${order.orderCode} that bai.`,
      type: 'order',
      relatedOrder: order._id,
    });

    const payload = await getOrderDetailPayload(order._id);

    return res.status(200).json({
      success: true,
      message: isSuccess ? 'Mock payment successful' : 'Mock payment failed',
      data: payload,
    });
  } catch (error) {
    console.error('Mock payment error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while processing mock payment',
    });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    if (!canAccessOrder(order, req.user)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this order',
      });
    }

    if (['Completed', 'Cancelled'].includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel an order with status ${order.orderStatus}`,
      });
    }

    order.orderStatus = 'Cancelled';
    await order.save();

    await Notification.create({
      user: order.user,
      title: 'Don hang da bi huy',
      message: `Don ${order.orderCode} da bi huy.`,
      type: 'order',
      relatedOrder: order._id,
    });

    const payload = await getOrderDetailPayload(order._id);

    return res.status(200).json({
      success: true,
      message: 'Order cancelled',
      data: payload,
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while cancelling order',
    });
  }
};

// ──────────────────────────────────────
// OWNER ORDER FUNCTIONS (Manh)
// ──────────────────────────────────────

/**
 * GET /api/owner/orders
 * Get all orders for the owner's restaurant.
 * Supports optional query param: ?status=Pending
 */
const getOwnerOrders = async (req, res) => {
  try {
    const restaurantId = await getOwnerRestaurantId(req.user._id);

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
    console.error('getOwnerOrders error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching orders.',
    });
  }
};

/**
 * PUT /api/owner/orders/:id/status
 * Update order status with validation of allowed transitions.
 * (Owner-specific: verifies order belongs to owner's restaurant)
 */
const updateOwnerOrderStatus = async (req, res) => {
  try {
    const restaurantId = await getOwnerRestaurantId(req.user._id);

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

    const currentStatus = order.orderStatus;
    const allowed = ORDER_STATUS_TRANSITIONS[currentStatus] || [];

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
    console.error('updateOwnerOrderStatus error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while updating order status.',
    });
  }
};

module.exports = {
  // Customer/Admin functions (Duy)
  checkout,
  getMyOrders,
  getOrderById,
  getOrderStatus,
  mockPayment,
  updateOrderStatus,
  cancelOrder,
  // Owner functions (Manh)
  getOwnerOrders,
  updateOwnerOrderStatus,
};
