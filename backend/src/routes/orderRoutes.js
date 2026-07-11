const express = require('express');
const {
  cancelOrder,
  checkout,
  getMyOrders,
  getOrderById,
  getOrderStatus,
  mockPayment,
  updateOrderStatus,
} = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/checkout', checkout);
router.get('/my', getMyOrders);
router.get('/:orderId/status', getOrderStatus);
router.post('/:orderId/payment/mock', mockPayment);
router.put('/:orderId/status', updateOrderStatus);
router.put('/:orderId/cancel', cancelOrder);
router.get('/:orderId', getOrderById);

module.exports = router;
