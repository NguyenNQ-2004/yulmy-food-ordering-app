const dotenv = require('dotenv');
const path = require('path');

const connectDB = require('../config/db');
const Cart = require('../models/Cart');
const Food = require('../models/Food');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Payment = require('../models/Payment');
const Voucher = require('../models/Voucher');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const PRICE_BY_FOOD_ID = {
  '66c000000000000000000001': 4.5,
  '66c000000000000000000002': 5.5,
  '66c000000000000000000003': 5,
  '66c000000000000000000004': 6,
};

const AMOUNT_MAP = new Map([
  [30000, 3],
  [45000, 4.5],
  [50000, 5],
  [55000, 5.5],
  [60000, 6],
  [75000, 7.5],
  [90000, 9],
  [145000, 14.5],
  [145500, 14.55],
  [15000, 1.5],
  [14500, 1.45],
  [20000, 2],
]);

function toUsdAmount(value) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return value;
  }

  return AMOUNT_MAP.get(numericValue) ?? numericValue;
}

async function migrateCurrencyToUsd() {
  await connectDB();

  await Promise.all(
    Object.entries(PRICE_BY_FOOD_ID).map(([foodId, price]) =>
      Food.updateOne({ _id: foodId }, { $set: { price } })
    )
  );

  await Voucher.updateOne(
    { code: 'YULMY10' },
    {
      $set: {
        minOrderAmount: 5,
        maxDiscountAmount: 2,
      },
    }
  );

  await Voucher.updateOne(
    { code: 'FREESHIP' },
    {
      $set: {
        description: 'Get $1.50 discount for delivery fee.',
        discountValue: 1.5,
        minOrderAmount: 3,
        maxDiscountAmount: 1.5,
      },
    }
  );

  const carts = await Cart.find();
  for (const cart of carts) {
    cart.items = cart.items.map((item) => {
      const foodId = item.food?.toString();
      const price = PRICE_BY_FOOD_ID[foodId] ?? toUsdAmount(item.price);

      item.price = price;
      item.subtotal = Number((price * item.quantity).toFixed(2));
      return item;
    });
    cart.totalAmount = Number(cart.items.reduce((sum, item) => sum + item.subtotal, 0).toFixed(2));
    await cart.save();
  }

  const orderItems = await OrderItem.find();
  for (const orderItem of orderItems) {
    const foodId = orderItem.food?.toString();
    const price = PRICE_BY_FOOD_ID[foodId] ?? toUsdAmount(orderItem.price);

    orderItem.price = price;
    orderItem.subtotal = Number((price * orderItem.quantity).toFixed(2));
    await orderItem.save();
  }

  const orders = await Order.find();
  for (const order of orders) {
    order.itemsAmount = toUsdAmount(order.itemsAmount);
    order.deliveryFee = toUsdAmount(order.deliveryFee);
    order.discountAmount = toUsdAmount(order.discountAmount);
    order.totalAmount = toUsdAmount(order.totalAmount);
    await order.save();
  }

  const payments = await Payment.find();
  for (const payment of payments) {
    payment.amount = toUsdAmount(payment.amount);
    await payment.save();
  }

  console.log('Currency migration to USD completed successfully');
  process.exit(0);
}

migrateCurrencyToUsd().catch((error) => {
  console.error(`Currency migration failed: ${error.message}`);
  process.exit(1);
});
