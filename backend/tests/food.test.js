const request = require('supertest');
const app = require('../src/app');
const Food = require('../src/models/Food');
const { createOwnerWithRestaurant, createFood } = require('./helpers');

describe('Food CRUD on /api/owner/foods', () => {
  test('GET lists only the owner\'s foods', async () => {
    const { token, restaurant } = await createOwnerWithRestaurant();
    const other = await createOwnerWithRestaurant();
    await createFood(restaurant._id, { name: 'Mine' });
    await createFood(other.restaurant._id, { name: 'Theirs' });

    const res = await request(app)
      .get('/api/owner/foods')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].name).toBe('Mine');
  });

  test('POST creates a food item (201)', async () => {
    const { token, restaurant } = await createOwnerWithRestaurant();
    const res = await request(app)
      .post('/api/owner/foods')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Banh Mi', price: 30000, category: 'Sandwich' });

    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe('Banh Mi');
    expect(res.body.data.restaurant).toBe(restaurant._id.toString());

    const inDb = await Food.findById(res.body.data._id);
    expect(inDb).not.toBeNull();
  });

  test('POST 400 when name or price is missing', async () => {
    const { token } = await createOwnerWithRestaurant();
    const noPrice = await request(app)
      .post('/api/owner/foods')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'No Price' });
    expect(noPrice.status).toBe(400);

    const noName = await request(app)
      .post('/api/owner/foods')
      .set('Authorization', `Bearer ${token}`)
      .send({ price: 1000 });
    expect(noName.status).toBe(400);
  });

  test('PUT updates the owner\'s food', async () => {
    const { token, restaurant } = await createOwnerWithRestaurant();
    const food = await createFood(restaurant._id, { name: 'Old', price: 10 });

    const res = await request(app)
      .put(`/api/owner/foods/${food._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'New', price: 20, isAvailable: false });

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('New');
    expect(res.body.data.price).toBe(20);
    expect(res.body.data.isAvailable).toBe(false);
  });

  test('DELETE removes the owner\'s food', async () => {
    const { token, restaurant } = await createOwnerWithRestaurant();
    const food = await createFood(restaurant._id);

    const res = await request(app)
      .delete(`/api/owner/foods/${food._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(await Food.findById(food._id)).toBeNull();
  });
});

describe('Food ownership isolation', () => {
  test('owner CANNOT delete another owner\'s food (404, still exists)', async () => {
    const { token } = await createOwnerWithRestaurant();
    const other = await createOwnerWithRestaurant();
    const victimFood = await createFood(other.restaurant._id);

    const res = await request(app)
      .delete(`/api/owner/foods/${victimFood._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
    // The other owner's food must be untouched.
    expect(await Food.findById(victimFood._id)).not.toBeNull();
  });

  test('owner CANNOT update another owner\'s food (404)', async () => {
    const { token } = await createOwnerWithRestaurant();
    const other = await createOwnerWithRestaurant();
    const victimFood = await createFood(other.restaurant._id, { name: 'Untouched' });

    const res = await request(app)
      .put(`/api/owner/foods/${victimFood._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Hacked' });

    expect(res.status).toBe(404);
    const reloaded = await Food.findById(victimFood._id);
    expect(reloaded.name).toBe('Untouched');
  });

  test('404 for a well-formed but non-existent food id', async () => {
    const { token } = await createOwnerWithRestaurant();
    const fakeId = '5f9f1b9b9b9b9b9b9b9b9b9b';
    const res = await request(app)
      .delete(`/api/owner/foods/${fakeId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
  });
});
