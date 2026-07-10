const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const ownerRoutes = require('./routes/ownerRoutes');
const chatRoutes = require('./routes/chatRoutes');
const aiRoutes = require('./routes/aiRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/owner', ownerRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/ai', aiRoutes);

app.get('/', (req, res) => {
  res.send('Yulmy Backend API is running');
});

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Backend is working',
  });
});

module.exports = app;
