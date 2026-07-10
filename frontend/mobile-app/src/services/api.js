import axios from 'axios';
import { Platform } from 'react-native';

const HOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
const API_URL = `http://${HOST}:5000/api`;

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    return;
  }

  delete api.defaults.headers.common.Authorization;
};

export default api;
