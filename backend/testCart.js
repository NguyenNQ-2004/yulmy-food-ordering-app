const http = require('http');

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2YTAwMDAwMDAwMDAwMDAwMDAwMDAwMSIsInJvbGUiOiJjdXN0b21lciIsImlhdCI6MTc4MzcwNzk0NSwiZXhwIjoxNzg2Mjk5OTQ1fQ.g4uYicfftiNdH9oZgUBU_ROFhl8QP5muyO1EW8pYBM8';

function request(method, path, data) {
  return new Promise((resolve) => {
    const payload = data ? JSON.stringify(data) : '';
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Content-Length': payload.length
      }
    }, res => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => resolve(JSON.parse(body)));
    });
    if (payload) req.write(payload);
    req.end();
  });
}

async function run() {
  console.log('Clearing cart...');
  await request('DELETE', '/api/cart');

  console.log('Adding Truffle Mushroom Risotto (1/3)...');
  let res = await request('POST', '/api/cart/items', { foodId: '66c000000000000000000005', quantity: 1 });
  console.log('Total items:', res.data.cart.totalItems);

  console.log('Adding Seared Scallops (2/3)...');
  res = await request('POST', '/api/cart/items', { foodId: '66c00000000000000000000b', quantity: 1 });
  console.log('Total items:', res.data.cart.totalItems);
  
  console.log('Adding Margherita Pizza (3/3)...');
  res = await request('POST', '/api/cart/items', { foodId: '66c00000000000000000000d', quantity: 1 });
  console.log('Response:', JSON.stringify(res, null, 2));
}

run();
