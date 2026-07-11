const { GoogleGenerativeAI } = require('@google/generative-ai');
const AIPromptLog = require('../models/AIPromptLog');
const Food = require('../models/Food');
const Restaurant = require('../models/Restaurant');

/**
 * POST /api/ai/recommend
 * Get food recommendations from Gemini AI.
 * Body: { prompt: string }
 */
const getRecommendation = async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Prompt is required.',
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        success: false,
        message: 'Gemini API key is not configured.',
      });
    }

    // Fetch available foods from DB as context
    const foods = await Food.find({ isAvailable: true })
      .populate('restaurant', 'name category')
      .limit(50);

    const menuContext = foods.map((f) => ({
      name: f.name,
      price: f.price,
      category: f.category,
      restaurant: f.restaurant?.name || 'Unknown',
      description: f.description,
    }));

    // Build the system prompt
    const systemPrompt = `You are Epicurean AI, a premium culinary assistant for the Yulmy food ordering app. 
You help users discover and choose dishes from our restaurant partners.

Here is the current menu available on our platform:
${JSON.stringify(menuContext, null, 2)}

Based on the user's request, recommend dishes from this menu. 
Include dish names, prices (in VND), restaurant names, and brief descriptions.
If the user asks about something not on the menu, be helpful and suggest alternatives from what we have.
Keep responses concise, friendly, and formatted for mobile reading.
Answer in the same language the user uses.`;

    // Call Gemini API
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const result = await model.generateContent(systemPrompt + '\n\nUser: ' + prompt.trim());

    const responseText = result.response.text();

    // Log to database
    await AIPromptLog.create({
      user: req.user.id,
      prompt: prompt.trim(),
      response: responseText,
      feature: 'food_recommendation',
      modelName: 'gemini-2.5-flash',
    });

    return res.status(200).json({
      success: true,
      data: {
        response: responseText,
      },
    });
  } catch (error) {
    console.error('getRecommendation error:', error);

    // Handle Gemini-specific errors gracefully
    const message = error.message?.includes('API_KEY')
      ? 'AI service authentication failed. Please check API key.'
      : 'AI service temporarily unavailable. Please try again.';

    return res.status(500).json({
      success: false,
      message,
    });
  }
};

module.exports = {
  getRecommendation,
};
