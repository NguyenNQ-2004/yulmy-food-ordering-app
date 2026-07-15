import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { AuthContext } from './AuthContext';
import api from '../services/api';

export const AdminContext = createContext();

const FOOD_CATEGORIES = [
  'Fast Food',
  'Japanese',
  'Italian',
  'Bakery',
  'Healthy',
  'Beverage',
];

const safeArray = (value) => (Array.isArray(value) ? value : []);

const normalizeFood = (food) => ({
  id: food._id,
  name: food.name,
  restaurantId: food.restaurant?._id || '',
  restaurantName: food.restaurant?.name || 'Unknown Restaurant',
  restaurantAddress: food.restaurant?.address || '',
  category: food.category || 'Food',
  price: Number(food.price || 0).toFixed(2),
  rating: Number(food.rating || 0),
  status: food.isAvailable ? 'live' : 'inactive',
  description: food.description || '',
  image: food.image || '',
});

const normalizeRestaurant = (restaurant) => ({
  id: restaurant._id,
  ownerId: restaurant.owner?._id || '',
  ownerName: restaurant.owner?.fullName || 'Unassigned',
  ownerEmail: restaurant.owner?.email || '',
  name: restaurant.name,
  address: restaurant.address,
  category: restaurant.category || 'Food',
  image: restaurant.image || '',
  rating: Number(restaurant.rating || 0),
  deliveryTime: restaurant.deliveryTime || '20-30 min',
  status: restaurant.status || 'active',
});

const normalizeUser = (user) => ({
  id: user._id,
  fullName: user.fullName,
  email: user.email,
  role: user.role,
  status: user.status,
  phone: user.phone || '',
  avatarUrl: user.avatar || '',
  address: user.address || '',
  preferences: {
    twoFactorEnabled: Boolean(user.preferences?.twoFactorEnabled),
    pushNotificationsEnabled: Boolean(user.preferences?.pushNotificationsEnabled),
    emailReportsEnabled: Boolean(user.preferences?.emailReportsEnabled),
  },
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
  joinedAt: new Date(user.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }),
  avatar: user.fullName
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase(),
});

const normalizeOrder = (order) => ({
  id: order._id,
  code: order.orderCode || String(order._id).slice(-6).toUpperCase(),
  customerName: order.user?.fullName || 'Unknown User',
  customerEmail: order.user?.email || '',
  customerPhone: order.user?.phone || order.phone || '',
  restaurantName: order.restaurant?.name || 'Unknown Restaurant',
  receiverName: order.receiverName || order.user?.fullName || 'Unknown Receiver',
  deliveryAddress: order.deliveryAddress,
  phone: order.phone || '',
  itemsAmount: Number(order.itemsAmount || 0),
  itemsAmountLabel: `$${Number(order.itemsAmount || 0).toFixed(2)}`,
  deliveryFee: Number(order.deliveryFee || 0),
  deliveryFeeLabel: `$${Number(order.deliveryFee || 0).toFixed(2)}`,
  discountAmount: Number(order.discountAmount || 0),
  discountAmountLabel: `$${Number(order.discountAmount || 0).toFixed(2)}`,
  totalAmount: Number(order.totalAmount || 0),
  totalAmountLabel: `$${Number(order.totalAmount || 0).toFixed(2)}`,
  paymentMethod: order.paymentMethod,
  paymentStatus: order.paymentStatus,
  payment: order.payment
    ? {
        id: order.payment.id,
        amount: Number(order.payment.amount || 0),
        amountLabel: order.payment.amountLabel || `$${Number(order.payment.amount || 0).toFixed(2)}`,
        method: order.payment.method || order.paymentMethod,
        status: order.payment.status || '',
        transactionCode: order.payment.transactionCode || '',
        paidAt: order.payment.paidAt || null,
        failureReason: order.payment.failureReason || '',
      }
    : null,
  orderStatus: order.orderStatus,
  allowedNextStatuses: Array.isArray(order.allowedNextStatuses)
    ? order.allowedNextStatuses
    : [],
  note: order.note || '',
  itemCount: order.itemCount || 0,
  createdAt: order.createdAt,
  updatedAt: order.updatedAt,
  createdAtLabel: new Date(order.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }),
  updatedAtLabel: order.updatedAt
    ? new Date(order.updatedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '',
});

const normalizeOrderDetail = (order) => ({
  ...normalizeOrder(order),
  restaurantAddress: order.restaurant?.address || '',
  restaurantCategory: order.restaurant?.category || '',
  customerAddress: order.user?.address || '',
  items: safeArray(order.items).map((item) => ({
    id: item.id || item._id,
    foodId: item.foodId || item.food?._id || '',
    foodName: item.foodName || item.food?.name || 'Unknown Food',
    foodImage: item.foodImage || item.food?.image || '',
    quantity: Number(item.quantity || 0),
    price: Number(item.price || 0),
    priceLabel: item.priceLabel || `$${Number(item.price || 0).toFixed(2)}`,
    subtotal: Number(item.subtotal || 0),
    subtotalLabel:
      item.subtotalLabel || `$${Number(item.subtotal || 0).toFixed(2)}`,
  })),
});

const normalizeReview = (review) => ({
  id: review._id,
  customerName: review.user?.fullName || 'Unknown User',
  customerEmail: review.user?.email || '',
  foodName: review.food?.name || 'Unknown Food',
  restaurantName: review.restaurant?.name || 'Unknown Restaurant',
  rating: Number(review.rating || 0),
  comment: review.comment || '',
  status: review.status,
  createdAtLabel: new Date(review.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }),
});

export function AdminProvider({ children }) {
  const { currentUser, token } = useContext(AuthContext);
  const [dashboard, setDashboard] = useState(null);
  const [users, setUsers] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [foods, setFoods] = useState([]);
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState({
    totalReviews: 0,
    averageRating: '0.0',
    pendingCount: 0,
  });
  const [loading, setLoading] = useState({
    dashboard: false,
    users: false,
    restaurants: false,
    foods: false,
    orders: false,
    reviews: false,
  });
  const [error, setError] = useState('');

  const loadDashboard = async () => {
    setLoading((current) => ({ ...current, dashboard: true }));
    try {
      const response = await api.get('/admin/dashboard');
      setDashboard(response.data.data);
      setError('');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Failed to load dashboard');
    } finally {
      setLoading((current) => ({ ...current, dashboard: false }));
    }
  };

  const loadUsers = async () => {
    setLoading((current) => ({ ...current, users: true }));
    try {
      const response = await api.get('/admin/users');
      setUsers(safeArray(response.data.data).map(normalizeUser));
      setError('');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading((current) => ({ ...current, users: false }));
    }
  };

  const loadRestaurants = async () => {
    setLoading((current) => ({ ...current, restaurants: true }));
    try {
      const response = await api.get('/admin/restaurants');
      setRestaurants(safeArray(response.data.data).map(normalizeRestaurant));
      setError('');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Failed to load restaurants');
    } finally {
      setLoading((current) => ({ ...current, restaurants: false }));
    }
  };

  const loadFoods = async () => {
    setLoading((current) => ({ ...current, foods: true }));
    try {
      const response = await api.get('/admin/foods');
      setFoods(safeArray(response.data.data).map(normalizeFood));
      setError('');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Failed to load foods');
    } finally {
      setLoading((current) => ({ ...current, foods: false }));
    }
  };

  const loadOrders = async () => {
    setLoading((current) => ({ ...current, orders: true }));
    try {
      const response = await api.get('/admin/orders');
      setOrders(safeArray(response.data.data).map(normalizeOrder));
      setError('');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Failed to load orders');
    } finally {
      setLoading((current) => ({ ...current, orders: false }));
    }
  };

  const loadReviews = async () => {
    setLoading((current) => ({ ...current, reviews: true }));
    try {
      const response = await api.get('/admin/reviews');
      setReviews(safeArray(response.data.data.reviews).map(normalizeReview));
      setReviewStats(
        response.data.data.stats || {
          totalReviews: 0,
          averageRating: '0.0',
          pendingCount: 0,
        }
      );
      setError('');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Failed to load reviews');
    } finally {
      setLoading((current) => ({ ...current, reviews: false }));
    }
  };

  const reloadAll = async () => {
    await Promise.all([
      loadDashboard(),
      loadUsers(),
      loadRestaurants(),
      loadFoods(),
      loadOrders(),
      loadReviews(),
    ]);
  };

  useEffect(() => {
    if (token && currentUser?.role === 'admin') {
      reloadAll();
    }
  }, [token, currentUser?.role]);

  const addFood = async (payload) => {
    const response = await api.post('/admin/foods', {
      restaurant: payload.restaurantId,
      name: payload.name,
      description: payload.description,
      price: Number(payload.price),
      image: payload.image,
      category: payload.category,
      rating: Number(payload.rating),
      isAvailable: payload.status === 'live',
    });

    const newFood = normalizeFood(response.data.data);
    setFoods((currentFoods) => [newFood, ...currentFoods]);
    loadDashboard();
    return newFood;
  };

  const updateFood = async (foodId, payload) => {
    const response = await api.put(`/admin/foods/${foodId}`, {
      restaurant: payload.restaurantId,
      name: payload.name,
      description: payload.description,
      price: Number(payload.price),
      image: payload.image,
      category: payload.category,
      rating: Number(payload.rating),
      isAvailable: payload.status === 'live',
    });

    const updatedFood = normalizeFood(response.data.data);
    setFoods((currentFoods) =>
      currentFoods.map((food) => (food.id === foodId ? updatedFood : food))
    );
    loadDashboard();
  };

  const deleteFood = async (foodId) => {
    await api.delete(`/admin/foods/${foodId}`);
    setFoods((currentFoods) => currentFoods.filter((food) => food.id !== foodId));
    loadDashboard();
  };

  const createRestaurant = async (payload) => {
    const response = await api.post('/admin/restaurants', {
      owner: payload.ownerId || null,
      name: payload.name,
      address: payload.address,
      category: payload.category,
      image: payload.image,
      rating: Number(payload.rating),
      deliveryTime: payload.deliveryTime,
      status: payload.status,
    });

    const newRestaurant = normalizeRestaurant(response.data.data);
    setRestaurants((currentRestaurants) => [newRestaurant, ...currentRestaurants]);
    loadDashboard();
    return newRestaurant;
  };

  const updateRestaurant = async (restaurantId, payload) => {
    const response = await api.put(`/admin/restaurants/${restaurantId}`, {
      owner: payload.ownerId || null,
      name: payload.name,
      address: payload.address,
      category: payload.category,
      image: payload.image,
      rating: Number(payload.rating),
      deliveryTime: payload.deliveryTime,
      status: payload.status,
    });

    const updatedRestaurant = normalizeRestaurant(response.data.data);
    setRestaurants((currentRestaurants) =>
      currentRestaurants.map((restaurant) =>
        restaurant.id === restaurantId ? updatedRestaurant : restaurant
      )
    );
    loadDashboard();
    loadFoods();
  };

  const deleteRestaurant = async (restaurantId) => {
    await api.delete(`/admin/restaurants/${restaurantId}`);
    setRestaurants((currentRestaurants) =>
      currentRestaurants.filter((restaurant) => restaurant.id !== restaurantId)
    );
    loadDashboard();
    loadFoods();
  };

  const toggleUserStatus = async (userId, nextStatus) => {
    const response = await api.patch(`/admin/users/${userId}/status`, {
      status: nextStatus,
    });

    const updatedUser = normalizeUser(response.data.data);
    setUsers((currentUsers) =>
      currentUsers.map((user) => (user.id === userId ? updatedUser : user))
    );
    return updatedUser;
  };

  const createUser = async (payload) => {
    const response = await api.post('/admin/users', payload);
    const newUser = normalizeUser(response.data.data);
    setUsers((currentUsers) => [newUser, ...currentUsers]);
    await loadDashboard();
    return newUser;
  };

  const updateUser = async (userId, payload) => {
    const response = await api.put(`/admin/users/${userId}`, payload);
    const updatedUser = normalizeUser(response.data.data);
    setUsers((currentUsers) =>
      currentUsers.map((user) => (user.id === userId ? updatedUser : user))
    );
    return updatedUser;
  };

  const deleteUser = async (userId) => {
    const response = await api.delete(`/admin/users/${userId}`);
    setUsers((currentUsers) => currentUsers.filter((user) => user.id !== userId));
    await loadDashboard();
    return response.data;
  };

  const updateOrderStatus = async (orderId, orderStatus) => {
    const response = await api.patch(`/admin/orders/${orderId}/status`, { orderStatus });
    const updatedOrder = normalizeOrderDetail(response.data.data);
    setOrders((currentOrders) =>
      currentOrders.map((order) => (order.id === orderId ? updatedOrder : order))
    );
    await loadDashboard();
    return updatedOrder;
  };

  const getOrderDetail = async (orderId) => {
    const response = await api.get(`/admin/orders/${orderId}`);
    return normalizeOrderDetail(response.data.data);
  };

  const updateReviewStatus = async (reviewId, status) => {
    await api.patch(`/admin/reviews/${reviewId}/status`, { status });
    await loadReviews();
  };

  const value = useMemo(
    () => ({
      dashboard,
      users,
      restaurants,
      foods,
      orders,
      reviews,
      reviewStats,
      loading,
      error,
      foodCategories: FOOD_CATEGORIES,
      loadDashboard,
      loadUsers,
      loadRestaurants,
      loadFoods,
      loadOrders,
      loadReviews,
      reloadAll,
      addFood,
      updateFood,
      deleteFood,
      createRestaurant,
      updateRestaurant,
      deleteRestaurant,
      toggleUserStatus,
      createUser,
      updateUser,
      deleteUser,
      getOrderDetail,
      updateOrderStatus,
      updateReviewStatus,
    }),
    [
      dashboard,
      users,
      restaurants,
      foods,
      orders,
      reviews,
      reviewStats,
      loading,
      error,
    ]
  );

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}
