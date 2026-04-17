import axios from 'axios';

const API_URL = 'http://localhost:9090/api';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
};

export const stockService = {
  getAllStocks: () => api.get('/stocks'),
  getStock: (symbol) => api.get(`/stocks/${symbol}`),
  getHistory: (symbol) => api.get(`/stocks/${symbol}/history`),
};

export const tradeService = {
  executeTrade: (data) => api.post('/trade/execute', data),
  getPortfolio: () => api.get('/trade/portfolio'),
  getHistory: () => api.get('/trade/history'),
};

export const watchlistService = {
  getWatchlist: () => api.get('/watchlist'),
  addToWatchlist: (symbol) => api.post(`/watchlist/add/${symbol}`),
  removeFromWatchlist: (symbol) => api.delete(`/watchlist/remove/${symbol}`),
};

export const userService = {
  getProfile: () => api.get('/user/profile'),
  deposit: (amount) => api.post('/user/deposit', { amount }),
};

export const adminService = {
  getStats: () => api.get('/admin/stats'),
  getUsers: () => api.get('/admin/users'),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getTrades: () => api.get('/admin/trades'),
  getStocks: () => api.get('/admin/stocks'),
  addStock: (data) => api.post('/admin/stocks', data),
  updateStock: (id, data) => api.put(`/admin/stocks/${id}`, data),
  deleteStock: (id) => api.delete(`/admin/stocks/${id}`),
};

export default api;
