const express = require('express');

const {
  createUser,
  createFood,
  createRestaurant,
  deleteUser,
  deleteFood,
  deleteRestaurant,
  getDashboard,
  getFoods,
  getOrderDetail,
  getOrders,
  getRestaurants,
  getReviews,
  getUsers,
  updateUser,
  updateFood,
  updateOrderStatus,
  updateRestaurant,
  updateReviewStatus,
  updateUserStatus,
} = require('../controllers/adminController');
const { adminOnly, protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect, adminOnly);

router.get('/dashboard', getDashboard);

router.get('/users', getUsers);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.patch('/users/:id/status', updateUserStatus);
router.delete('/users/:id', deleteUser);

router.get('/restaurants', getRestaurants);
router.post('/restaurants', createRestaurant);
router.put('/restaurants/:id', updateRestaurant);
router.delete('/restaurants/:id', deleteRestaurant);

router.get('/foods', getFoods);
router.post('/foods', createFood);
router.put('/foods/:id', updateFood);
router.delete('/foods/:id', deleteFood);

router.get('/orders', getOrders);
router.get('/orders/:id', getOrderDetail);
router.patch('/orders/:id/status', updateOrderStatus);

router.get('/reviews', getReviews);
router.patch('/reviews/:id/status', updateReviewStatus);

module.exports = router;
