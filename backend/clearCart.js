const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.resolve(__dirname, 'src/.env') });
// Try both .env locations
dotenv.config({ path: path.resolve(__dirname, '.env') });

const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/yulmy_db';

async function clearCarts() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');
    const result = await mongoose.connection.db.collection('carts').deleteMany({});
    console.log(`Deleted ${result.deletedCount} cart(s).`);
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

clearCarts();
