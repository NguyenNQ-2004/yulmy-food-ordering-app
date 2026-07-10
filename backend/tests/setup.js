const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Pin secrets BEFORE any app/controller code reads them, so the JWT helper
// and the auth middleware agree, and the AI controller sees a configured key.
process.env.JWT_SECRET = 'test_secret_key';
process.env.GEMINI_API_KEY = 'test-gemini-key';

let mongo;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
});

// Clear all collections between tests so each test is isolated.
afterEach(async () => {
  const { collections } = mongoose.connection;
  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
  if (mongo) await mongo.stop();
});
