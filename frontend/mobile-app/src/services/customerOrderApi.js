import api from './api';

export async function getMyCart() {
  const response = await api.get('/cart');
  return response.data.data.cart;
}

export async function addItemToCart(foodId, quantity = 1) {
  const response = await api.post('/cart/items', {
    foodId,
    quantity,
  });
  return response.data.data.cart;
}

export async function updateCartItem(foodId, quantity) {
  const response = await api.put(`/cart/items/${foodId}`, { quantity });
  return response.data.data.cart;
}

export async function clearCart() {
  const response = await api.delete('/cart');
  return response.data.data.cart;
}

export async function getActiveVouchers() {
  const response = await api.get('/vouchers');
  return response.data.data.vouchers;
}

export async function validateVoucher(code, itemsAmount) {
  const response = await api.post('/vouchers/validate', {
    code,
    itemsAmount,
  });
  return response.data.data;
}

export async function checkoutOrder(payload) {
  const response = await api.post('/orders/checkout', payload);
  return response.data.data;
}

export async function mockOrderPayment(orderId, result = 'success') {
  const response = await api.post(`/orders/${orderId}/payment/mock`, { result });
  return response.data.data;
}

export async function getOrderStatus(orderId) {
  const response = await api.get(`/orders/${orderId}/status`);
  return response.data.data;
}
