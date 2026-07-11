const express = require('express');
const cors = require('cors');

// Auth routes (Nguyen)
const authRoutes = require('./routes/authRoutes');

// Admin routes (Ngoc)
const adminRoutes = require('./routes/adminRoutes');

// Cart, Order, Voucher routes (Duy)
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const voucherRoutes = require('./routes/voucherRoutes');

// Owner, Chat, AI routes (Manh)
const ownerRoutes = require('./routes/ownerRoutes');
const chatRoutes = require('./routes/chatRoutes');
const aiRoutes = require('./routes/aiRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/vouchers', voucherRoutes);
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
