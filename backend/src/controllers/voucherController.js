const Voucher = require('../models/Voucher');

const calculateVoucherDiscount = (voucher, itemsAmount) => {
  if (voucher.discountType === 'percent') {
    const percentDiscount = (itemsAmount * voucher.discountValue) / 100;

    if (voucher.maxDiscountAmount > 0) {
      return Math.min(percentDiscount, voucher.maxDiscountAmount, itemsAmount);
    }

    return Math.min(percentDiscount, itemsAmount);
  }

  if (voucher.maxDiscountAmount > 0) {
    return Math.min(voucher.discountValue, voucher.maxDiscountAmount, itemsAmount);
  }

  return Math.min(voucher.discountValue, itemsAmount);
};

const isVoucherActive = (voucher) => {
  const now = new Date();

  return voucher.status === 'active' && voucher.startDate <= now && voucher.endDate >= now;
};

const getActiveVouchers = async (req, res) => {
  try {
    const now = new Date();
    const vouchers = await Voucher.find({
      status: 'active',
      startDate: { $lte: now },
      endDate: { $gte: now },
    }).sort({ endDate: 1 });

    return res.status(200).json({
      success: true,
      data: {
        vouchers,
      },
    });
  } catch (error) {
    console.error('Get vouchers error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while getting vouchers',
    });
  }
};

const validateVoucher = async (req, res) => {
  try {
    const { code, itemsAmount } = req.body;
    const normalizedCode = code?.trim().toUpperCase();
    const normalizedItemsAmount = Number(itemsAmount);

    if (!normalizedCode) {
      return res.status(400).json({
        success: false,
        message: 'Please provide voucher code',
      });
    }

    if (!Number.isFinite(normalizedItemsAmount) || normalizedItemsAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid itemsAmount',
      });
    }

    const voucher = await Voucher.findOne({ code: normalizedCode });

    if (!voucher || !isVoucherActive(voucher)) {
      return res.status(400).json({
        success: false,
        message: 'Voucher is invalid or expired',
      });
    }

    if (normalizedItemsAmount < voucher.minOrderAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount for this voucher is ${voucher.minOrderAmount}`,
      });
    }

    const discountAmount = calculateVoucherDiscount(voucher, normalizedItemsAmount);

    return res.status(200).json({
      success: true,
      message: 'Voucher can be applied',
      data: {
        voucher,
        discountAmount,
      },
    });
  } catch (error) {
    console.error('Validate voucher error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while validating voucher',
    });
  }
};

module.exports = {
  getActiveVouchers,
  validateVoucher,
};
