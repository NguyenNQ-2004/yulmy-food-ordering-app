const mongoose = require('mongoose');

const aiPromptLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    prompt: {
      type: String,
      required: true,
    },

    response: {
      type: String,
      required: true,
    },

    feature: {
      type: String,
      default: 'food_recommendation',
    },

    modelName: {
      type: String,
      default: 'gemini',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('AIPromptLog', aiPromptLogSchema);