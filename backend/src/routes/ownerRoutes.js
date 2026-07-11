const express = require('express');
const router = express.Router();
const { authMiddleware, requireRole } = require('../middleware/authMiddleware');
const { getMyRestaurant, updateMyRestaurant, getDashboardStats } = require('../controllers/ownerController');
const { getFoods, createFood, updateFood, deleteFood } = require('../controllers/foodController');
const { getOwnerOrders, updateOwnerOrderStatus } = require('../controllers/orderController');

// All routes require authentication + restaurant_owner role
router.use(authMiddleware);
router.use(requireRole('restaurant_owner'));

// Restaurant profile
router.get('/restaurant', getMyRestaurant);
router.put('/restaurant', updateMyRestaurant);

// Dashboard
router.get('/dashboard', getDashboardStats);

// Food CRUD
router.get('/foods', getFoods);
router.post('/foods', createFood);
router.put('/foods/:id', updateFood);
router.delete('/foods/:id', deleteFood);

// Order management
router.get('/orders', getOwnerOrders);
router.put('/orders/:id/status', updateOwnerOrderStatus);

module.exports = router;
