const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

const connectDB = require('../config/db');

const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const Food = require('../models/Food');
const Voucher = require('../models/Voucher');
const Cart = require('../models/Cart');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

connectDB();

const toObjectId = (id) => new mongoose.Types.ObjectId(id);

const IDS = {
  customer: toObjectId('66a000000000000000000001'),
  admin: toObjectId('66a000000000000000000002'),
  restaurantChicken: toObjectId('66b000000000000000000001'),
  restaurantComNgon: toObjectId('66b000000000000000000002'),
  restaurantNoodle: toObjectId('66b000000000000000000003'),
  friedChicken: toObjectId('66c000000000000000000001'),
  chickenBurger: toObjectId('66c000000000000000000002'),
  chickenRice: toObjectId('66c000000000000000000003'),
  beefNoodle: toObjectId('66c000000000000000000004'),
  voucherYulmy10: toObjectId('66d000000000000000000001'),
  voucherFreeship: toObjectId('66d000000000000000000002'),
  cartCustomer: toObjectId('66e000000000000000000001'),
};

const IMAGES = {
  friedChicken: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=300&h=300&fit=crop',
  chickenBurger: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&h=300&fit=crop',
  chickenRice: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=300&h=300&fit=crop',
  beefNoodle: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=300&h=300&fit=crop',
};

const seedData = async () => {
  try {
    await User.deleteMany();
    await Restaurant.deleteMany();
    await Food.deleteMany();
    await Voucher.deleteMany();
    await Cart.deleteMany();
    await Order.deleteMany();
    await OrderItem.deleteMany();
    await Payment.deleteMany();
    await Notification.deleteMany();

    const hashedPassword = await bcrypt.hash('123456', 10);

    await User.insertMany([
      {
        _id: IDS.customer,
        fullName: 'Nguyen Customer',
        email: 'user@gmail.com',
        password: hashedPassword,
        phone: '0988888888',
        address: 'Hoa Lac, Ha Noi',
        role: 'customer',
      },
      {
        _id: IDS.admin,
        fullName: 'Admin Yulmy',
        email: 'admin@gmail.com',
        password: hashedPassword,
        phone: '0999999999',
        address: 'Ha Noi',
        role: 'admin',
      },
    ]);

    await Restaurant.insertMany([
      {
        _id: IDS.restaurantChicken,
        name: 'Yulmy Chicken',
        address: 'Hoa Lac, Ha Noi',
        category: 'Fast Food',
        image: 'https://picsum.photos/400/250?random=1',
        rating: 4.8,
        deliveryTime: '20-30 min',
      },
      {
        _id: IDS.restaurantComNgon,
        name: 'Com Ngon Corner',
        address: 'Cau Giay, Ha Noi',
        category: 'Vietnamese Food',
        image: 'https://picsum.photos/400/250?random=2',
        rating: 4.6,
        deliveryTime: '25-35 min',
      },
      {
        _id: IDS.restaurantNoodle,
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
        _id: IDS.friedChicken,
        restaurant: IDS.restaurantChicken,
        name: 'Fried Chicken',
        description: 'Crispy fried chicken with special sauce.',
        price: 4.5,
        image: IMAGES.friedChicken,
        category: 'Chicken',
        rating: 4.8,
      },
      {
        _id: IDS.chickenBurger,
        restaurant: IDS.restaurantChicken,
        name: 'Chicken Burger',
        description: 'Soft burger with crispy chicken and fresh vegetables.',
        price: 5.5,
        image: IMAGES.chickenBurger,
        category: 'Burger',
        rating: 4.7,
      },
      {
        _id: IDS.chickenRice,
        restaurant: IDS.restaurantComNgon,
        name: 'Chicken Rice',
        description: 'Hot chicken rice with soup and vegetables.',
        price: 5,
        image: IMAGES.chickenRice,
        category: 'Rice',
        rating: 4.6,
      },
      {
        _id: IDS.beefNoodle,
        restaurant: IDS.restaurantNoodle,
        name: 'Beef Noodle Soup',
        description: 'Traditional beef noodle soup with rich broth.',
        price: 6,
        image: IMAGES.beefNoodle,
        category: 'Noodles',
        rating: 4.9,
      },
    ]);

    await Voucher.insertMany([
      {
        _id: IDS.voucherYulmy10,
        code: 'YULMY10',
        title: '10% Off',
        description: 'Get 10% off for your next order.',
        discountType: 'percent',
        discountValue: 10,
        minOrderAmount: 5,
        maxDiscountAmount: 2,
        endDate: new Date('2026-12-31'),
      },
      {
        _id: IDS.voucherFreeship,
        code: 'FREESHIP',
        title: 'Free Shipping',
        description: 'Get $1.50 discount for delivery fee.',
        discountType: 'fixed',
        discountValue: 1.5,
        minOrderAmount: 3,
        maxDiscountAmount: 1.5,
        endDate: new Date('2026-12-31'),
      },
    ]);

    await Cart.create({
      _id: IDS.cartCustomer,
      user: IDS.customer,
      restaurant: IDS.restaurantChicken,
      items: [
        {
          food: IDS.friedChicken,
          name: 'Fried Chicken',
          image: IMAGES.friedChicken,
          quantity: 2,
          price: 4.5,
          subtotal: 9,
        },
        {
          food: IDS.chickenBurger,
          name: 'Chicken Burger',
          image: IMAGES.chickenBurger,
          quantity: 1,
          price: 5.5,
          subtotal: 5.5,
        },
      ],
      totalItems: 3,
      totalAmount: 14.5,
    });

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
