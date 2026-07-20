const http = require('http');

function request(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api' + path,
      method,
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

async function test() {
  // Login
  const login = await request('POST', '/auth/login', { email: 'user@gmail.com', password: '123456' });
  if (login.status !== 200) { console.error('Login failed:', login.body); return; }
  const token = login.body.data.token;
  console.log('✅ Login OK');

  // Add item
  const add = await request('POST', '/cart/items', { foodId: '66c000000000000000000001', quantity: 1 }, token);
  console.log('Add to cart status:', add.status);
  if (add.status === 200) {
    const items = add.body.data?.cart?.items || [];
    console.log('Cart items:', items.map(i => `${i.name} x${i.quantity}`));
  } else {
    console.error('Add failed:', add.body);
  }
}
test().catch(console.error);
