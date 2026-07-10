const request = require('supertest');
const app = require('../src/app');
const {
  createUser,
  createOwnerWithRestaurant,
  createFood,
  createOrder,
} = require('./helpers');

describe('Owner: auth guard on /api/owner', () => {
  test('401 when no token provided', async () => {
    const res = await request(app).get('/api/owner/restaurant');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test('401 when token is garbage', async () => {
    const res = await request(app)
      .get('/api/owner/restaurant')
      .set('Authorization', 'Bearer not-a-real-token');
    expect(res.status).toBe(401);
  });

  test('403 when a customer hits an owner-only route', async () => {
    const { token } = await createUser('customer');
    const res = await request(app)
      .get('/api/owner/restaurant')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
});

describe('GET /api/owner/restaurant', () => {
  test('returns the owner\'s restaurant', async () => {
    const { token, restaurant } = await createOwnerWithRestaurant({ name: 'Pho Palace' });
    const res = await request(app)
      .get('/api/owner/restaurant')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Pho Palace');
    expect(res.body.data._id).toBe(restaurant._id.toString());
  });

  test('404 when the owner has no restaurant', async () => {
    const { token } = await createUser('restaurant_owner');
    const res = await request(app)
      .get('/api/owner/restaurant')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
  });
});

describe('PUT /api/owner/restaurant', () => {
  test('updates only allowed fields', async () => {
    const { token, restaurant } = await createOwnerWithRestaurant();
    const res = await request(app)
      .put('/api/owner/restaurant')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'New Name', description: 'Fresh', rating: 999 });

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('New Name');
    expect(res.body.data.description).toBe('Fresh');
    // rating is not in the allow-list, so it must stay at its default.
    expect(res.body.data.rating).toBe(restaurant.rating);
  });

  test('404 when owner has no restaurant', async () => {
    const { token } = await createUser('restaurant_owner');
    const res = await request(app)
      .put('/api/owner/restaurant')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'X' });
    expect(res.status).toBe(404);
  });
});

describe('GET /api/owner/dashboard aggregation', () => {
  test('aggregates orders, revenue, and active dishes correctly', async () => {
    const { owner, token, restaurant } = await createOwnerWithRestaurant();
    const { user: customer } = await createUser('customer');

    // Revenue only counts Completed orders: 100k + 200k = 300k.
    await createOrder(restaurant._id, customer._id, {
      orderStatus: 'Completed',
      totalAmount: 100000,
    });
    await createOrder(restaurant._id, customer._id, {
      orderStatus: 'Completed',
      totalAmount: 200000,
    });
    // Pending order counts toward totalOrders but not revenue.
    await createOrder(restaurant._id, customer._id, {
      orderStatus: 'Pending',
      totalAmount: 999999,
    });

    await createFood(restaurant._id, { isAvailable: true });
    await createFood(restaurant._id, { isAvailable: true });
    await createFood(restaurant._id, { isAvailable: false }); // not counted

    const res = await request(app)
      .get('/api/owner/dashboard')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.totalOrders).toBe(3);
    expect(res.body.data.totalRevenue).toBe(300000);
    expect(res.body.data.activeDishes).toBe(2);
    expect(Array.isArray(res.body.data.chartData)).toBe(true);
    expect(res.body.data.chartData).toHaveLength(7);
    expect(res.body.data.recentOrders.length).toBeLessThanOrEqual(5);
  });

  test('does not leak another restaurant\'s orders', async () => {
    const { token, restaurant } = await createOwnerWithRestaurant();
    const other = await createOwnerWithRestaurant();
    const { user: customer } = await createUser('customer');

    await createOrder(restaurant._id, customer._id, { orderStatus: 'Completed', totalAmount: 100 });
    // Belongs to another restaurant — must be excluded.
    await createOrder(other.restaurant._id, customer._id, { orderStatus: 'Completed', totalAmount: 5000 });

    const res = await request(app)
      .get('/api/owner/dashboard')
      .set('Authorization', `Bearer ${token}`);

    expect(res.body.data.totalOrders).toBe(1);
    expect(res.body.data.totalRevenue).toBe(100);
  });
});
