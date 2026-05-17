import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://ecogenie-api.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor - attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ecogenie_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('ecogenie_token');
      localStorage.removeItem('ecogenie_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
};

// Rooms
export const roomsAPI = {
  getAll: () => api.get('/rooms'),
  getOne: (id) => api.get(`/rooms/${id}`),
  updateSensors: (id, data) => api.put(`/rooms/${id}/sensors`, data),
  toggleAutomation: (id) => api.put(`/rooms/${id}/automation`),
  simulate: () => api.post('/rooms/simulate'),
};

// Appliances
export const appliancesAPI = {
  getAll: (roomId) => api.get('/appliances', { params: roomId ? { roomId } : {} }),
  getStats: () => api.get('/appliances/stats'),
  toggle: (id) => api.put(`/appliances/${id}/toggle`),
  setIntensity: (id, intensity) => api.put(`/appliances/${id}/intensity`, { intensity }),
  setMode: (id, mode) => api.put(`/appliances/${id}/mode`, { mode }),
  setSchedule: (id, data) => api.put(`/appliances/${id}/schedule`, data),
};

// Analytics
export const analyticsAPI = {
  getOverview: () => api.get('/analytics/overview'),
  getRecommendations: () => api.get('/analytics/recommendations'),
};

// Automation
export const automationAPI = {
  run: () => api.post('/automation/run'),
  getStatus: () => api.get('/automation/status'),
};

// Weather
export const weatherAPI = {
  get: (location) => api.get('/weather', { params: location ? { location } : {} }),
};

// Notifications
export const notificationsAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`),
};

// Activity
export const activityAPI = {
  getLogs: (params) => api.get('/activity', { params }),
  clear: () => api.delete('/activity'),
};

export default api;
