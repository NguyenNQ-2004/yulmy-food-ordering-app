const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

const connectDB = require('../config/db');

const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const Food = require('../models/Food');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Payment = require('../models/Payment');
const Review = require('../models/Review');
const Voucher = require('../models/Voucher');

dotenv.config();

connectDB();

const demoDate = (value) => new Date(`${value}T09:00:00.000Z`);

const seedData = async () => {
  try {
    await Review.deleteMany();
    await Payment.deleteMany();
    await OrderItem.deleteMany();
    await Order.deleteMany();
    await Food.deleteMany();
    await Restaurant.deleteMany();
    await User.deleteMany();
    await Voucher.deleteMany();

    const hashedPassword = await bcrypt.hash('123456', 10);

    const users = await User.insertMany([
      {
        fullName: 'Admin Yulmy',
        email: 'admin@gmail.com',
        password: hashedPassword,
        phone: '0999999999',
        address: 'Ha Noi',
        role: 'admin',
        status: 'active',
      },
      {
        fullName: 'Ngoc Admin Demo',
        email: 'ngoc.admin@gmail.com',
        password: hashedPassword,
        phone: '0911111111',
        address: 'Cau Giay, Ha Noi',
        role: 'admin',
        status: 'active',
      },
      {
        fullName: 'Minh Owner',
        email: 'owner@gmail.com',
        password: hashedPassword,
        phone: '0901000001',
        address: 'Ba Dinh, Ha Noi',
        role: 'restaurant_owner',
        status: 'active',
      },
      {
        fullName: 'Lan Owner',
        email: 'owner2@gmail.com',
        password: hashedPassword,
        phone: '0901000002',
        address: 'Nam Tu Liem, Ha Noi',
        role: 'restaurant_owner',
        status: 'active',
      },
      {
        fullName: 'Hoang Owner',
        email: 'owner3@gmail.com',
        password: hashedPassword,
        phone: '0901000003',
        address: 'Thanh Xuan, Ha Noi',
        role: 'restaurant_owner',
        status: 'blocked',
      },
      {
        fullName: 'Nguyen Customer',
        email: 'user@gmail.com',
        password: hashedPassword,
        phone: '0988888888',
        address: 'Hoa Lac, Ha Noi',
        role: 'customer',
        status: 'active',
      },
      {
        fullName: 'Trang Customer',
        email: 'customer2@gmail.com',
        password: hashedPassword,
        phone: '0988888899',
        address: 'My Dinh, Ha Noi',
        role: 'customer',
        status: 'active',
      },
      {
        fullName: 'Binh Customer',
        email: 'customer3@gmail.com',
        password: hashedPassword,
        phone: '0988888877',
        address: 'Dong Da, Ha Noi',
        role: 'customer',
        status: 'active',
      },
      {
        fullName: 'Khanh Customer',
        email: 'blocked.user@gmail.com',
        password: hashedPassword,
        phone: '0988888866',
        address: 'Ha Dong, Ha Noi',
        role: 'customer',
        status: 'blocked',
      },
    ]);

    const userByEmail = Object.fromEntries(users.map((user) => [user.email, user]));

    const restaurants = await Restaurant.insertMany([
      {
        owner: userByEmail['owner@gmail.com']._id,
        name: 'Yulmy Chicken',
        address: 'Hoa Lac, Ha Noi',
        category: 'Fast Food',
        image: 'https://picsum.photos/400/250?random=1',
        rating: 4.8,
        deliveryTime: '20-30 min',
        status: 'active',
        createdAt: demoDate('2026-06-01'),
        updatedAt: demoDate('2026-07-08'),
      },
      {
        owner: userByEmail['owner2@gmail.com']._id,
        name: 'Com Ngon Corner',
        address: 'Cau Giay, Ha Noi',
        category: 'Vietnamese Food',
        image: 'https://picsum.photos/400/250?random=2',
        rating: 4.6,
        deliveryTime: '25-35 min',
        status: 'active',
        createdAt: demoDate('2026-06-05'),
        updatedAt: demoDate('2026-07-07'),
      },
      {
        owner: userByEmail['owner3@gmail.com']._id,
        name: 'Green Bowl',
        address: 'Thanh Xuan, Ha Noi',
        category: 'Healthy Food',
        image: 'https://picsum.photos/400/250?random=3',
        rating: 4.3,
        deliveryTime: '30-40 min',
        status: 'inactive',
        createdAt: demoDate('2026-06-10'),
        updatedAt: demoDate('2026-07-02'),
      },
      {
        owner: userByEmail['owner@gmail.com']._id,
        name: 'Midnight Pho',
        address: 'Ba Dinh, Ha Noi',
        category: 'Noodles',
        image: 'https://picsum.photos/400/250?random=4',
        rating: 4.9,
        deliveryTime: '15-25 min',
        status: 'active',
        createdAt: demoDate('2026-06-12'),
        updatedAt: demoDate('2026-07-09'),
      },
    ]);

    const restaurantByName = Object.fromEntries(
      restaurants.map((restaurant) => [restaurant.name, restaurant])
    );

    const foods = await Food.insertMany([
      {
        restaurant: restaurantByName['Yulmy Chicken']._id,
        name: 'Fried Chicken Combo',
        description: 'Crispy fried chicken with fries and cola.',
        price: 89000,
        image: 'https://picsum.photos/300/200?random=11',
        category: 'Chicken',
        rating: 4.8,
        isAvailable: true,
        createdAt: demoDate('2026-06-01'),
      },
      {
        restaurant: restaurantByName['Yulmy Chicken']._id,
        name: 'Chicken Burger',
        description: 'Chicken burger with cheese and fresh lettuce.',
        price: 55000,
        image: 'https://picsum.photos/300/200?random=12',
        category: 'Burger',
        rating: 4.7,
        isAvailable: true,
        createdAt: demoDate('2026-06-02'),
      },
      {
        restaurant: restaurantByName['Com Ngon Corner']._id,
        name: 'Chicken Rice',
        description: 'Steamed chicken rice with soup and pickles.',
        price: 50000,
        image: 'https://picsum.photos/300/200?random=13',
        category: 'Rice',
        rating: 4.6,
        isAvailable: true,
        createdAt: demoDate('2026-06-05'),
      },
      {
        restaurant: restaurantByName['Com Ngon Corner']._id,
        name: 'Braised Pork Rice',
        description: 'Slow-braised pork served with hot jasmine rice.',
        price: 62000,
        image: 'https://picsum.photos/300/200?random=14',
        category: 'Rice',
        rating: 4.5,
        isAvailable: false,
        createdAt: demoDate('2026-06-05'),
      },
      {
        restaurant: restaurantByName['Green Bowl']._id,
        name: 'Avocado Salad',
        description: 'Fresh avocado salad with lemon dressing.',
        price: 58000,
        image: 'https://picsum.photos/300/200?random=15',
        category: 'Salad',
        rating: 4.2,
        isAvailable: true,
        createdAt: demoDate('2026-06-10'),
      },
      {
        restaurant: restaurantByName['Green Bowl']._id,
        name: 'Granola Yogurt Bowl',
        description: 'Greek yogurt with granola and seasonal fruit.',
        price: 65000,
        image: 'https://picsum.photos/300/200?random=16',
        category: 'Healthy Food',
        rating: 4.1,
        isAvailable: false,
        createdAt: demoDate('2026-06-10'),
      },
      {
        restaurant: restaurantByName['Midnight Pho']._id,
        name: 'Beef Pho',
        description: 'Rich broth pho with sliced beef and herbs.',
        price: 60000,
        image: 'https://picsum.photos/300/200?random=17',
        category: 'Noodles',
        rating: 4.9,
        isAvailable: true,
        createdAt: demoDate('2026-06-12'),
      },
      {
        restaurant: restaurantByName['Midnight Pho']._id,
        name: 'Pho Special',
        description: 'Pho with brisket, rare beef, tendon, and meatballs.',
        price: 75000,
        image: 'https://picsum.photos/300/200?random=18',
        category: 'Noodles',
        rating: 4.8,
        isAvailable: true,
        createdAt: demoDate('2026-06-12'),
      },
    ]);

    const foodByName = Object.fromEntries(foods.map((food) => [food.name, food]));

    const orders = await Order.insertMany([
      {
        user: userByEmail['user@gmail.com']._id,
        restaurant: restaurantByName['Yulmy Chicken']._id,
        deliveryAddress: 'Hoa Lac, Ha Noi',
        phone: '0988888888',
        totalAmount: 144000,
        paymentMethod: 'MOCK_PAYMENT',
        paymentStatus: 'paid',
        orderStatus: 'Completed',
        note: 'Please add extra chili sauce.',
        createdAt: demoDate('2026-07-01'),
        updatedAt: demoDate('2026-07-01'),
      },
      {
        user: userByEmail['customer2@gmail.com']._id,
        restaurant: restaurantByName['Com Ngon Corner']._id,
        deliveryAddress: 'My Dinh, Ha Noi',
        phone: '0988888899',
        totalAmount: 112000,
        paymentMethod: 'COD',
        paymentStatus: 'unpaid',
        orderStatus: 'Preparing',
        note: 'Less ice for drinks.',
        createdAt: demoDate('2026-07-03'),
        updatedAt: demoDate('2026-07-03'),
      },
      {
        user: userByEmail['customer3@gmail.com']._id,
        restaurant: restaurantByName['Midnight Pho']._id,
        deliveryAddress: 'Dong Da, Ha Noi',
        phone: '0988888877',
        totalAmount: 135000,
        paymentMethod: 'MOCK_PAYMENT',
        paymentStatus: 'paid',
        orderStatus: 'Delivering',
        note: 'Call before arriving.',
        createdAt: demoDate('2026-07-05'),
        updatedAt: demoDate('2026-07-05'),
      },
      {
        user: userByEmail['user@gmail.com']._id,
        restaurant: restaurantByName['Green Bowl']._id,
        deliveryAddress: 'Hoa Lac, Ha Noi',
        phone: '0988888888',
        totalAmount: 58000,
        paymentMethod: 'MOCK_PAYMENT',
        paymentStatus: 'failed',
        orderStatus: 'Cancelled',
        note: 'Failed payment case for admin test.',
        createdAt: demoDate('2026-07-06'),
        updatedAt: demoDate('2026-07-06'),
      },
      {
        user: userByEmail['customer2@gmail.com']._id,
        restaurant: restaurantByName['Yulmy Chicken']._id,
        deliveryAddress: 'My Dinh, Ha Noi',
        phone: '0988888899',
        totalAmount: 89000,
        paymentMethod: 'COD',
        paymentStatus: 'unpaid',
        orderStatus: 'Pending',
        note: '',
        createdAt: demoDate('2026-07-08'),
        updatedAt: demoDate('2026-07-08'),
      },
      {
        user: userByEmail['customer3@gmail.com']._id,
        restaurant: restaurantByName['Midnight Pho']._id,
        deliveryAddress: 'Dong Da, Ha Noi',
        phone: '0988888877',
        totalAmount: 150000,
        paymentMethod: 'MOCK_PAYMENT',
        paymentStatus: 'paid',
        orderStatus: 'Confirmed',
        note: 'Need chopsticks.',
        createdAt: demoDate('2026-07-09'),
        updatedAt: demoDate('2026-07-09'),
      },
    ]);

    const [order1, order2, order3, order4, order5, order6] = orders;

    await OrderItem.insertMany([
      {
        order: order1._id,
        food: foodByName['Fried Chicken Combo']._id,
        quantity: 1,
        price: 89000,
      },
      {
        order: order1._id,
        food: foodByName['Chicken Burger']._id,
        quantity: 1,
        price: 55000,
      },
      {
        order: order2._id,
        food: foodByName['Chicken Rice']._id,
        quantity: 1,
        price: 50000,
      },
      {
        order: order2._id,
        food: foodByName['Braised Pork Rice']._id,
        quantity: 1,
        price: 62000,
      },
      {
        order: order3._id,
        food: foodByName['Beef Pho']._id,
        quantity: 1,
        price: 60000,
      },
      {
        order: order3._id,
        food: foodByName['Pho Special']._id,
        quantity: 1,
        price: 75000,
      },
      {
        order: order4._id,
        food: foodByName['Avocado Salad']._id,
        quantity: 1,
        price: 58000,
      },
      {
        order: order5._id,
        food: foodByName['Fried Chicken Combo']._id,
        quantity: 1,
        price: 89000,
      },
      {
        order: order6._id,
        food: foodByName['Pho Special']._id,
        quantity: 2,
        price: 75000,
      },
    ]);

    await Payment.insertMany([
      {
        order: order1._id,
        user: order1.user,
        amount: order1.totalAmount,
        method: order1.paymentMethod,
        status: 'success',
        transactionCode: 'PAY-20260701-001',
        createdAt: demoDate('2026-07-01'),
      },
      {
        order: order2._id,
        user: order2.user,
        amount: order2.totalAmount,
        method: order2.paymentMethod,
        status: 'pending',
        transactionCode: '',
        createdAt: demoDate('2026-07-03'),
      },
      {
        order: order3._id,
        user: order3.user,
        amount: order3.totalAmount,
        method: order3.paymentMethod,
        status: 'success',
        transactionCode: 'PAY-20260705-003',
        createdAt: demoDate('2026-07-05'),
      },
      {
        order: order4._id,
        user: order4.user,
        amount: order4.totalAmount,
        method: order4.paymentMethod,
        status: 'failed',
        transactionCode: 'PAY-20260706-004',
        createdAt: demoDate('2026-07-06'),
      },
      {
        order: order5._id,
        user: order5.user,
        amount: order5.totalAmount,
        method: order5.paymentMethod,
        status: 'pending',
        transactionCode: '',
        createdAt: demoDate('2026-07-08'),
      },
      {
        order: order6._id,
        user: order6.user,
        amount: order6.totalAmount,
        method: order6.paymentMethod,
        status: 'success',
        transactionCode: 'PAY-20260709-006',
        createdAt: demoDate('2026-07-09'),
      },
    ]);

    await Review.insertMany([
      {
        user: userByEmail['user@gmail.com']._id,
        food: foodByName['Fried Chicken Combo']._id,
        restaurant: restaurantByName['Yulmy Chicken']._id,
        order: order1._id,
        rating: 5,
        comment: 'Chicken is crispy, delivery is fast.',
        status: 'approved',
        createdAt: demoDate('2026-07-02'),
      },
      {
        user: userByEmail['customer2@gmail.com']._id,
        food: foodByName['Chicken Rice']._id,
        restaurant: restaurantByName['Com Ngon Corner']._id,
        order: order2._id,
        rating: 3,
        comment: 'Food is okay but still waiting for delivery.',
        status: 'pending',
        createdAt: demoDate('2026-07-03'),
      },
      {
        user: userByEmail['customer3@gmail.com']._id,
        food: foodByName['Pho Special']._id,
        restaurant: restaurantByName['Midnight Pho']._id,
        order: order3._id,
        rating: 4,
        comment: 'Broth is good but portion could be bigger.',
        status: 'approved',
        createdAt: demoDate('2026-07-05'),
      },
      {
        user: userByEmail['user@gmail.com']._id,
        restaurant: restaurantByName['Green Bowl']._id,
        order: order4._id,
        rating: 1,
        comment: 'Spam-like content for admin hide test.',
        status: 'hidden',
        createdAt: demoDate('2026-07-06'),
      },
      {
        user: userByEmail['customer2@gmail.com']._id,
        food: foodByName['Fried Chicken Combo']._id,
        restaurant: restaurantByName['Yulmy Chicken']._id,
        order: order5._id,
        rating: 4,
        comment: 'Waiting for order but food history review is prepared.',
        status: 'pending',
        createdAt: demoDate('2026-07-08'),
      },
      {
        user: userByEmail['customer3@gmail.com']._id,
        restaurant: restaurantByName['Midnight Pho']._id,
        order: order6._id,
        rating: 5,
        comment: 'Night delivery is still very fast.',
        status: 'approved',
        createdAt: demoDate('2026-07-09'),
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
        status: 'active',
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
        status: 'active',
      },
      {
        code: 'ADMINTEST',
        title: 'Admin Test Voucher',
        description: 'Inactive voucher for CRUD and status testing.',
        discountType: 'fixed',
        discountValue: 25000,
        minOrderAmount: 150000,
        maxDiscountAmount: 25000,
        endDate: new Date('2026-10-31'),
        status: 'inactive',
      },
    ]);

    console.log('Seed data imported successfully');
    console.log('Summary:');
    console.log(`- Users: ${users.length}`);
    console.log(`- Restaurants: ${restaurants.length}`);
    console.log(`- Foods: ${foods.length}`);
    console.log(`- Orders: ${orders.length}`);
    console.log('- Reviews: 6');
    console.log('');
    console.log('Demo accounts:');
    console.log('- Customer: user@gmail.com / 123456');
    console.log('- Owner: owner@gmail.com / 123456');
    console.log('- Admin: admin@gmail.com / 123456');

    process.exit();
  } catch (error) {
    console.error(`Seed data error: ${error.message}`);
    process.exit(1);
  }
};

seedData();
