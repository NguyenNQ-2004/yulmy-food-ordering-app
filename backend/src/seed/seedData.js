const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

const connectDB = require('../config/db');

const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const Food = require('../models/Food');
const Voucher = require('../models/Voucher');

dotenv.config();

connectDB();

const seedData = async () => {
  try {
    await User.deleteMany();
    await Restaurant.deleteMany();
    await Food.deleteMany();
    await Voucher.deleteMany();

    const hashedPassword = await bcrypt.hash('123456', 10);

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
    ]);

    const restaurants = await Restaurant.insertMany([
      {
        name: 'Yulmy Chicken',
        address: 'Hoa Lac, Ha Noi',
        category: 'Fast Food',
        image: 'https://picsum.photos/400/250?random=1',
        rating: 4.8,
        deliveryTime: '20-30 min',
      },
      {
        name: 'Com Ngon Corner',
        address: 'Cau Giay, Ha Noi',
        category: 'Vietnamese Food',
        image: 'https://picsum.photos/400/250?random=2',
        rating: 4.6,
        deliveryTime: '25-35 min',
      },
      {
        name: 'Noodle House',
        address: 'My Dinh, Ha Noi',
        category: 'Noodles',
        image: 'https://picsum.photos/400/250?random=3',
        rating: 4.7,
        deliveryTime: '15-25 min',
      },
    ]);

    await Food.insertMany([
      {
        restaurant: restaurants[0]._id,
        name: 'Fried Chicken',
        description: 'Crispy fried chicken with special sauce.',
        price: 45000,
        image: 'https://picsum.photos/300/200?random=4',
        category: 'Chicken',
        rating: 4.8,
      },
      {
        restaurant: restaurants[0]._id,
        name: 'Chicken Burger',
        description: 'Soft burger with crispy chicken and fresh vegetables.',
        price: 55000,
        image: 'https://picsum.photos/300/200?random=5',
        category: 'Burger',
        rating: 4.7,
      },
      {
        restaurant: restaurants[1]._id,
        name: 'Chicken Rice',
        description: 'Hot chicken rice with soup and vegetables.',
        price: 50000,
        image: 'https://picsum.photos/300/200?random=6',
        category: 'Rice',
        rating: 4.6,
      },
      {
        restaurant: restaurants[2]._id,
        name: 'Beef Noodle Soup',
        description: 'Traditional beef noodle soup with rich broth.',
        price: 60000,
        image: 'https://picsum.photos/300/200?random=7',
        category: 'Noodles',
        rating: 4.9,
      },
    ]);

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

    console.log('Seed data imported successfully');
    console.log('Customer: user@gmail.com / 123456');
    console.log('Admin: admin@gmail.com / 123456');

    process.exit();
  } catch (error) {
    console.error(`Seed data error: ${error.message}`);
    process.exit(1);
  }
};

seedData();