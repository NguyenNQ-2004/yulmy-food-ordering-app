const express = require('express');

const {
  createFood,
  createRestaurant,
  deleteFood,
  deleteRestaurant,
  getDashboard,
  getFoods,
  getOrders,
  getRestaurants,
  getReviews,
  getUsers,
  updateFood,
  updateOrderStatus,
  updateRestaurant,
  updateReviewStatus,
  updateUserStatus,
  updateUserRole,
  deleteUser,
} = require('../controllers/adminController');
const { adminOnly, protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect, adminOnly);

router.get('/dashboard', getDashboard);

router.get('/users', getUsers);
router.patch('/users/:id/status', updateUserStatus);
router.patch('/users/:id/role', updateUserRole);
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
router.patch('/orders/:id/status', updateOrderStatus);

router.get('/reviews', getReviews);
router.patch('/reviews/:id/status', updateReviewStatus);

module.exports = router;
