const jwt = require('jsonwebtoken');
const User = require('../src/models/User');
const Restaurant = require('../src/models/Restaurant');
const Food = require('../src/models/Food');
const Order = require('../src/models/Order');

// Matches authMiddleware: verifies { id, role } against JWT_SECRET.
const makeToken = ({ id, role }) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET);

// Create a user of the given role and a signed token for them.
const createUser = async (role = 'customer', overrides = {}) => {
  const user = await User.create({
    fullName: overrides.fullName || `${role}-user`,
    email: overrides.email || `${role}-${Date.now()}-${Math.random()}@test.com`,
    password: 'hashed', // controllers under test never check the password
    role,
    ...overrides,
  });
  return { user, token: makeToken({ id: user._id.toString(), role }) };
};

// Owner + their restaurant + token, the common fixture for owner routes.
const createOwnerWithRestaurant = async (restaurantOverrides = {}) => {
  const { user, token } = await createUser('restaurant_owner');
  const restaurant = await Restaurant.create({
    owner: user._id,
    name: restaurantOverrides.name || 'Test Kitchen',
    address: restaurantOverrides.address || '123 Test St',
    ...restaurantOverrides,
  });
  return { owner: user, token, restaurant };
};

const createFood = (restaurantId, overrides = {}) =>
  Food.create({
    restaurant: restaurantId,
    name: overrides.name || 'Test Dish',
    price: overrides.price ?? 50000,
    ...overrides,
  });

// Order requires user, restaurant, deliveryAddress, phone, totalAmount.
const createOrder = (restaurantId, userId, overrides = {}) =>
  Order.create({
    user: userId,
    restaurant: restaurantId,
    deliveryAddress: '123 Test St',
    phone: '0900000000',
    totalAmount: overrides.totalAmount ?? 100000,
    orderStatus: overrides.orderStatus || 'Pending',
    orderCode: overrides.orderCode || 'ORD-' + Math.random().toString(36).substring(2, 11).toUpperCase(),
    receiverName: overrides.receiverName || 'Test Receiver',
    itemsAmount: overrides.itemsAmount ?? 1,
    ...overrides,
  });

module.exports = {
  makeToken,
  createUser,
  createOwnerWithRestaurant,
  createFood,
  createOrder,
};
