const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },

    food: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Food',
      required: true,
    },

    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
    },

    foodName: {
      type: String,
      required: true,
      trim: true,
    },

    foodImage: {
      type: String,
      default: '',
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

orderItemSchema.index({ order: 1 });
orderItemSchema.index({ restaurant: 1 });

module.exports = mongoose.model('OrderItem', orderItemSchema);
