import axios from 'axios';
import type { AuthResponse, Sweet, Order } from '../types/types';
const API_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth APIs
export const authAPI = {
  register: (data: { name: string; email: string; password: string; role?: string }) =>
    api.post<AuthResponse>('/auth/register', data),
  
  login: (data: { email: string; password: string }) =>
    api.post<AuthResponse>('/auth/login', data),
};

// Sweet APIs
export const sweetAPI = {
  getAll: () => api.get<{ sweets: Sweet[]; count: number }>('/sweets'),
  
  getById: (id: string) => api.get<{ sweet: Sweet }>(`/sweets/${id}`),
  
  create: (data: Partial<Sweet>) =>
    api.post<{ message: string; sweet: Sweet }>('/sweets', data),
  
  update: (id: string, data: Partial<Sweet>) =>
    api.put<{ message: string; sweet: Sweet }>(`/sweets/${id}`, data),
  
  delete: (id: string) =>
    api.delete<{ message: string }>(`/sweets/${id}`),
};

// Order APIs
export const orderAPI = {
  create: (data: any) =>
    api.post<{ message: string; order: Order }>('/orders', data),
  
  getUserOrders: () =>
    api.get<{ orders: Order[]; count: number }>('/orders'),
  
  getAllOrders: () =>
    api.get<{ orders: Order[]; count: number }>('/orders/all'),
  
  getById: (id: string) =>
    api.get<{ order: Order }>(`/orders/${id}`),
  
  updateStatus: (id: string, status: string) =>
    api.put<{ message: string; order: Order }>(`/orders/${id}`, { status }),
};

export default api;