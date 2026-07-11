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
const Chat = require('../models/Chat');
const Message = require('../models/Message');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

connectDB();

const toObjectId = (id) => new mongoose.Types.ObjectId(id);

const IDS = {
  customer: toObjectId('66a000000000000000000001'),
  admin: toObjectId('66a000000000000000000002'),
  owner: toObjectId('66a000000000000000000003'),
  restaurantChicken: toObjectId('66b000000000000000000001'),
  restaurantComNgon: toObjectId('66b000000000000000000002'),
  restaurantNoodle: toObjectId('66b000000000000000000003'),
  restaurantLumina: toObjectId('66b000000000000000000004'),
  restaurantAkira: toObjectId('66b000000000000000000005'),
  restaurantVerdant: toObjectId('66b000000000000000000006'),
  restaurantMaison: toObjectId('66b000000000000000000007'),
  friedChicken: toObjectId('66c000000000000000000001'),
  chickenBurger: toObjectId('66c000000000000000000002'),
  chickenRice: toObjectId('66c000000000000000000003'),
  beefNoodle: toObjectId('66c000000000000000000004'),
  foodTruffleRisotto: toObjectId('66c000000000000000000005'),
  foodSpicyTuna: toObjectId('66c000000000000000000006'),
  foodBuddhaBowl: toObjectId('66c000000000000000000007'),
  foodLavaCake: toObjectId('66c000000000000000000008'),
  foodMatchaCrepe: toObjectId('66c000000000000000000009'),
  foodAvocadoToast: toObjectId('66c00000000000000000000a'),
  foodSearedScallops: toObjectId('66c00000000000000000000b'),
  foodMasaSushi: toObjectId('66c00000000000000000000c'),
  foodMargheritaPizza: toObjectId('66c00000000000000000000d'),
  spicyChickenWings: toObjectId('66c00000000000000000000f'),
  chickenNuggets: toObjectId('66c000000000000000000010'),
  voucherYulmy10: toObjectId('66d000000000000000000001'),
  voucherFreeship: toObjectId('66d000000000000000000002'),
  cartCustomer: toObjectId('66e000000000000000000001'),
};

const IMAGES = {
  friedChicken: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=300&h=300&fit=crop',
  chickenBurger: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&h=300&fit=crop',
  chickenRice: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=300&h=300&fit=crop',
  beefNoodle: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=300&h=300&fit=crop',
  spicyWings: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=300&h=300&fit=crop',
  chickenNuggets: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=300&h=300&fit=crop',
};

const seedData = async () => {
  try {
    // Clean all collections
    await User.deleteMany();
    await Restaurant.deleteMany();
    await Food.deleteMany();
    await Voucher.deleteMany();
    await Cart.deleteMany();
    await Order.deleteMany();
    await OrderItem.deleteMany();
    await Payment.deleteMany();
    await Notification.deleteMany();
    await Chat.deleteMany();
    await Message.deleteMany();

    const hashedPassword = await bcrypt.hash('123456', 10);

    // ──────────────────────────────────────
    // 1. USERS
    // ──────────────────────────────────────
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
      {
        _id: IDS.owner,
        fullName: 'Owner Restaurant',
        email: 'owner1@gmail.com',
        password: hashedPassword,
        phone: '0977777777',
        address: 'Hoa Lac, Ha Noi',
        role: 'restaurant_owner',
      },
    ]);

    console.log('✅ Users seeded');

    // ──────────────────────────────────────
    // 2. RESTAURANTS (linked to owner)
    // ──────────────────────────────────────
    await Restaurant.insertMany([
      {
        _id: IDS.restaurantChicken,
        owner: IDS.owner,
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
        _id: IDS.restaurantComNgon,
        owner: IDS.owner,
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
        _id: IDS.restaurantNoodle,
        owner: IDS.owner,
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
      {
        _id: IDS.restaurantLumina,
        name: 'Lumina Osteria',
        address: 'Hoan Kiem, Ha Noi',
        category: 'Italian',
        image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=400&h=250&fit=crop',
        rating: 4.9,
        deliveryTime: '35-45 min',
      },
      {
        _id: IDS.restaurantAkira,
        name: 'Akira Omakase',
        address: 'Ba Dinh, Ha Noi',
        category: 'Japanese',
        image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400&h=250&fit=crop',
        rating: 4.8,
        deliveryTime: '40-55 min',
      },
      {
        _id: IDS.restaurantVerdant,
        name: 'Verdant Kitchen',
        address: 'Tay Ho, Ha Noi',
        category: 'Vegan',
        image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=250&fit=crop',
        rating: 4.7,
        deliveryTime: '25-35 min',
      },
      {
        _id: IDS.restaurantMaison,
        name: 'Maison De Sucre',
        address: 'Hai Ba Trung, Ha Noi',
        category: 'Desserts',
        image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=250&fit=crop',
        rating: 4.9,
        deliveryTime: '20-30 min',
      },
    ]);

    console.log('✅ Restaurants seeded');

    // ──────────────────────────────────────
    // 3. FOODS
    // ──────────────────────────────────────
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
        _id: IDS.spicyChickenWings,
        restaurant: IDS.restaurantChicken,
        name: 'Spicy Chicken Wings',
        description: 'Hot and spicy chicken wings served with ranch.',
        price: 6.0,
        image: IMAGES.spicyWings,
        category: 'Chicken',
        rating: 4.5,
      },
      {
        _id: IDS.chickenNuggets,
        restaurant: IDS.restaurantChicken,
        name: 'Chicken Nuggets',
        description: 'Crispy golden chicken nuggets, 10 pieces.',
        price: 4.0,
        image: IMAGES.chickenNuggets,
        category: 'Snack',
        rating: 4.8,
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
      {
        _id: IDS.foodTruffleRisotto,
        restaurant: IDS.restaurantLumina,
        name: 'Truffle Mushroom Risotto',
        description: 'Creamy Arborio rice with wild porcini mushrooms and black truffle.',
        price: 28.00,
        image: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=800&q=80',
        category: 'Italian',
        rating: 4.9,
      },
      {
        _id: IDS.foodSpicyTuna,
        restaurant: IDS.restaurantAkira,
        name: 'Spicy Tuna Roll',
        description: 'Fresh tuna with spicy mayo and crispy tempura flakes.',
        price: 15.00,
        image: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=500&q=80',
        category: 'Japanese',
        rating: 4.8,
      },
      {
        _id: IDS.foodBuddhaBowl,
        restaurant: IDS.restaurantVerdant,
        name: 'Vegan Buddha Bowl',
        description: 'Quinoa, roasted sweet potatoes, avocado, and tahini dressing.',
        price: 12.00,
        image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&q=80',
        category: 'Vegan',
        rating: 4.7,
      },
      {
        _id: IDS.foodLavaCake,
        restaurant: IDS.restaurantMaison,
        name: 'Chocolate Lava Cake',
        description: 'Warm chocolate cake with a molten center, served with vanilla ice cream.',
        price: 9.00,
        image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&q=80',
        category: 'Desserts',
        rating: 4.9,
      },
      {
        _id: IDS.foodMatchaCrepe,
        restaurant: IDS.restaurantMaison,
        name: 'Matcha Crepe',
        description: 'Delicate layers of crepe with matcha infused cream.',
        price: 8.50,
        image: 'https://images.unsplash.com/photo-1514849302-984523450ce4?w=500&q=80',
        category: 'Desserts',
        rating: 4.8,
      },
      {
        _id: IDS.foodAvocadoToast,
        restaurant: IDS.restaurantVerdant,
        name: 'Avocado Toast',
        description: 'Sourdough toast topped with smashed avocado and poached egg.',
        price: 11.00,
        image: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=500&q=80',
        category: 'Vegan',
        rating: 4.6,
      },
      {
        _id: IDS.foodSearedScallops,
        restaurant: IDS.restaurantLumina,
        name: 'Seared Scallops',
        description: 'Pan-seared scallops with cauliflower puree and herb oil.',
        price: 32.00,
        image: 'https://images.unsplash.com/photo-1599321955726-e048426594af?w=500&q=80',
        category: 'Seafood',
        rating: 4.9,
      },
      {
        _id: IDS.foodMasaSushi,
        restaurant: IDS.restaurantAkira,
        name: 'Masa Premium Sushi Set',
        description: 'Assorted premium sushi crafted by master chefs.',
        price: 45.00,
        image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=500&q=80',
        category: 'Japanese',
        rating: 4.9,
      },
      {
        _id: IDS.foodMargheritaPizza,
        restaurant: IDS.restaurantLumina,
        name: 'Margherita Pizza',
        description: 'Classic pizza with San Marzano tomatoes, mozzarella cheese, and fresh basil.',
        price: 18.00,
        image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=500&q=80',
        category: 'Italian',
        rating: 4.8,
      },
    ]);

    console.log('✅ Foods seeded');

    // ──────────────────────────────────────
    // 4. ORDERS + ORDER ITEMS
    // ──────────────────────────────────────
    const order1 = await Order.create({
      orderCode: 'ORD-000000000001',
      user: IDS.customer,
      restaurant: IDS.restaurantChicken,
      receiverName: 'Nguyen Customer',
      deliveryAddress: '742 Evergreen Terrace, Hoa Lac, Ha Noi',
      phone: '0988888888',
      itemsAmount: 14.5,
      totalAmount: 14.5,
      paymentMethod: 'COD',
      paymentStatus: 'unpaid',
      orderStatus: 'Pending',
      note: 'Please ring the doorbell.',
    });

    await OrderItem.insertMany([
      {
        order: order1._id,
        food: IDS.friedChicken,
        restaurant: IDS.restaurantChicken,
        foodName: 'Fried Chicken',
        foodImage: IMAGES.friedChicken,
        quantity: 2,
        price: 4.5,
        subtotal: 9.0,
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
    ]);

    const order2 = await Order.create({
      orderCode: 'ORD-000000000002',
      user: IDS.customer,
      restaurant: IDS.restaurantChicken,
      receiverName: 'Nguyen Customer',
      deliveryAddress: '15 Pham Van Dong, Cau Giay, Ha Noi',
      phone: '0988888888',
      itemsAmount: 5.5,
      totalAmount: 5.5,
      paymentMethod: 'MOCK_PAYMENT',
      paymentStatus: 'paid',
      orderStatus: 'Preparing',
      note: '',
    });

    await OrderItem.insertMany([
      {
        order: order2._id,
        food: IDS.chickenBurger,
        restaurant: IDS.restaurantChicken,
        foodName: 'Chicken Burger',
        foodImage: IMAGES.chickenBurger,
        quantity: 1,
        price: 5.5,
        subtotal: 5.5,
      },
    ]);

    const order3 = await Order.create({
      orderCode: 'ORD-000000000003',
      user: IDS.customer,
      restaurant: IDS.restaurantChicken,
      receiverName: 'Nguyen Customer',
      deliveryAddress: '22 Le Loi, Ba Dinh, Ha Noi',
      phone: '0988888888',
      itemsAmount: 15.5,
      totalAmount: 15.5,
      paymentMethod: 'MOCK_PAYMENT',
      paymentStatus: 'paid',
      orderStatus: 'Completed',
      note: 'Leave at the door.',
    });

    await OrderItem.insertMany([
      {
        order: order3._id,
        food: IDS.friedChicken,
        restaurant: IDS.restaurantChicken,
        foodName: 'Fried Chicken',
        foodImage: IMAGES.friedChicken,
        quantity: 1,
        price: 4.5,
        subtotal: 4.5,
      },
      {
        order: order3._id,
        food: IDS.chickenRice,
        restaurant: IDS.restaurantChicken,
        foodName: 'Chicken Rice',
        foodImage: IMAGES.chickenRice,
        quantity: 1,
        price: 5.0,
        subtotal: 5.0,
      },
      {
        order: order3._id,
        food: IDS.beefNoodle,
        restaurant: IDS.restaurantChicken,
        foodName: 'Beef Noodle Soup',
        foodImage: IMAGES.beefNoodle,
        quantity: 1,
        price: 6.0,
        subtotal: 6.0,
      },
    ]);

    console.log('✅ Orders & OrderItems seeded');

    // ──────────────────────────────────────
    // 5. CHAT + MESSAGES (Manh)
    // ──────────────────────────────────────
    const chat1 = await Chat.create({
      customer: IDS.customer,
      owner: IDS.owner,
      restaurant: IDS.restaurantChicken,
      lastMessage: "Sure, it's #ORD-84729.",
      status: 'active',
    });

    await Message.insertMany([
      {
        chat: chat1._id,
        sender: IDS.owner,
        content: 'Hello! How can we assist you with your order today?',
        messageType: 'text',
        isRead: true,
      },
      {
        chat: chat1._id,
        sender: IDS.customer,
        content: 'Hi, I just placed an order but realized I need to change the delivery address. Is it too late?',
        messageType: 'text',
        isRead: true,
      },
      {
        chat: chat1._id,
        sender: IDS.owner,
        content: 'Let me check that for you. Could you please provide your order number? It should be in your confirmation email.',
        messageType: 'text',
        isRead: true,
      },
      {
        chat: chat1._id,
        sender: IDS.customer,
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

    console.log('✅ Vouchers seeded');

    // ──────────────────────────────────────
    // 7. CART (Duy)
    // ──────────────────────────────────────
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

    console.log('✅ Cart seeded');

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
