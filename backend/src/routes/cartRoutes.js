const express = require('express');
const {
  addItemToCart,
  clearCart,
  getMyCart,
  removeCartItem,
  updateCartItem,
} = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/', getMyCart);
router.post('/items', addItemToCart);
router.put('/items/:foodId', updateCartItem);
router.delete('/items/:foodId', removeCartItem);
router.delete('/', clearCart);

module.exports = router;
