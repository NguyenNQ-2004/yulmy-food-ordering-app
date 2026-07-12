const mongoose = require('mongoose');
const connectDB = require('./src/config/db');
const Cart = require('./src/models/Cart');
const Food = require('./src/models/Food');

async function testCart() {
  await connectDB();
  const userId = '66a000000000000000000001';
  
  // get two foods from same restaurant
  const foods = await Food.find({ restaurant: '66b000000000000000000001' }).limit(2);
  if (foods.length < 2) {
    console.log('Not enough foods');
    process.exit(1);
  }

  // Clear cart
  await Cart.deleteMany({ user: userId });

  // Simulate addItemToCart for Food 1
  let cart = new Cart({
    user: userId,
    restaurant: foods[0].restaurant,
    items: [{
      food: foods[0]._id,
      name: foods[0].name,
      quantity: 1,
      price: foods[0].price,
      subtotal: foods[0].price
    }]
  });
  await cart.save();
  console.log('Cart after item 1:', cart.items.length);

  // Simulate addItemToCart for Food 2
  cart = await Cart.findOne({ user: userId });
  cart.items.push({
    food: foods[1]._id,
    name: foods[1].name,
    quantity: 1,
    price: foods[1].price,
    subtotal: foods[1].price
  });

  // the calculateCartTotals logic
  const normalizedItems = cart.items.map((item) => {
    return {
      food: item.food,
      name: item.name,
      image: item.image || '',
      quantity: item.quantity,
      price: item.price,
      subtotal: item.quantity * item.price,
    };
  });

  cart.items = normalizedItems;
  cart.totalItems = 2;
  cart.totalAmount = foods[0].price + foods[1].price;

  try {
    await cart.save();
    console.log('Cart after item 2:', cart.items.length);
  } catch (err) {
    console.error('Error saving cart 2:', err.message);
  }

  process.exit(0);
}

testCart();
