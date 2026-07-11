const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      default: '',
    },

    avatar: {
      type: String,
      default: '',
    },

    address: {
      type: String,
      default: '',
    },

    role: {
      type: String,
      enum: ['customer', 'restaurant_owner', 'admin'],
      default: 'customer',
    },

    status: {
      type: String,
      enum: ['active', 'blocked'],
      default: 'active',
    },

    preferences: {
      twoFactorEnabled: {
        type: Boolean,
        default: false,
      },
      pushNotificationsEnabled: {
        type: Boolean,
        default: true,
      },
      emailReportsEnabled: {
        type: Boolean,
        default: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('User', userSchema);
