const express = require('express');
const {
  getActiveVouchers,
  validateVoucher,
} = require('../controllers/voucherController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/', getActiveVouchers);
router.post('/validate', validateVoucher);

module.exports = router;
