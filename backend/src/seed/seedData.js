const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

const connectDB = require('../config/db');

const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const Food = require('../models/Food');
const Voucher = require('../models/Voucher');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Chat = require('../models/Chat');
const Message = require('../models/Message');

dotenv.config();

connectDB();

const seedData = async () => {
  try {
    // Clean all collections
    await User.deleteMany();
    await Restaurant.deleteMany();
    await Food.deleteMany();
    await Voucher.deleteMany();
    await Order.deleteMany();
    await OrderItem.deleteMany();
    await Chat.deleteMany();
    await Message.deleteMany();

    const hashedPassword = await bcrypt.hash('123456', 10);

    // ──────────────────────────────────────
    // 1. USERS
    // ──────────────────────────────────────
    const users = await User.insertMany([
      {
        fullName: 'Nguyen Customer',
        email: 'user@gmail.com',
        password: hashedPassword,
        phone: '0988888888',
        address: 'Hoa Lac, Ha Noi',
        role: 'customer',
      },
      {
        fullName: 'Admin Yulmy',
        email: 'admin@gmail.com',
        password: hashedPassword,
        phone: '0999999999',
        address: 'Ha Noi',
        role: 'admin',
      },
      {
        fullName: 'Owner Restaurant',
        email: 'owner1@gmail.com',
        password: hashedPassword,
        phone: '0977777777',
        address: 'Hoa Lac, Ha Noi',
        role: 'restaurant_owner',
      },
    ]);

    const customer = users[0];
    const owner = users[2];

    console.log('✅ Users seeded');

    // ──────────────────────────────────────
    // 2. RESTAURANTS (linked to owner)
    // ──────────────────────────────────────
    const restaurants = await Restaurant.insertMany([
      {
        ownerId: owner._id,
        name: 'Yulmy Chicken',
        address: 'Hoa Lac, Thach That, Ha Noi',
        category: 'Fast Food, Chicken',
        image: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=600&auto=format&fit=crop&q=80',
        phone: '0977777777',
        hours: '09:00 AM - 10:00 PM',
        description: 'Delicious crispy fried chicken, premium burgers and traditional recipes crafted with organic ingredients.',
        rating: 4.8,
        deliveryTime: '20-30 min',
      },
      {
        ownerId: owner._id,
        name: 'Com Ngon Corner',
        address: 'Cau Giay, Ha Noi',
        category: 'Vietnamese Food',
        image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80',
        phone: '0966666666',
        hours: '10:00 AM - 09:00 PM',
        description: 'Authentic Vietnamese rice dishes.',
        rating: 4.6,
        deliveryTime: '25-35 min',
      },
      {
        ownerId: owner._id,
        name: 'Noodle House',
        address: 'My Dinh, Ha Noi',
        category: 'Noodles',
        image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&auto=format&fit=crop&q=80',
        phone: '0955555555',
        hours: '08:00 AM - 11:00 PM',
        description: 'Best noodle soups in town.',
        rating: 4.7,
        deliveryTime: '15-25 min',
      },
    ]);

    const yulmyChicken = restaurants[0];

    console.log('✅ Restaurants seeded');

    // ──────────────────────────────────────
    // 3. FOODS (linked to Yulmy Chicken)
    // ──────────────────────────────────────
    const foods = await Food.insertMany([
      {
        restaurant: yulmyChicken._id,
        name: 'Fried Chicken',
        description: 'Crispy fried chicken with special spicy dipping sauce. Served hot and crunchy.',
        price: 45000,
        image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400&auto=format&fit=crop&q=80',
        category: 'Chicken',
        rating: 4.8,
      },
      {
        restaurant: yulmyChicken._id,
        name: 'Chicken Burger',
        description: 'Soft sesame burger with crispy chicken patty, cheese, and fresh vegetables.',
        price: 55000,
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&auto=format&fit=crop&q=80',
        category: 'Burger',
        rating: 4.7,
      },
      {
        restaurant: yulmyChicken._id,
        name: 'Chicken Rice',
        description: 'Hot seasoned chicken rice served with chicken soup and fresh cucumber.',
        price: 50000,
        image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&auto=format&fit=crop&q=80',
        category: 'Rice',
        rating: 4.6,
      },
      {
        restaurant: yulmyChicken._id,
        name: 'Beef Noodle Soup',
        description: 'Traditional Vietnamese pho with rich beef broth, tender sliced beef, and fresh herbs.',
        price: 60000,
        image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400&auto=format&fit=crop&q=80',
        category: 'Noodles',
        rating: 4.9,
      },
      {
        restaurant: yulmyChicken._id,
        name: 'Coca-Cola',
        description: 'Ice cold Coca-Cola served in a glass with ice and lemon.',
        price: 15000,
        image: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400&auto=format&fit=crop&q=80',
        category: 'Drinks',
        rating: 4.5,
      },
    ]);

    console.log('✅ Foods seeded');

    // ──────────────────────────────────────
    // 4. ORDERS + ORDER ITEMS
    // ──────────────────────────────────────
    const order1 = await Order.create({
      user: customer._id,
      restaurant: yulmyChicken._id,
      deliveryAddress: '742 Evergreen Terrace, Hoa Lac, Ha Noi',
      phone: '0988888888',
      totalAmount: 110000,
      paymentMethod: 'COD',
      paymentStatus: 'unpaid',
      orderStatus: 'Pending',
      note: 'Please ring the doorbell.',
    });

    await OrderItem.insertMany([
      { order: order1._id, food: foods[0]._id, quantity: 2, price: 45000 },
      { order: order1._id, food: foods[4]._id, quantity: 1, price: 15000 },
    ]);

    const order2 = await Order.create({
      user: customer._id,
      restaurant: yulmyChicken._id,
      deliveryAddress: '15 Pham Van Dong, Cau Giay, Ha Noi',
      phone: '0988888888',
      totalAmount: 55000,
      paymentMethod: 'MOCK_PAYMENT',
      paymentStatus: 'paid',
      orderStatus: 'Preparing',
      note: '',
    });

    await OrderItem.insertMany([
      { order: order2._id, food: foods[1]._id, quantity: 1, price: 55000 },
    ]);

    const order3 = await Order.create({
      user: customer._id,
      restaurant: yulmyChicken._id,
      deliveryAddress: '22 Le Loi, Ba Dinh, Ha Noi',
      phone: '0988888888',
      totalAmount: 155000,
      paymentMethod: 'MOCK_PAYMENT',
      paymentStatus: 'paid',
      orderStatus: 'Completed',
      note: 'Leave at the door.',
    });

    await OrderItem.insertMany([
      { order: order3._id, food: foods[0]._id, quantity: 1, price: 45000 },
      { order: order3._id, food: foods[2]._id, quantity: 1, price: 50000 },
      { order: order3._id, food: foods[3]._id, quantity: 1, price: 60000 },
    ]);

    console.log('✅ Orders & OrderItems seeded');

    // ──────────────────────────────────────
    // 5. CHAT + MESSAGES
    // ──────────────────────────────────────
    const chat1 = await Chat.create({
      customer: customer._id,
      owner: owner._id,
      restaurant: yulmyChicken._id,
      lastMessage: "Sure, it's #ORD-84729.",
      status: 'active',
    });

    await Message.insertMany([
      {
        chat: chat1._id,
        sender: owner._id,
        content: 'Hello! How can we assist you with your order today?',
        messageType: 'text',
        isRead: true,
      },
      {
        chat: chat1._id,
        sender: customer._id,
        content: 'Hi, I just placed an order but realized I need to change the delivery address. Is it too late?',
        messageType: 'text',
        isRead: true,
      },
      {
        chat: chat1._id,
        sender: owner._id,
        content: 'Let me check that for you. Could you please provide your order number? It should be in your confirmation email.',
        messageType: 'text',
        isRead: true,
      },
      {
        chat: chat1._id,
        sender: customer._id,
        content: "Sure, it's #ORD-84729.",
        messageType: 'text',
        isRead: false,
      },
    ]);

    console.log('✅ Chats & Messages seeded');

    // ──────────────────────────────────────
    // 6. VOUCHERS
    // ──────────────────────────────────────
    await Voucher.insertMany([
      {
        code: 'YULMY10',
        title: '10% Off',
        description: 'Get 10% off for your next order.',
        discountType: 'percent',
        discountValue: 10,
        minOrderAmount: 50000,
        maxDiscountAmount: 20000,
        endDate: new Date('2026-12-31'),
      },
      {
        code: 'FREESHIP',
        title: 'Free Shipping',
        description: 'Get 15000 VND discount for delivery fee.',
        discountType: 'fixed',
        discountValue: 15000,
        minOrderAmount: 30000,
        maxDiscountAmount: 15000,
        endDate: new Date('2026-12-31'),
      },
    ]);

    console.log('✅ Vouchers seeded');

    console.log('\n🎉 All seed data imported successfully!');
    console.log('──────────────────────────────────────');
    console.log('Customer: user@gmail.com / 123456');
    console.log('Admin:    admin@gmail.com / 123456');
    console.log('Owner:    owner1@gmail.com / 123456');
    console.log('──────────────────────────────────────');

    process.exit();
  } catch (error) {
    console.error(`❌ Seed data error: ${error.message}`);
    process.exit(1);
  }
};

seedData();