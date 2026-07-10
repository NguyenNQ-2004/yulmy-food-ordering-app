const request = require('supertest');
const app = require('../src/app');
const { createOwnerWithRestaurant, createUser, createOrder } = require('./helpers');

const statusUrl = (id) => `/api/owner/orders/${id}/status`;

describe('GET /api/owner/orders', () => {
  test('returns owner\'s orders and supports ?status filter', async () => {
    const { token, restaurant } = await createOwnerWithRestaurant();
    const { user: customer } = await createUser('customer');
    await createOrder(restaurant._id, customer._id, { orderStatus: 'Pending' });
    await createOrder(restaurant._id, customer._id, { orderStatus: 'Completed' });

    const all = await request(app)
      .get('/api/owner/orders')
      .set('Authorization', `Bearer ${token}`);
    expect(all.status).toBe(200);
    expect(all.body.data).toHaveLength(2);
    // Each order is enriched with an items array.
    expect(all.body.data[0]).toHaveProperty('items');

    const pending = await request(app)
      .get('/api/owner/orders?status=Pending')
      .set('Authorization', `Bearer ${token}`);
    expect(pending.body.data).toHaveLength(1);
    expect(pending.body.data[0].orderStatus).toBe('Pending');
  });
});

describe('PUT /api/owner/orders/:id/status — transition rules', () => {
  test('valid transition Pending -> Confirmed (200)', async () => {
    const { token, restaurant } = await createOwnerWithRestaurant();
    const { user: customer } = await createUser('customer');
    const order = await createOrder(restaurant._id, customer._id, { orderStatus: 'Pending' });

    const res = await request(app)
      .put(statusUrl(order._id))
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'Confirmed' });

    expect(res.status).toBe(200);
    expect(res.body.data.orderStatus).toBe('Confirmed');
  });

  test('INVALID skip Pending -> Completed is rejected (400) and status unchanged', async () => {
    const { token, restaurant } = await createOwnerWithRestaurant();
    const { user: customer } = await createUser('customer');
    const order = await createOrder(restaurant._id, customer._id, { orderStatus: 'Pending' });

    const res = await request(app)
      .put(statusUrl(order._id))
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'Completed' });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/Cannot transition/i);

    const check = await request(app)
      .get('/api/owner/orders?status=Pending')
      .set('Authorization', `Bearer ${token}`);
    expect(check.body.data).toHaveLength(1); // still Pending
  });

  test('terminal Completed cannot transition anywhere (400)', async () => {
    const { token, restaurant } = await createOwnerWithRestaurant();
    const { user: customer } = await createUser('customer');
    const order = await createOrder(restaurant._id, customer._id, { orderStatus: 'Completed' });

    const res = await request(app)
      .put(statusUrl(order._id))
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'Delivering' });

    expect(res.status).toBe(400);
  });

  test('full happy-path chain Pending -> Confirmed -> Preparing -> Delivering -> Completed', async () => {
    const { token, restaurant } = await createOwnerWithRestaurant();
    const { user: customer } = await createUser('customer');
    const order = await createOrder(restaurant._id, customer._id, { orderStatus: 'Pending' });

    for (const status of ['Confirmed', 'Preparing', 'Delivering', 'Completed']) {
      const res = await request(app)
        .put(statusUrl(order._id))
        .set('Authorization', `Bearer ${token}`)
        .send({ status });
      expect(res.status).toBe(200);
      expect(res.body.data.orderStatus).toBe(status);
    }
  });

  test('404 when updating an order from another restaurant', async () => {
    const { token } = await createOwnerWithRestaurant();
    const other = await createOwnerWithRestaurant();
    const { user: customer } = await createUser('customer');
    const foreignOrder = await createOrder(other.restaurant._id, customer._id, { orderStatus: 'Pending' });

    const res = await request(app)
      .put(statusUrl(foreignOrder._id))
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'Confirmed' });

    expect(res.status).toBe(404);
  });

  test('403 when a customer tries to update order status', async () => {
    const { restaurant } = await createOwnerWithRestaurant();
    const { user: customer, token: customerToken } = await createUser('customer');
    const order = await createOrder(restaurant._id, customer._id, { orderStatus: 'Pending' });

    const res = await request(app)
      .put(statusUrl(order._id))
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ status: 'Confirmed' });

    expect(res.status).toBe(403);
  });
});
