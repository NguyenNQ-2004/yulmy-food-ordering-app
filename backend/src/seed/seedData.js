const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

const connectDB = require('../config/db');

const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const Food = require('../models/Food');
const Cart = require('../models/Cart');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Payment = require('../models/Payment');
const Review = require('../models/Review');
const Voucher = require('../models/Voucher');
const Notification = require('../models/Notification');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

connectDB();

const toObjectId = (id) => new mongoose.Types.ObjectId(id);
const demoDate = (value) => new Date(`${value}T09:00:00.000Z`);

const IDS = {
  customer: toObjectId('66a000000000000000000001'),
  admin: toObjectId('66a000000000000000000002'),
  ngocAdmin: toObjectId('66a000000000000000000003'),
  ownerOne: toObjectId('66a000000000000000000004'),
  ownerTwo: toObjectId('66a000000000000000000005'),
  ownerThree: toObjectId('66a000000000000000000006'),
  customerTwo: toObjectId('66a000000000000000000007'),
  customerThree: toObjectId('66a000000000000000000008'),
  blockedCustomer: toObjectId('66a000000000000000000009'),
  restaurantChicken: toObjectId('66b000000000000000000001'),
  restaurantComNgon: toObjectId('66b000000000000000000002'),
  restaurantNoodle: toObjectId('66b000000000000000000003'),
  restaurantGreenBowl: toObjectId('66b000000000000000000004'),
  friedChicken: toObjectId('66c000000000000000000001'),
  chickenBurger: toObjectId('66c000000000000000000002'),
  chickenRice: toObjectId('66c000000000000000000003'),
  beefNoodle: toObjectId('66c000000000000000000004'),
  braisedPorkRice: toObjectId('66c000000000000000000005'),
  phoSpecial: toObjectId('66c000000000000000000006'),
  avocadoSalad: toObjectId('66c000000000000000000007'),
  granolaYogurtBowl: toObjectId('66c000000000000000000008'),
  voucherYulmy10: toObjectId('66d000000000000000000001'),
  voucherFreeship: toObjectId('66d000000000000000000002'),
  voucherAdminTest: toObjectId('66d000000000000000000003'),
  cartCustomer: toObjectId('66e000000000000000000001'),
};

const IMAGES = {
  friedChicken:
    'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=300&h=300&fit=crop',
  chickenBurger:
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&h=300&fit=crop',
  chickenRice:
    'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=300&h=300&fit=crop',
  beefNoodle:
    'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=300&h=300&fit=crop',
  braisedPorkRice: 'https://picsum.photos/300/200?random=14',
  phoSpecial: 'https://picsum.photos/300/200?random=18',
  avocadoSalad: 'https://picsum.photos/300/200?random=15',
  granolaYogurtBowl: 'https://picsum.photos/300/200?random=16',
};

const seedData = async () => {
  try {
    await Notification.deleteMany();
    await Review.deleteMany();
    await Payment.deleteMany();
    await OrderItem.deleteMany();
    await Order.deleteMany();
    await Cart.deleteMany();
    await Food.deleteMany();
    await Restaurant.deleteMany();
    await Voucher.deleteMany();
    await User.deleteMany();

    const hashedPassword = await bcrypt.hash('123456', 10);

    const users = await User.insertMany([
      {
        _id: IDS.admin,
        fullName: 'Admin Yulmy',
        email: 'admin@gmail.com',
        password: hashedPassword,
        phone: '0999999999',
        address: 'Ha Noi',
        role: 'admin',
        status: 'active',
        preferences: {
          twoFactorEnabled: false,
          pushNotificationsEnabled: true,
          emailReportsEnabled: true,
        },
      },
      {
        _id: IDS.ngocAdmin,
        fullName: 'Ngoc Admin Demo',
        email: 'ngoc.admin@gmail.com',
        password: hashedPassword,
        phone: '0911111111',
        address: 'Cau Giay, Ha Noi',
        role: 'admin',
        status: 'active',
        preferences: {
          twoFactorEnabled: true,
          pushNotificationsEnabled: true,
          emailReportsEnabled: false,
        },
      },
      {
        _id: IDS.ownerOne,
        fullName: 'Minh Owner',
        email: 'owner@gmail.com',
        password: hashedPassword,
        phone: '0901000001',
        address: 'Ba Dinh, Ha Noi',
        role: 'restaurant_owner',
        status: 'active',
      },
      {
        _id: IDS.ownerTwo,
        fullName: 'Lan Owner',
        email: 'owner2@gmail.com',
        password: hashedPassword,
        phone: '0901000002',
        address: 'Nam Tu Liem, Ha Noi',
        role: 'restaurant_owner',
        status: 'active',
      },
      {
        _id: IDS.ownerThree,
        fullName: 'Hoang Owner',
        email: 'owner3@gmail.com',
        password: hashedPassword,
        phone: '0901000003',
        address: 'Thanh Xuan, Ha Noi',
        role: 'restaurant_owner',
        status: 'blocked',
      },
      {
        _id: IDS.customer,
        fullName: 'Nguyen Customer',
        email: 'user@gmail.com',
        password: hashedPassword,
        phone: '0988888888',
        address: 'Hoa Lac, Ha Noi',
        role: 'customer',
        status: 'active',
      },
      {
        _id: IDS.customerTwo,
        fullName: 'Trang Customer',
        email: 'customer2@gmail.com',
        password: hashedPassword,
        phone: '0988888899',
        address: 'My Dinh, Ha Noi',
        role: 'customer',
        status: 'active',
      },
      {
        _id: IDS.customerThree,
        fullName: 'Binh Customer',
        email: 'customer3@gmail.com',
        password: hashedPassword,
        phone: '0988888877',
        address: 'Dong Da, Ha Noi',
        role: 'customer',
        status: 'active',
      },
      {
        _id: IDS.blockedCustomer,
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
        _id: IDS.restaurantChicken,
        owner: IDS.ownerOne,
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
        _id: IDS.restaurantComNgon,
        owner: IDS.ownerTwo,
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
        _id: IDS.restaurantNoodle,
        owner: IDS.ownerOne,
        name: 'Noodle House',
        address: 'Ba Dinh, Ha Noi',
        category: 'Noodles',
        image: 'https://picsum.photos/400/250?random=3',
        rating: 4.9,
        deliveryTime: '15-25 min',
        status: 'active',
        createdAt: demoDate('2026-06-12'),
        updatedAt: demoDate('2026-07-09'),
      },
      {
        _id: IDS.restaurantGreenBowl,
        owner: IDS.ownerThree,
        name: 'Green Bowl',
        address: 'Thanh Xuan, Ha Noi',
        category: 'Healthy Food',
        image: 'https://picsum.photos/400/250?random=4',
        rating: 4.3,
        deliveryTime: '30-40 min',
        status: 'inactive',
        createdAt: demoDate('2026-06-10'),
        updatedAt: demoDate('2026-07-02'),
      },
    ]);

    const restaurantByName = Object.fromEntries(
      restaurants.map((restaurant) => [restaurant.name, restaurant])
    );

    const foods = await Food.insertMany([
      {
        _id: IDS.friedChicken,
        restaurant: IDS.restaurantChicken,
        name: 'Fried Chicken',
        description: 'Crispy fried chicken with special sauce.',
        price: 4.5,
        image: IMAGES.friedChicken,
        category: 'Chicken',
        rating: 4.8,
        isAvailable: true,
        createdAt: demoDate('2026-06-01'),
        updatedAt: demoDate('2026-07-08'),
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
        isAvailable: true,
        createdAt: demoDate('2026-06-02'),
        updatedAt: demoDate('2026-07-08'),
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
        isAvailable: true,
        createdAt: demoDate('2026-06-05'),
        updatedAt: demoDate('2026-07-07'),
      },
      {
        _id: IDS.braisedPorkRice,
        restaurant: IDS.restaurantComNgon,
        name: 'Braised Pork Rice',
        description: 'Slow-braised pork served with hot jasmine rice.',
        price: 6.2,
        image: IMAGES.braisedPorkRice,
        category: 'Rice',
        rating: 4.5,
        isAvailable: false,
        createdAt: demoDate('2026-06-05'),
        updatedAt: demoDate('2026-07-07'),
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
        isAvailable: true,
        createdAt: demoDate('2026-06-12'),
        updatedAt: demoDate('2026-07-09'),
      },
      {
        _id: IDS.phoSpecial,
        restaurant: IDS.restaurantNoodle,
        name: 'Pho Special',
        description: 'Pho with brisket, rare beef, tendon, and meatballs.',
        price: 7.5,
        image: IMAGES.phoSpecial,
        category: 'Noodles',
        rating: 4.8,
        isAvailable: true,
        createdAt: demoDate('2026-06-12'),
        updatedAt: demoDate('2026-07-09'),
      },
      {
        _id: IDS.avocadoSalad,
        restaurant: IDS.restaurantGreenBowl,
        name: 'Avocado Salad',
        description: 'Fresh avocado salad with lemon dressing.',
        price: 5.8,
        image: IMAGES.avocadoSalad,
        category: 'Salad',
        rating: 4.2,
        isAvailable: true,
        createdAt: demoDate('2026-06-10'),
        updatedAt: demoDate('2026-07-02'),
      },
      {
        _id: IDS.granolaYogurtBowl,
        restaurant: IDS.restaurantGreenBowl,
        name: 'Granola Yogurt Bowl',
        description: 'Greek yogurt with granola and seasonal fruit.',
        price: 6.5,
        image: IMAGES.granolaYogurtBowl,
        category: 'Healthy Food',
        rating: 4.1,
        isAvailable: false,
        createdAt: demoDate('2026-06-10'),
        updatedAt: demoDate('2026-07-02'),
      },
    ]);

    const foodByName = Object.fromEntries(foods.map((food) => [food.name, food]));

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
        startDate: demoDate('2026-06-01'),
        endDate: new Date('2026-12-31'),
        status: 'active',
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
        startDate: demoDate('2026-06-01'),
        endDate: new Date('2026-12-31'),
        status: 'active',
      },
      {
        _id: IDS.voucherAdminTest,
        code: 'ADMINTEST',
        title: 'Admin Test Voucher',
        description: 'Inactive voucher for CRUD and status testing.',
        discountType: 'fixed',
        discountValue: 2.5,
        minOrderAmount: 15,
        maxDiscountAmount: 2.5,
        startDate: demoDate('2026-06-01'),
        endDate: new Date('2026-10-31'),
        status: 'inactive',
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
      createdAt: demoDate('2026-07-04'),
      updatedAt: demoDate('2026-07-04'),
    });

    const orders = await Order.insertMany([
      {
        orderCode: 'YUL-1001',
        user: IDS.customer,
        restaurant: IDS.restaurantChicken,
        receiverName: 'Nguyen Customer',
        deliveryAddress: 'Hoa Lac, Ha Noi',
        phone: '0988888888',
        itemsAmount: 14.5,
        deliveryFee: 1.5,
        discountAmount: 1.5,
        totalAmount: 14.5,
        paymentMethod: 'MOCK_PAYMENT',
        paymentStatus: 'paid',
        orderStatus: 'Completed',
        note: 'Please add extra chili sauce.',
        createdAt: demoDate('2026-07-04'),
        updatedAt: demoDate('2026-07-04'),
      },
      {
        orderCode: 'YUL-1002',
        user: IDS.customerTwo,
        restaurant: IDS.restaurantComNgon,
        receiverName: 'Trang Customer',
        deliveryAddress: 'My Dinh, Ha Noi',
        phone: '0988888899',
        itemsAmount: 11.2,
        deliveryFee: 1.5,
        discountAmount: 1.5,
        totalAmount: 11.2,
        paymentMethod: 'COD',
        paymentStatus: 'unpaid',
        orderStatus: 'Preparing',
        note: 'Less ice for drinks.',
        createdAt: demoDate('2026-07-05'),
        updatedAt: demoDate('2026-07-05'),
      },
      {
        orderCode: 'YUL-1003',
        user: IDS.customerThree,
        restaurant: IDS.restaurantNoodle,
        receiverName: 'Binh Customer',
        deliveryAddress: 'Dong Da, Ha Noi',
        phone: '0988888877',
        itemsAmount: 13.5,
        deliveryFee: 1.5,
        discountAmount: 1.5,
        totalAmount: 13.5,
        paymentMethod: 'MOCK_PAYMENT',
        paymentStatus: 'paid',
        orderStatus: 'Delivering',
        note: 'Call before arriving.',
        createdAt: demoDate('2026-07-06'),
        updatedAt: demoDate('2026-07-06'),
      },
      {
        orderCode: 'YUL-1004',
        user: IDS.customer,
        restaurant: IDS.restaurantGreenBowl,
        receiverName: 'Nguyen Customer',
        deliveryAddress: 'Hoa Lac, Ha Noi',
        phone: '0988888888',
        itemsAmount: 5.8,
        deliveryFee: 1.5,
        discountAmount: 1.5,
        totalAmount: 5.8,
        paymentMethod: 'MOCK_PAYMENT',
        paymentStatus: 'failed',
        orderStatus: 'Cancelled',
        note: 'Failed payment case for admin test.',
        createdAt: demoDate('2026-07-07'),
        updatedAt: demoDate('2026-07-07'),
      },
      {
        orderCode: 'YUL-1005',
        user: IDS.customerTwo,
        restaurant: IDS.restaurantChicken,
        receiverName: 'Trang Customer',
        deliveryAddress: 'My Dinh, Ha Noi',
        phone: '0988888899',
        itemsAmount: 4.5,
        deliveryFee: 1.5,
        discountAmount: 1.5,
        totalAmount: 4.5,
        paymentMethod: 'COD',
        paymentStatus: 'unpaid',
        orderStatus: 'Pending',
        note: '',
        createdAt: demoDate('2026-07-08'),
        updatedAt: demoDate('2026-07-08'),
      },
      {
        orderCode: 'YUL-1006',
        user: IDS.customerThree,
        restaurant: IDS.restaurantNoodle,
        receiverName: 'Binh Customer',
        deliveryAddress: 'Dong Da, Ha Noi',
        phone: '0988888877',
        itemsAmount: 15,
        deliveryFee: 1.5,
        discountAmount: 1.5,
        totalAmount: 15,
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
        food: IDS.friedChicken,
        restaurant: IDS.restaurantChicken,
        foodName: 'Fried Chicken',
        foodImage: IMAGES.friedChicken,
        quantity: 2,
        price: 4.5,
        subtotal: 9,
      },
      {
        order: order1._id,
        food: IDS.chickenBurger,
        restaurant: IDS.restaurantChicken,
        foodName: 'Chicken Burger',
        foodImage: IMAGES.chickenBurger,
        quantity: 1,
        price: 5.5,
        subtotal: 5.5,
      },
      {
        order: order2._id,
        food: IDS.chickenRice,
        restaurant: IDS.restaurantComNgon,
        foodName: 'Chicken Rice',
        foodImage: IMAGES.chickenRice,
        quantity: 1,
        price: 5,
        subtotal: 5,
      },
      {
        order: order2._id,
        food: IDS.braisedPorkRice,
        restaurant: IDS.restaurantComNgon,
        foodName: 'Braised Pork Rice',
        foodImage: IMAGES.braisedPorkRice,
        quantity: 1,
        price: 6.2,
        subtotal: 6.2,
      },
      {
        order: order3._id,
        food: IDS.beefNoodle,
        restaurant: IDS.restaurantNoodle,
        foodName: 'Beef Noodle Soup',
        foodImage: IMAGES.beefNoodle,
        quantity: 1,
        price: 6,
        subtotal: 6,
      },
      {
        order: order3._id,
        food: IDS.phoSpecial,
        restaurant: IDS.restaurantNoodle,
        foodName: 'Pho Special',
        foodImage: IMAGES.phoSpecial,
        quantity: 1,
        price: 7.5,
        subtotal: 7.5,
      },
      {
        order: order4._id,
        food: IDS.avocadoSalad,
        restaurant: IDS.restaurantGreenBowl,
        foodName: 'Avocado Salad',
        foodImage: IMAGES.avocadoSalad,
        quantity: 1,
        price: 5.8,
        subtotal: 5.8,
      },
      {
        order: order5._id,
        food: IDS.friedChicken,
        restaurant: IDS.restaurantChicken,
        foodName: 'Fried Chicken',
        foodImage: IMAGES.friedChicken,
        quantity: 1,
        price: 4.5,
        subtotal: 4.5,
      },
      {
        order: order6._id,
        food: IDS.phoSpecial,
        restaurant: IDS.restaurantNoodle,
        foodName: 'Pho Special',
        foodImage: IMAGES.phoSpecial,
        quantity: 2,
        price: 7.5,
        subtotal: 15,
      },
    ]);

    await Payment.insertMany([
      {
        order: order1._id,
        user: order1.user,
        amount: order1.totalAmount,
        method: order1.paymentMethod,
        status: 'success',
        transactionCode: 'PAY-20260704-001',
        paidAt: demoDate('2026-07-04'),
        createdAt: demoDate('2026-07-04'),
        updatedAt: demoDate('2026-07-04'),
      },
      {
        order: order2._id,
        user: order2.user,
        amount: order2.totalAmount,
        method: order2.paymentMethod,
        status: 'pending',
        transactionCode: '',
        createdAt: demoDate('2026-07-05'),
        updatedAt: demoDate('2026-07-05'),
      },
      {
        order: order3._id,
        user: order3.user,
        amount: order3.totalAmount,
        method: order3.paymentMethod,
        status: 'success',
        transactionCode: 'PAY-20260706-003',
        paidAt: demoDate('2026-07-06'),
        createdAt: demoDate('2026-07-06'),
        updatedAt: demoDate('2026-07-06'),
      },
      {
        order: order4._id,
        user: order4.user,
        amount: order4.totalAmount,
        method: order4.paymentMethod,
        status: 'failed',
        transactionCode: 'PAY-20260707-004',
        failureReason: 'Mock payment failed',
        createdAt: demoDate('2026-07-07'),
        updatedAt: demoDate('2026-07-07'),
      },
      {
        order: order5._id,
        user: order5.user,
        amount: order5.totalAmount,
        method: order5.paymentMethod,
        status: 'pending',
        transactionCode: '',
        createdAt: demoDate('2026-07-08'),
        updatedAt: demoDate('2026-07-08'),
      },
      {
        order: order6._id,
        user: order6.user,
        amount: order6.totalAmount,
        method: order6.paymentMethod,
        status: 'success',
        transactionCode: 'PAY-20260709-006',
        paidAt: demoDate('2026-07-09'),
        createdAt: demoDate('2026-07-09'),
        updatedAt: demoDate('2026-07-09'),
      },
    ]);

    await Review.insertMany([
      {
        user: IDS.customer,
        food: IDS.friedChicken,
        restaurant: IDS.restaurantChicken,
        order: order1._id,
        rating: 5,
        comment: 'Chicken is crispy, delivery is fast.',
        status: 'approved',
        createdAt: demoDate('2026-07-04'),
        updatedAt: demoDate('2026-07-04'),
      },
      {
        user: IDS.customerTwo,
        food: IDS.chickenRice,
        restaurant: IDS.restaurantComNgon,
        order: order2._id,
        rating: 3,
        comment: 'Food is okay but still waiting for delivery.',
        status: 'pending',
        createdAt: demoDate('2026-07-05'),
        updatedAt: demoDate('2026-07-05'),
      },
      {
        user: IDS.customerThree,
        food: IDS.phoSpecial,
        restaurant: IDS.restaurantNoodle,
        order: order3._id,
        rating: 4,
        comment: 'Broth is good but portion could be bigger.',
        status: 'approved',
        createdAt: demoDate('2026-07-06'),
        updatedAt: demoDate('2026-07-06'),
      },
      {
        user: IDS.customer,
        restaurant: IDS.restaurantGreenBowl,
        order: order4._id,
        rating: 1,
        comment: 'Spam-like content for admin hide test.',
        status: 'hidden',
        createdAt: demoDate('2026-07-07'),
        updatedAt: demoDate('2026-07-07'),
      },
      {
        user: IDS.customerTwo,
        food: IDS.friedChicken,
        restaurant: IDS.restaurantChicken,
        order: order5._id,
        rating: 4,
        comment: 'Waiting for order but food history review is prepared.',
        status: 'pending',
        createdAt: demoDate('2026-07-08'),
        updatedAt: demoDate('2026-07-08'),
      },
      {
        user: IDS.customerThree,
        restaurant: IDS.restaurantNoodle,
        order: order6._id,
        rating: 5,
        comment: 'Night delivery is still very fast.',
        status: 'approved',
        createdAt: demoDate('2026-07-09'),
        updatedAt: demoDate('2026-07-09'),
      },
    ]);

    await Notification.insertMany([
      {
        user: IDS.customer,
        title: 'Order Completed',
        message: 'Your YUL-1001 order has been completed successfully.',
        type: 'order',
        isRead: true,
        relatedOrder: order1._id,
        createdAt: demoDate('2026-07-04'),
        updatedAt: demoDate('2026-07-04'),
      },
      {
        user: IDS.customerThree,
        title: 'Order On The Way',
        message: 'Order YUL-1003 is out for delivery.',
        type: 'order',
        isRead: false,
        relatedOrder: order3._id,
        createdAt: demoDate('2026-07-06'),
        updatedAt: demoDate('2026-07-06'),
      },
      {
        user: IDS.customerTwo,
        title: 'Voucher Applied',
        message: 'FREESHIP discount has been prepared for your next checkout.',
        type: 'promotion',
        isRead: false,
        createdAt: demoDate('2026-07-08'),
        updatedAt: demoDate('2026-07-08'),
      },
    ]);

    console.log('Seed data imported successfully');
    console.log('Summary:');
    console.log(`- Users: ${users.length}`);
    console.log(`- Restaurants: ${restaurants.length}`);
    console.log(`- Foods: ${foods.length}`);
    console.log(`- Orders: ${orders.length}`);
    console.log('- Reviews: 6');
    console.log('- Notifications: 3');
    console.log('');
    console.log('Demo accounts:');
    console.log('- Customer: user@gmail.com / 123456');
    console.log('- Owner: owner@gmail.com / 123456');
    console.log('- Admin: admin@gmail.com / 123456');
    console.log('- Admin: ngoc.admin@gmail.com / 123456');

    process.exit();
  } catch (error) {
    console.error(`Seed data error: ${error.message}`);
    process.exit(1);
  }
};

seedData();
