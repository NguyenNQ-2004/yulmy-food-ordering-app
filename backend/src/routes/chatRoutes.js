const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const { getChats, createOrGetChat, getMessages, sendMessage } = require('../controllers/chatController');

// All routes require authentication (both customers and owners)
router.use(authMiddleware);

router.get('/', getChats);
router.post('/', createOrGetChat);
router.get('/:chatId/messages', getMessages);
router.post('/:chatId/messages', sendMessage);

module.exports = router;
