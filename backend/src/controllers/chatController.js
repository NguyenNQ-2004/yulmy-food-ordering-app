const Chat = require('../models/Chat');
const Message = require('../models/Message');

/**
 * GET /api/chats
 * Get chat list for the current user.
 * - If restaurant_owner: find chats where owner === req.user.id
 * - If customer: find chats where customer === req.user.id
 */
const getChats = async (req, res) => {
  try {
    let filter = {};

    if (req.user.role === 'restaurant_owner') {
      filter.owner = req.user.id;
    } else {
      filter.customer = req.user.id;
    }

    const chats = await Chat.find(filter)
      .sort({ updatedAt: -1 })
      .populate('customer', 'fullName email avatar')
      .populate('owner', 'fullName email avatar')
      .populate('restaurant', 'name');

    return res.status(200).json({
      success: true,
      data: chats,
    });
  } catch (error) {
    console.error('getChats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching chats.',
    });
  }
};

/**
 * GET /api/chats/:chatId/messages
 * Get all messages for a specific chat.
 */
const getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;

    // Verify the user is a participant in this chat
    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found.',
      });
    }

    const isParticipant =
      chat.customer.toString() === req.user.id ||
      chat.owner.toString() === req.user.id;

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'You are not a participant in this chat.',
      });
    }

    const messages = await Message.find({ chat: chatId })
      .sort({ createdAt: 1 })
      .populate('sender', 'fullName avatar role');

    return res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    console.error('getMessages error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching messages.',
    });
  }
};

/**
 * POST /api/chats/:chatId/messages
 * Send a new message in a chat.
 */
const sendMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { content, messageType } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required.',
      });
    }

    // Verify the user is a participant
    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found.',
      });
    }

    const isParticipant =
      chat.customer.toString() === req.user.id ||
      chat.owner.toString() === req.user.id;

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'You are not a participant in this chat.',
      });
    }

    const message = await Message.create({
      chat: chatId,
      sender: req.user.id,
      content: content.trim(),
      messageType: messageType || 'text',
    });

    // Update lastMessage on the chat
    chat.lastMessage = content.trim();
    await chat.save();

    // Populate sender info before returning
    await message.populate('sender', 'fullName avatar role');

    return res.status(201).json({
      success: true,
      message: 'Message sent successfully.',
      data: message,
    });
  } catch (error) {
    console.error('sendMessage error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while sending message.',
    });
  }
};

module.exports = {
  getChats,
  getMessages,
  sendMessage,
};
