import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Live deployed backend on Render
const API_BASE_URL = 'https://ecogenie-api.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach token to every request
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('ecogenie_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth APIs
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

// Rooms APIs
export const roomsAPI = {
  getAll: () => api.get('/rooms'),
  getOne: (id) => api.get(`/rooms/${id}`),
  simulate: () => api.post('/rooms/simulate'),
  toggleAutomation: (id) => api.put(`/rooms/${id}/automation`),
};

// Appliances APIs
export const appliancesAPI = {
  getAll: (roomId) => api.get('/appliances', { params: roomId ? { roomId } : {} }),
  getStats: () => api.get('/appliances/stats'),
  toggle: (id) => api.put(`/appliances/${id}/toggle`),
  setIntensity: (id, intensity) => api.put(`/appliances/${id}/intensity`, { intensity }),
  setMode: (id, mode) => api.put(`/appliances/${id}/mode`, { mode }),
};

// Analytics APIs
export const analyticsAPI = {
  getOverview: () => api.get('/analytics/overview'),
  getRecommendations: () => api.get('/analytics/recommendations'),
};

// Automation APIs
export const automationAPI = {
  run: () => api.post('/automation/run'),
  getStatus: () => api.get('/automation/status'),
};

// Weather APIs
export const weatherAPI = {
  get: (location) => api.get('/weather', { params: location ? { location } : {} }),
};

// Notifications APIs
export const notificationsAPI = {
  getAll: () => api.get('/notifications'),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
};

// Activity APIs
export const activityAPI = {
  getLogs: () => api.get('/activity'),
};

export default api;
