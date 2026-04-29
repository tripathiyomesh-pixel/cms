import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Inject JWT on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('jcms_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 — redirect to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('jcms_token');
      localStorage.removeItem('jcms_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ─── AUTH ──────────────────────────────────────────────────────
export const authAPI = {
  login:    (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  me:       ()     => api.get('/auth/me'),
  changePassword: (data) => api.post('/auth/change-password', data),
};

// ─── PRODUCTS ─────────────────────────────────────────────────
export const productsAPI = {
  list:    (params) => api.get('/products', { params }),
  get:     (id)     => api.get(`/products/${id}`),
  create:  (data)   => api.post('/products', data),
  update:  (id, data) => api.put(`/products/${id}`, data),
  delete:  (id)     => api.delete(`/products/${id}`),
  updatePrice: (id, data) => api.put(`/products/${id}/price`, data),
  updateStock: (id, data) => api.put(`/products/${id}/stock`, data),
  uploadMedia: (id, formData) =>
    api.post(`/products/${id}/media`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

// ─── COLLECTIONS ──────────────────────────────────────────────
export const collectionsAPI = {
  list:   ()          => api.get('/collections'),
  get:    (id)        => api.get(`/collections/${id}`),
  create: (data)      => api.post('/collections', data),
  update: (id, data)  => api.put(`/collections/${id}`, data),
  delete: (id)        => api.delete(`/collections/${id}`),
};

// ─── CATEGORIES ───────────────────────────────────────────────
export const categoriesAPI = {
  tree:   ()          => api.get('/categories/tree'),
  list:   ()          => api.get('/categories'),
  get:    (id)        => api.get(`/categories/${id}`),
  create: (data)      => api.post('/categories', data),
  update: (id, data)  => api.put(`/categories/${id}`, data),
  delete: (id)        => api.delete(`/categories/${id}`),
};

// ─── INVENTORY ────────────────────────────────────────────────
export const inventoryAPI = {
  lowStock:   (threshold) => api.get('/inventory/low-stock', { params: { threshold } }),
  ledger:     (productId, params) => api.get(`/inventory/${productId}/ledger`, { params }),
  bulkUpdate: (updates)  => api.put('/inventory/bulk-update', { updates }),
};

// ─── MARKETING ────────────────────────────────────────────────
export const marketingAPI = {
  banners:      (params)  => api.get('/marketing/banners', { params }),
  createBanner: (formData) =>
    api.post('/marketing/banners', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  updateBanner: (id, data) => api.put(`/marketing/banners/${id}`, data),
  deleteBanner: (id)       => api.delete(`/marketing/banners/${id}`),
  promoCodes:     ()       => api.get('/marketing/promocodes'),
  createPromo:    (data)   => api.post('/marketing/promocodes', data),
  validatePromo:  (data)   => api.post('/marketing/promocodes/validate', data),
  deletePromo:    (id)     => api.delete(`/marketing/promocodes/${id}`),
};

// ─── USERS ────────────────────────────────────────────────────
export const usersAPI = {
  list:       ()          => api.get('/users'),
  get:        (id)        => api.get(`/users/${id}`),
  update:     (id, data)  => api.put(`/users/${id}`, data),
  updatePerms:(id, perms) => api.put(`/users/${id}/permissions`, { permissions: perms }),
  delete:     (id)        => api.delete(`/users/${id}`),
};

export default api;
