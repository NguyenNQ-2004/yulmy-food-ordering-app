const http = require('http');

let passed = 0;
let failed = 0;
const errors = [];

function request(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const options = {
      hostname: 'localhost', port: 5000, path: '/api' + path, method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: 'Bearer ' + token } : {}),
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
      },
    };
    const req = http.request(options, (res) => {
      let d = '';
      res.on('data', (c) => (d += c));
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(d) }); }
        catch { resolve({ status: res.statusCode, body: d }); }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

function assert(name, condition, detail = '') {
  if (condition) { passed++; console.log(`  ✅ ${name}`); }
  else { failed++; errors.push({ name, detail }); console.log(`  ❌ ${name}${detail ? ': ' + detail : ''}`); }
}

async function run() {
  console.log('\n=== YULMY API TEST SUITE ===\n');
  let customerToken, adminToken, ownerToken;

  // AUTH TESTS
  console.log('--- AUTH ---');

  // Login as customer
  let r = await request('POST', '/auth/login', { email: 'user@gmail.com', password: '123456' });
  assert('Customer login', r.status === 200 && r.body.data?.token);
  customerToken = r.body.data?.token;

  // Login as admin
  r = await request('POST', '/auth/login', { email: 'admin@gmail.com', password: '123456' });
  assert('Admin login', r.status === 200 && r.body.data?.token);
  adminToken = r.body.data?.token;

  // Login as owner
  r = await request('POST', '/auth/login', { email: 'owner1@gmail.com', password: '123456' });
  assert('Owner login', r.status === 200 && r.body.data?.token);
  ownerToken = r.body.data?.token;

  // Bad credentials
  r = await request('POST', '/auth/login', { email: 'wrong@test.com', password: 'wrong' });
  assert('Reject bad credentials', r.status === 401);

  // Register new user
  const testEmail = `test_${Date.now()}@test.com`;
  r = await request('POST', '/auth/register', { fullName: 'Test User', email: testEmail, password: '123456', phone: '0900000000' });
  assert('Register new user', r.status === 201);

  // Duplicate registration
  r = await request('POST', '/auth/register', { fullName: 'Test User', email: 'user@gmail.com', password: '123456' });
  assert('Reject duplicate email', r.status === 400);

  // Get current user
  r = await request('GET', '/auth/me', null, customerToken);
  assert('Get current user (customer)', r.status === 200 && r.body.data?.email === 'user@gmail.com');

  // Unauthorized access  
  r = await request('GET', '/auth/me', null, null);
  assert('Reject no token on protected route', r.status === 401);

  // CUSTOMER ROUTES (public)
  console.log('\n--- CUSTOMER PUBLIC ROUTES ---');

  r = await request('GET', '/customer/restaurants');
  assert('Get restaurants (public)', r.status === 200 && Array.isArray(r.body.data));
  const restaurants = r.body.data || [];
  assert('Has restaurants in DB', restaurants.length > 0, `Got ${restaurants.length}`);

  r = await request('GET', '/customer/foods');
  assert('Get all foods (public)', r.status === 200 && Array.isArray(r.body.data));
  const foods = r.body.data || [];
  assert('Has foods in DB', foods.length > 0, `Got ${foods.length}`);

  if (restaurants.length > 0) {
    r = await request('GET', `/customer/restaurants/${restaurants[0]._id}/foods`);
    assert('Get foods by restaurant (public)', r.status === 200);
  }

  // Favorites (protected)
  r = await request('GET', '/customer/favorites', null, null);
  assert('Favorites requires auth', r.status === 401);

  r = await request('GET', '/customer/favorites', null, customerToken);
  assert('Get favorites (authenticated)', r.status === 200);

  // CART TESTS
  console.log('\n--- CART ---');

  r = await request('GET', '/cart', null, null);
  assert('Cart requires auth', r.status === 401);

  r = await request('GET', '/cart', null, customerToken);
  assert('Get my cart (customer)', r.status === 200);

  // Add item to cart
  if (foods.length > 0) {
    // Clear cart first to avoid "items from another restaurant" error
    await request('DELETE', '/cart', null, customerToken);
    
    const foodId = foods[0]._id;
    r = await request('POST', '/cart/items', { foodId, quantity: 1 }, customerToken);
    assert('Add item to cart', r.status === 200, r.body.message);
    
    if (r.status === 200) {
      const cartItems = r.body.data?.cart?.items || [];
      assert('Cart item added correctly', cartItems.some(i => i.food?.toString() === foodId || i.name === foods[0].name));
    }
  }

  // VOUCHER TESTS  
  console.log('\n--- VOUCHERS ---');

  r = await request('GET', '/vouchers', null, customerToken);
  assert('Get vouchers (authenticated)', r.status === 200);

  r = await request('POST', '/vouchers/validate', { code: 'YULMY10', itemsAmount: 10 }, customerToken);
  assert('Validate voucher YULMY10', r.status === 200, r.body.message);

  r = await request('POST', '/vouchers/validate', { code: 'INVALID', itemsAmount: 10 }, customerToken);
  assert('Reject invalid voucher', r.status !== 200);

  // ORDER TESTS
  console.log('\n--- ORDERS ---');

  r = await request('GET', '/orders/my', null, customerToken);
  assert('Get my orders', r.status === 200);

  // Admin routes
  console.log('\n--- ADMIN ROUTES ---');

  r = await request('GET', '/admin/dashboard', null, null);
  assert('Admin routes require auth', r.status === 401);

  r = await request('GET', '/admin/dashboard', null, customerToken);
  assert('Admin routes reject non-admin', r.status === 403);

  r = await request('GET', '/admin/dashboard', null, adminToken);
  assert('Admin dashboard accessible', r.status === 200);

  r = await request('GET', '/admin/users', null, adminToken);
  assert('Admin get users', r.status === 200 && Array.isArray(r.body.data));
  
  r = await request('GET', '/admin/restaurants', null, adminToken);
  assert('Admin get restaurants', r.status === 200);

  r = await request('GET', '/admin/foods', null, adminToken);
  assert('Admin get foods', r.status === 200);

  r = await request('GET', '/admin/orders', null, adminToken);
  assert('Admin get orders', r.status === 200);

  r = await request('GET', '/admin/reviews', null, adminToken);
  assert('Admin get reviews', r.status === 200);

  // OWNER ROUTES
  console.log('\n--- OWNER ROUTES ---');

  r = await request('GET', '/owner/restaurant', null, null);
  assert('Owner routes require auth', r.status === 401);

  r = await request('GET', '/owner/restaurant', null, customerToken);
  assert('Owner routes reject non-owner', r.status === 403);

  r = await request('GET', '/owner/restaurant', null, ownerToken);
  assert('Owner get restaurant', r.status === 200 || r.status === 404, r.body?.message);

  r = await request('GET', '/owner/dashboard', null, ownerToken);
  assert('Owner get dashboard', r.status === 200 || r.status === 404, r.body?.message);

  r = await request('GET', '/owner/foods', null, ownerToken);
  assert('Owner get foods', r.status === 200);

  r = await request('GET', '/owner/orders', null, ownerToken);
  assert('Owner get orders', r.status === 200);

  // Summary
  console.log(`\n=== RESULTS ===`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  if (errors.length > 0) {
    console.log('\nFailed tests:');
    errors.forEach(e => console.log(`  - ${e.name}${e.detail ? ': ' + e.detail : ''}`));
  }
}

run().catch(console.error);
