const bcrypt = require('bcryptjs');
const Food = require('../models/Food');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Payment = require('../models/Payment');
const Restaurant = require('../models/Restaurant');
const Review = require('../models/Review');
const User = require('../models/User');
const Cart = require('../models/Cart');
const Chat = require('../models/Chat');
const Message = require('../models/Message');
const Notification = require('../models/Notification');

const DAY_LABELS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const ORDER_STATUSES = [
  'Pending',
  'Confirmed',
  'Preparing',
  'Delivering',
  'Completed',
  'Cancelled',
];

const buildSearchRegex = (value) =>
  value ? new RegExp(value.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') : null;

const formatCurrencyShort = (amount) => {
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(1)}k`;
  }

  return `$${amount.toFixed(0)}`;
};

const formatCurrency = (amount) => `$${Number(amount || 0).toFixed(2)}`;
const getAdminOrderStatusOptions = (currentStatus) =>
  ORDER_STATUSES.filter((status) => status !== currentStatus);

const mapPaymentSummary = (payment) =>
  payment
    ? {
        id: payment._id,
        amount: payment.amount,
        amountLabel: formatCurrency(payment.amount),
        method: payment.method,
        status: payment.status,
        transactionCode: payment.transactionCode,
        paidAt: payment.paidAt,
        failureReason: payment.failureReason,
      }
    : null;

const buildOrderSummary = (order, itemCount = 0, payment = null) => ({
  _id: order._id,
  orderCode: order.orderCode,
  user: order.user,
  restaurant: order.restaurant,
  receiverName: order.receiverName,
  deliveryAddress: order.deliveryAddress,
  phone: order.phone,
  itemsAmount: order.itemsAmount,
  itemsAmountLabel: formatCurrency(order.itemsAmount),
  deliveryFee: order.deliveryFee,
  deliveryFeeLabel: formatCurrency(order.deliveryFee),
  discountAmount: order.discountAmount,
  discountAmountLabel: formatCurrency(order.discountAmount),
  totalAmount: order.totalAmount,
  totalAmountLabel: formatCurrency(order.totalAmount),
  paymentMethod: order.paymentMethod,
  paymentStatus: order.paymentStatus,
  payment: mapPaymentSummary(payment),
  orderStatus: order.orderStatus,
  allowedNextStatuses: getAdminOrderStatusOptions(order.orderStatus),
  note: order.note,
  createdAt: order.createdAt,
  updatedAt: order.updatedAt,
  itemCount,
});

const buildOrderDetail = (order, items = [], payment = null) => ({
  ...buildOrderSummary(order, items.reduce((sum, item) => sum + Number(item.quantity || 0), 0), payment),
  items: items.map((item) => ({
    id: item._id,
    foodId: item.food?._id || item.food,
    foodName: item.foodName,
    foodImage: item.foodImage,
    quantity: item.quantity,
    price: item.price,
    priceLabel: formatCurrency(item.price),
    subtotal: item.subtotal,
    subtotalLabel: formatCurrency(item.subtotal),
  })),
});

const getDashboard = async (req, res) => {
  try {
    const [totalOrders, totalUsers, totalRestaurants, totalFoods, pendingOrders, paidPayments] =
      await Promise.all([
        Order.countDocuments(),
        User.countDocuments(),
        Restaurant.countDocuments(),
        Food.countDocuments(),
        Order.countDocuments({ orderStatus: 'Pending' }),
        Payment.find({ status: 'success' }).select('amount createdAt'),
      ]);

    const totalRevenue = paidPayments.reduce(
      (sum, payment) => sum + payment.amount,
      0
    );

    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(now.getDate() - 6);
    startDate.setHours(0, 0, 0, 0);

    const revenueSeriesMap = new Map();
    for (let i = 0; i < 7; i += 1) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      revenueSeriesMap.set(date.toDateString(), {
        day: DAY_LABELS[date.getDay()],
        amount: 0,
      });
    }

    paidPayments.forEach((payment) => {
      const paymentDate = new Date(payment.createdAt || Date.now());
      if (paymentDate >= startDate) {
        const key = paymentDate.toDateString();
        if (revenueSeriesMap.has(key)) {
          revenueSeriesMap.get(key).amount += payment.amount;
        }
      }
    });

    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'fullName')
      .populate('restaurant', 'name');

    const recentOrderIds = recentOrders.map((order) => order._id);
    const orderItemCounts = await OrderItem.aggregate([
      {
        $match: {
          order: { $in: recentOrderIds },
        },
      },
      {
        $group: {
          _id: '$order',
          itemCount: { $sum: '$quantity' },
        },
      },
    ]);

    const itemCountMap = Object.fromEntries(
      orderItemCounts.map((item) => [String(item._id), item.itemCount])
    );

    return res.json({
      success: true,
      data: {
        metrics: {
          totalOrders,
          totalUsers,
          totalRestaurants,
          totalFoods,
          pendingOrders,
          totalRevenue,
          totalRevenueLabel: formatCurrencyShort(totalRevenue),
        },
        revenueSeries: Array.from(revenueSeriesMap.values()),
        recentOrders: recentOrders.map((order) => ({
          id: order._id,
          code: String(order._id).slice(-6).toUpperCase(),
          customerName: order.user?.fullName || 'Unknown User',
          restaurantName: order.restaurant?.name || 'Unknown Restaurant',
          totalAmount: order.totalAmount,
          totalAmountLabel: `$${order.totalAmount.toFixed(2)}`,
          itemCount: itemCountMap[String(order._id)] || 0,
          orderStatus: order.orderStatus,
          createdAt: order.createdAt,
        })),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to load admin dashboard',
      error: error.message,
    });
  }
};

const getUsers = async (req, res) => {
  try {
    const { q = '', filter = 'all' } = req.query;
    const searchRegex = buildSearchRegex(q);

    const query = {};
    if (filter === 'blocked') {
      query.status = 'blocked';
    } else if (['customer', 'restaurant_owner', 'admin'].includes(filter)) {
      query.role = filter;
    }

    if (searchRegex) {
      query.$or = [
        { fullName: searchRegex },
        { email: searchRegex },
        { role: searchRegex },
        { status: searchRegex },
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to load users',
      error: error.message,
    });
  }
};

const createUser = async (req, res) => {
  try {
    const {
      fullName,
      email,
      password,
      phone,
      address,
      avatar,
      role,
      status,
      preferences,
    } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Full name, email, and password are required',
      });
    }

    if (String(password).length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
      });
    }

    if (role && !['customer', 'restaurant_owner', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user role',
      });
    }

    if (status && !['active', 'blocked'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user status',
      });
    }

    const existingUser = await User.findOne({ email: String(email).trim().toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      fullName: String(fullName).trim(),
      email: String(email).trim().toLowerCase(),
      password: hashedPassword,
      phone: phone || '',
      address: address || '',
      avatar: avatar || '',
      role: role || 'customer',
      status: status || 'active',
      preferences: {
        twoFactorEnabled: Boolean(preferences?.twoFactorEnabled),
        pushNotificationsEnabled:
          preferences?.pushNotificationsEnabled !== undefined
            ? Boolean(preferences.pushNotificationsEnabled)
            : true,
        emailReportsEnabled:
          preferences?.emailReportsEnabled !== undefined
            ? Boolean(preferences.emailReportsEnabled)
            : true,
      },
    });

    const sanitizedUser = await User.findById(user._id).select('-password');

    return res.status(201).json({
      success: true,
      data: sanitizedUser,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to create user',
      error: error.message,
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      fullName,
      email,
      password,
      phone,
      address,
      avatar,
      role,
      status,
      preferences,
    } = req.body;

    if (role && !['customer', 'restaurant_owner', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user role',
      });
    }

    if (status && !['active', 'blocked'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user status',
      });
    }

    if (String(req.user?._id) === String(id) && role && role !== req.user.role) {
      return res.status(400).json({
        success: false,
        message: 'You cannot change your own role',
      });
    }

    if (String(req.user?._id) === String(id) && status && status !== req.user.status) {
      return res.status(400).json({
        success: false,
        message: 'You cannot change your own account status',
      });
    }

    if (email) {
      const existingUser = await User.findOne({
        email: String(email).trim().toLowerCase(),
        _id: { $ne: id },
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User with this email already exists',
        });
      }
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (fullName !== undefined) {
      user.fullName = String(fullName).trim();
    }
    if (email !== undefined) {
      user.email = String(email).trim().toLowerCase();
    }
    if (phone !== undefined) {
      user.phone = phone;
    }
    if (address !== undefined) {
      user.address = address;
    }
    if (avatar !== undefined) {
      user.avatar = avatar;
    }
    if (role !== undefined && String(req.user?._id) !== String(id)) {
      user.role = role;
    }
    if (status !== undefined && String(req.user?._id) !== String(id)) {
      user.status = status;
    }

    if (preferences) {
      user.preferences = {
        twoFactorEnabled:
          preferences.twoFactorEnabled !== undefined
            ? Boolean(preferences.twoFactorEnabled)
            : Boolean(user.preferences?.twoFactorEnabled),
        pushNotificationsEnabled:
          preferences.pushNotificationsEnabled !== undefined
            ? Boolean(preferences.pushNotificationsEnabled)
            : user.preferences?.pushNotificationsEnabled !== undefined
              ? Boolean(user.preferences.pushNotificationsEnabled)
              : true,
        emailReportsEnabled:
          preferences.emailReportsEnabled !== undefined
            ? Boolean(preferences.emailReportsEnabled)
            : user.preferences?.emailReportsEnabled !== undefined
              ? Boolean(user.preferences.emailReportsEnabled)
              : true,
      };
    }

    if (password !== undefined && password !== '') {
      if (String(password).length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters',
        });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();

    const sanitizedUser = await User.findById(user._id).select('-password');

    return res.json({
      success: true,
      data: sanitizedUser,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update user',
      error: error.message,
    });
  }
};

const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'blocked'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user status',
      });
    }

    if (String(req.user?._id) === String(id)) {
      return res.status(400).json({
        success: false,
        message: 'You cannot change your own account status',
      });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update user status',
      error: error.message,
    });
  }
};

const getRestaurants = async (req, res) => {
  try {
    const { q = '', status = 'all' } = req.query;
    const searchRegex = buildSearchRegex(q);

    const query = {};
    if (status === 'active' || status === 'inactive') {
      query.status = status;
    }

    if (searchRegex) {
      query.$or = [
        { name: searchRegex },
        { address: searchRegex },
        { category: searchRegex },
      ];
    }

    const restaurants = await Restaurant.find(query)
      .populate('owner', 'fullName email')
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      data: restaurants,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to load restaurants',
      error: error.message,
    });
  }
};

const createRestaurant = async (req, res) => {
  try {
    const {
      owner,
      name,
      address,
      category,
      image,
      rating,
      deliveryTime,
      status,
    } = req.body;

    if (!name || !address) {
      return res.status(400).json({
        success: false,
        message: 'Restaurant name and address are required',
      });
    }

    const restaurant = await Restaurant.create({
      owner: owner || null,
      name,
      address,
      category: category || 'Food',
      image: image || '',
      rating: Number(rating) || 0,
      deliveryTime: deliveryTime || '20-30 min',
      status: status || 'active',
    });

    const populated = await Restaurant.findById(restaurant._id).populate(
      'owner',
      'fullName email'
    );

    return res.status(201).json({
      success: true,
      data: populated,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to create restaurant',
      error: error.message,
    });
  }
};

const updateRestaurant = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = { ...req.body };

    if (payload.rating !== undefined) {
      payload.rating = Number(payload.rating) || 0;
    }

    const restaurant = await Restaurant.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    }).populate('owner', 'fullName email');

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found',
      });
    }

    return res.json({
      success: true,
      data: restaurant,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update restaurant',
      error: error.message,
    });
  }
};

const deleteRestaurant = async (req, res) => {
  try {
    const { id } = req.params;
    const restaurant = await Restaurant.findById(id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found',
      });
    }

    await Food.deleteMany({ restaurant: restaurant._id });
    await restaurant.deleteOne();

    return res.json({
      success: true,
      message: 'Restaurant deleted successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete restaurant',
      error: error.message,
    });
  }
};

const getFoods = async (req, res) => {
  try {
    const { q = '', status = 'all' } = req.query;
    const searchRegex = buildSearchRegex(q);

    const query = {};
    if (status === 'active') {
      query.isAvailable = true;
    } else if (status === 'inactive') {
      query.isAvailable = false;
    }

    if (searchRegex) {
      query.$or = [{ name: searchRegex }, { category: searchRegex }];
    }

    const foods = await Food.find(query)
      .populate({
        path: 'restaurant',
        populate: {
          path: 'owner',
          select: 'fullName email',
        },
      })
      .sort({ createdAt: -1 });

    const filteredFoods = searchRegex
      ? foods.filter((food) =>
          `${food.restaurant?.name || ''} ${food.restaurant?.address || ''}`
            .toLowerCase()
            .includes(q.trim().toLowerCase()) ||
          food.name.toLowerCase().includes(q.trim().toLowerCase()) ||
          food.category.toLowerCase().includes(q.trim().toLowerCase())
        )
      : foods;

    return res.json({
      success: true,
      data: filteredFoods,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to load foods',
      error: error.message,
    });
  }
};

const createFood = async (req, res) => {
  try {
    const { restaurant, name, description, price, image, category, rating, isAvailable } =
      req.body;

    if (!restaurant || !name || price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Restaurant, food name, and price are required',
      });
    }

    const food = await Food.create({
      restaurant,
      name,
      description: description || '',
      price: Number(price),
      image: image || '',
      category: category || 'Food',
      rating: Number(rating) || 0,
      isAvailable: isAvailable !== undefined ? isAvailable : true,
    });

    const populated = await Food.findById(food._id).populate({
      path: 'restaurant',
      populate: {
        path: 'owner',
        select: 'fullName email',
      },
    });

    return res.status(201).json({
      success: true,
      data: populated,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to create food',
      error: error.message,
    });
  }
};

const updateFood = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = { ...req.body };

    if (payload.price !== undefined) {
      payload.price = Number(payload.price);
    }
    if (payload.rating !== undefined) {
      payload.rating = Number(payload.rating) || 0;
    }

    const food = await Food.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    }).populate({
      path: 'restaurant',
      populate: {
        path: 'owner',
        select: 'fullName email',
      },
    });

    if (!food) {
      return res.status(404).json({
        success: false,
        message: 'Food not found',
      });
    }

    return res.json({
      success: true,
      data: food,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update food',
      error: error.message,
    });
  }
};

const deleteFood = async (req, res) => {
  try {
    const { id } = req.params;
    const food = await Food.findById(id);

    if (!food) {
      return res.status(404).json({
        success: false,
        message: 'Food not found',
      });
    }

    await food.deleteOne();

    return res.json({
      success: true,
      message: 'Food deleted successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete food',
      error: error.message,
    });
  }
};

const getOrders = async (req, res) => {
  try {
    const { q = '', status = 'all' } = req.query;
    const searchRegex = buildSearchRegex(q);

    const query = {};
    if (
      ['Pending', 'Confirmed', 'Preparing', 'Delivering', 'Completed', 'Cancelled'].includes(
        status
      )
    ) {
      query.orderStatus = status;
    }

    const orders = await Order.find(query)
      .populate('user', 'fullName email phone')
      .populate('restaurant', 'name')
      .sort({ createdAt: -1 });

    const orderIds = orders.map((order) => order._id);
    const [orderItemCounts, payments] = await Promise.all([
      OrderItem.aggregate([
        { $match: { order: { $in: orderIds } } },
        { $group: { _id: '$order', itemCount: { $sum: '$quantity' } } },
      ]),
      Payment.find({ order: { $in: orderIds } }),
    ]);

    const itemCountMap = Object.fromEntries(
      orderItemCounts.map((item) => [String(item._id), item.itemCount])
    );
    const paymentMap = Object.fromEntries(
      payments.map((payment) => [String(payment.order), payment])
    );

    const filteredOrders = orders.filter((order) => {
      if (!searchRegex) {
        return true;
      }

      return searchRegex.test(order.user?.fullName || '') ||
        searchRegex.test(order.user?.email || '') ||
        searchRegex.test(order.receiverName || '') ||
        searchRegex.test(order.phone || '') ||
        searchRegex.test(order.restaurant?.name || '') ||
        searchRegex.test(order.orderStatus) ||
        searchRegex.test(order.orderCode || '')
        ? true
        : false;
    });

    return res.json({
      success: true,
      data: filteredOrders.map((order) =>
        buildOrderSummary(
          order,
          itemCountMap[String(order._id)] || 0,
          paymentMap[String(order._id)] || null
        )
      ),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to load orders',
      error: error.message,
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (String(req.user?._id) === String(id)) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account',
      });
    }

    const user = await User.findById(id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const chats = await Chat.find({
      $or: [{ customer: id }, { owner: id }, { admin: id }],
    }).select('_id');
    const chatIds = chats.map((chat) => chat._id);

    if (chatIds.length > 0) {
      await Message.deleteMany({ chat: { $in: chatIds } });
      await Chat.deleteMany({ _id: { $in: chatIds } });
    }

    await Promise.all([
      Cart.deleteMany({ user: id }),
      Notification.deleteMany({ user: id }),
      Review.deleteMany({ user: id }),
      Restaurant.updateMany({ owner: id }, { $set: { owner: null } }),
      Message.deleteMany({ sender: id }),
    ]);

    await user.deleteOne();

    return res.json({
      success: true,
      message: 'User deleted successfully',
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error.message,
    });
  }
};

const getOrderDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id)
      .populate('user', 'fullName email phone address')
      .populate('restaurant', 'name address category image');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    const [items, payment] = await Promise.all([
      OrderItem.find({ order: order._id }).sort({ createdAt: 1 }),
      Payment.findOne({ order: order._id }),
    ]);

    return res.json({
      success: true,
      data: buildOrderDetail(order, items, payment),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to load order detail',
      error: error.message,
    });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus } = req.body;

    if (!ORDER_STATUSES.includes(orderStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order status',
      });
    }

    const order = await Order.findById(id)
      .populate('user', 'fullName email phone address')
      .populate('restaurant', 'name address category image');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    const isSameStatus = order.orderStatus === orderStatus;

    order.orderStatus = orderStatus;

    let payment = await Payment.findOne({ order: order._id });

    if (!payment) {
      payment = await Payment.create({
        order: order._id,
        user: order.user?._id || order.user,
        amount: order.totalAmount,
        method: order.paymentMethod,
        status: order.paymentMethod === 'MOCK_PAYMENT' ? 'success' : 'pending',
        transactionCode:
          order.paymentMethod === 'MOCK_PAYMENT' ? `MOCK-${Date.now()}` : '',
        paidAt: order.paymentMethod === 'MOCK_PAYMENT' ? new Date() : null,
      });
    }

    if (order.paymentMethod === 'COD') {
      if (orderStatus === 'Completed') {
        order.paymentStatus = 'paid';
        payment.status = 'success';
        payment.paidAt = payment.paidAt || new Date();
        payment.failureReason = '';
        payment.transactionCode =
          payment.transactionCode || `ADMIN-COD-${Date.now()}`;
      } else if (orderStatus === 'Cancelled') {
        order.paymentStatus = 'unpaid';
        payment.status = 'failed';
        payment.paidAt = null;
        payment.failureReason = 'Order cancelled before cash collection';
      } else {
        order.paymentStatus = 'unpaid';
        payment.status = 'pending';
        payment.paidAt = null;
        payment.failureReason = '';
      }
    }

    await Promise.all([order.save(), payment.save()]);

    const items = await OrderItem.find({ order: order._id }).sort({ createdAt: 1 });

    return res.json({
      success: true,
      data: buildOrderDetail(order, items, payment),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update order status',
      error: error.message,
    });
  }
};

const getReviews = async (req, res) => {
  try {
    const { q = '', status = 'all' } = req.query;
    const searchRegex = buildSearchRegex(q);

    const query = {};
    if (['pending', 'approved', 'hidden'].includes(status)) {
      query.status = status;
    }

    const reviews = await Review.find(query)
      .populate('user', 'fullName email')
      .populate('food', 'name')
      .populate('restaurant', 'name')
      .sort({ createdAt: -1 });

    const filteredReviews = reviews.filter((review) => {
      if (!searchRegex) {
        return true;
      }

      return (
        searchRegex.test(review.user?.fullName || '') ||
        searchRegex.test(review.user?.email || '') ||
        searchRegex.test(review.food?.name || '') ||
        searchRegex.test(review.restaurant?.name || '') ||
        searchRegex.test(review.comment || '') ||
        searchRegex.test(review.status)
      );
    });

    const stats = {
      totalReviews: await Review.countDocuments(),
      averageRating:
        (
          (
            await Review.aggregate([
              {
                $group: {
                  _id: null,
                  averageRating: { $avg: '$rating' },
                },
              },
            ])
          )[0]?.averageRating || 0
        ).toFixed(1),
      pendingCount: await Review.countDocuments({ status: 'pending' }),
    };

    return res.json({
      success: true,
      data: {
        reviews: filteredReviews,
        stats,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to load reviews',
      error: error.message,
    });
  }
};

const updateReviewStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'approved', 'hidden'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid review status',
      });
    }

    const review = await Review.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    )
      .populate('user', 'fullName email')
      .populate('food', 'name')
      .populate('restaurant', 'name');

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    return res.json({
      success: true,
      data: review,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update review status',
      error: error.message,
    });
  }
};

module.exports = {
  getDashboard,
  getUsers,
  createUser,
  updateUser,
  updateUserStatus,
  deleteUser,
  getRestaurants,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  getFoods,
  createFood,
  updateFood,
  deleteFood,
  getOrders,
  getOrderDetail,
  updateOrderStatus,
  getReviews,
  updateReviewStatus,
};
