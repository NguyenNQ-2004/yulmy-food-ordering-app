import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Injected by app.config.js from EXPO_PUBLIC_API_URL. Localhost fallback keeps
// web dev and the jest suite working when no env/extra is present.
const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
});

// Request interceptor: attach JWT token automatically
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      // AsyncStorage error — proceed without token
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — could trigger logout here
      console.warn('Unauthorized request — token may be expired.');
    }
    return Promise.reject(error);
  }
);

export default api;