import axios from 'axios';
import type { AuthResponse, LoginCredentials, RegisterData } from '../types/user';
import type { Product, Category, ProductInput } from '../types/product';
import type { Order, CreateOrderData } from '../types/order';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth APIs
export const authAPI = {
  register: (data: RegisterData) => api.post<AuthResponse>('/auth/register', data),
  login: (data: LoginCredentials) => api.post<AuthResponse>('/auth/login', data),
};

// Product APIs
export const productAPI = {
  getAll: (params?: any) => api.get<Product[]>('/products', { params }),
  getById: (id: string) => api.get<Product>(`/products/${id}`),
  create: (data: ProductInput) => api.post<Product>('/products', data),
  update: (id: string, data: ProductInput) => api.put<Product>(`/products/${id}`, data),
  delete: (id: string) => api.delete(`/products/${id}`),
};

// Category APIs
export const categoryAPI = {
  getAll: () => api.get<Category[]>('/categories'),
  create: (data: Partial<Category>) => api.post<Category>('/categories', data),
  delete: (id: string) => api.delete(`/categories/${id}`),
};

// Order APIs
export const orderAPI = {
  create: (data: CreateOrderData) => api.post<Order>('/orders', data),
  getUserOrders: (userId: string) => api.get<Order[]>(`/orders/${userId}`),
  getAllOrders: () => api.get<Order[]>('/admin/orders'),
  updateOrderStatus: (id: string, data: { order_status?: string; payment_status?: string }) =>
    api.put<Order>(`/admin/orders/${id}`, data),
};

// User APIs (Admin only)
export const userAPI = {
  getAll: () => api.get('/admin/users'),
  getById: (id: string) => api.get(`/admin/users/${id}`),
  updateRole: (id: string, role: string) => api.put(`/admin/users/${id}/role`, { role }),
  delete: (id: string) => api.delete(`/admin/users/${id}`),
  updateProfile: (data: { name?: string; phone?: string; avatar_url?: string }) =>
    api.put('/users/profile', data),
};

export default api;
