const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
    },

    deliveryAddress: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      required: true,
    },

    totalAmount: {
      type: Number,
      required: true,
    },

    paymentMethod: {
      type: String,
      enum: ['COD', 'MOCK_PAYMENT'],
      default: 'COD',
    },

    paymentStatus: {
      type: String,
      enum: ['unpaid', 'paid', 'failed'],
      default: 'unpaid',
    },

    orderStatus: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Preparing', 'Delivering', 'Completed', 'Cancelled'],
      default: 'Pending',
    },

    note: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Order', orderSchema);