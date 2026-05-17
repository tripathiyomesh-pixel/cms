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

// ─── PLUGINS ──────────────────────────────────────────────────
export const pluginsAPI = {
  marketplace:     ()           => api.get('/plugins/marketplace'),
  active:          ()           => api.get('/plugins/active'),
  install:         (pluginId)   => api.post(`/plugins/install/${pluginId}`),
  uninstall:       (pluginId)   => api.post(`/plugins/uninstall/${pluginId}`),
  toggle:          (pluginId)   => api.put(`/plugins/toggle/${pluginId}`),
  saveSettings:    (pluginId, d) => api.put(`/plugins/settings/${pluginId}`, d),
  getProductFields:     ()            => api.get('/plugins/product-fields'),
  getProductExtensions: (productId)  => api.get(`/plugins/product/${productId}/extensions`),
  saveExtension:        (productId, pluginId, data) => api.post(`/plugins/product/${productId}/extension`, { plugin_id: pluginId, data }),
  updateSettings:  (pluginId, s) => api.put(`/plugins/settings/${pluginId}`, s),
  productFields:   ()           => api.get('/plugins/product-fields'),
  saveExtension:   (productId, plugin_id, data) => api.post(`/plugins/product/${productId}/extension`, { plugin_id, data }),
  getExtensions:   (productId)  => api.get(`/plugins/product/${productId}/extensions`),
};

// ─── Jewellery API ───────────────────────────────────────────
export const jewelleryAPI = {
  getSpecs:       (pid)      => API.get(`/jewellery/specs/${pid}`),
  saveSpecs:      (pid, d)   => API.post(`/jewellery/specs/${pid}`, d),
  getCerts:       (pid)      => API.get(`/jewellery/certifications/${pid}`),
  addCert:        (pid, fd)  => API.post(`/jewellery/certifications/${pid}`, fd, {headers:{'Content-Type':'multipart/form-data'}}),
  deleteCert:     (id)       => API.delete(`/jewellery/certifications/${id}`),
  getImages:      (pid)      => API.get(`/jewellery/images/${pid}`),
  uploadImages:   (pid, fd)  => API.post(`/jewellery/images/${pid}`, fd, {headers:{'Content-Type':'multipart/form-data'}}),
  deleteImage:    (id)       => API.delete(`/jewellery/images/${id}`),
  setImagePrimary:(id)       => API.patch(`/jewellery/images/${id}/primary`),
  getMetalRates:  ()         => API.get('/jewellery/metal-rates'),
  saveMetalRate:  (d)        => API.post('/jewellery/metal-rates', d),
  getEnquiries:   (p)        => API.get('/jewellery/enquiries', {params:p}),
  updateEnquiry:  (id, d)    => API.patch(`/jewellery/enquiries/${id}`, d),
  submitEnquiry:  (d)        => API.post('/jewellery/enquiries', d),
  waLink:         (d)        => API.post('/jewellery/whatsapp-link', d),
  getBadges:      (lid)      => API.get(`/jewellery/trust-badges?license_id=${lid}`),
  addBadge:       (d)        => API.post('/jewellery/trust-badges', d),
  deleteBadge:    (id)       => API.delete(`/jewellery/trust-badges/${id}`),
  getAppointments:(p)        => API.get('/jewellery/appointments', {params:p}),
  bookAppointment:(d)        => API.post('/jewellery/appointments', d),
  updateAppt:     (id, d)    => API.patch(`/jewellery/appointments/${id}`, d),
  getLocations:   (lid)      => API.get(`/jewellery/locations?license_id=${lid}`),
  addLocation:    (d)        => API.post('/jewellery/locations', d),
  deleteLocation: (id)       => API.delete(`/jewellery/locations/${id}`),
};

// ─── Appointments extended API ───────────────────────────────
export const appointmentsAPI = {
  getSlots:      (p)       => API.get('/appointments/slots', {params:p}),
  book:          (d)       => API.post('/appointments', d),
  getByRef:      (ref)     => API.get(`/appointments/ref/${ref}`),
  list:          (p)       => API.get('/appointments', {params:p}),
  update:        (id,d)    => API.patch(`/appointments/${id}`, d),
  summary:       ()        => API.get('/appointments/summary/today'),
};
// Patch jewelleryAPI with slots + summary (also on appointmentsAPI above)
// Use appointmentsAPI for new code; these aliases kept for backward compat
if(typeof jewelleryAPI !== 'undefined'){
  jewelleryAPI.getSlots = (p) => API.get('/appointments/slots',{params:p});
  jewelleryAPI.bookAppointment = (d) => API.post('/appointments',d);
  jewelleryAPI.getAppointments = (p) => API.get('/appointments',{params:p});
  jewelleryAPI.updateAppt = (id,d) => API.patch(`/appointments/${id}`,d);
  jewelleryAPI.getAppointmentSummary = () => API.get('/appointments/summary/today');
}

// ─── DASHBOARD ────────────────────────────────────────────────
export const dashboardAPI = {
  stats:          () => api.get('/dashboard/stats'),
  recentActivity: () => api.get('/dashboard/recent-activity'),
  salesChart:     () => api.get('/dashboard/sales-chart'),
  lowStock:       () => api.get('/dashboard/low-stock'),
};

// ─── CUSTOMERS ────────────────────────────────────────────────
export const customersAPI = {
  list:              (p)    => api.get('/customers', { params: p }),
  get:               (id)   => api.get(`/customers/${id}`),
  create:            (d)    => api.post('/customers', d),
  update:            (id,d) => api.put(`/customers/${id}`, d),
  delete:            (id)   => api.delete(`/customers/${id}`),
  importFromEnquiries: ()   => api.post('/customers/import-from-enquiries'),
};

// ─── ORDERS ───────────────────────────────────────────────────
export const ordersAPI = {
  list:         (p)    => api.get('/orders', { params: p }),
  get:          (id)   => api.get(`/orders/${id}`),
  create:       (d)    => api.post('/orders', d),
  updateStatus: (id,d) => api.patch(`/orders/${id}/status`, d),
  stats:        ()     => api.get('/orders/stats/summary'),
};

// ─── AUDIT ────────────────────────────────────────────────────
export const auditAPI = {
  list: (p) => api.get('/audit', { params: p }),
};

// ─── NOTIFICATIONS ────────────────────────────────────────────
export const notificationsAPI = {
  sendEmail:              (d) => api.post('/notifications/email', d),
  enquiryReply:           (d) => api.post('/notifications/enquiry-reply', d),
  appointmentConfirmation:(d) => api.post('/notifications/appointment-confirmation', d),
  testEmail:              ()  => api.post('/notifications/test-email'),
};

// ─── STOREFRONT (public) ──────────────────────────────────────
export const storefrontAPI = {
  store:       ()       => api.get('/storefront/store'),
  products:    (p)      => api.get('/storefront/products', { params: p }),
  product:     (slug)   => api.get(`/storefront/products/${slug}`),
  categories:  ()       => api.get('/storefront/categories'),
  collections: ()       => api.get('/storefront/collections'),
  collection:  (slug)   => api.get(`/storefront/collections/${slug}`),
  banners:     (pos)    => api.get('/storefront/banners', { params: { position: pos } }),
  menu:        (loc)    => api.get(`/storefront/menus/${loc}`),
  pages:       (lang)   => api.get('/storefront/pages', { params: { lang } }),
  page:        (slug)   => api.get(`/storefront/pages/${slug}`),
  metalRates:  ()       => api.get('/storefront/metal-rates'),
};

// ─── DIAMONDS ─────────────────────────────────────────────────
export const diamondsAPI = {
  list:    (p)    => api.get('/diamonds', { params: p }),
  get:     (id)   => api.get(`/diamonds/${id}`),
  create:  (d)    => api.post('/diamonds', d),
  update:  (id,d) => api.patch(`/diamonds/${id}`, d),
  delete:  (id)   => api.delete(`/diamonds/${id}`),
  compare: (ids)  => api.post('/diamonds/compare', { ids }),
};

// ─── GEMSTONES ────────────────────────────────────────────────
export const gemstonesAPI = {
  list:   (p)    => api.get('/gemstones', { params: p }),
  get:    (id)   => api.get(`/gemstones/${id}`),
  create: (d)    => api.post('/gemstones', d),
  update: (id,d) => api.patch(`/gemstones/${id}`, d),
  delete: (id)   => api.delete(`/gemstones/${id}`),
};

// ─── MOUNTINGS ────────────────────────────────────────────────
export const mountingsAPI = {
  list:   (p)    => api.get('/mountings', { params: p }),
  get:    (id)   => api.get(`/mountings/${id}`),
  create: (d)    => api.post('/mountings', d),
  update: (id,d) => api.patch(`/mountings/${id}`, d),
  delete: (id)   => api.delete(`/mountings/${id}`),
};

// ─── CUSTOM ORDERS ────────────────────────────────────────────
export const customOrdersAPI = {
  list:         (p)          => api.get('/custom-orders', { params: p }),
  get:          (id)         => api.get(`/custom-orders/${id}`),
  create:       (d)          => api.post('/custom-orders', d),
  updateStatus: (id,d)       => api.patch(`/custom-orders/${id}/status`, d),
  uploadCAD:    (id,d)       => api.post(`/custom-orders/${id}/cad`, d),
  approveCAD:   (id,cadId,d) => api.patch(`/custom-orders/${id}/cad/${cadId}/approve`, d),
  stats:        ()           => api.get('/custom-orders/stats/summary'),
};

// ─── FEATURE FLAGS ────────────────────────────────────────────
export const featureFlagsAPI = {
  list:       ()      => api.get('/feature-flags'),
  toggle:     (key,v) => api.patch(`/feature-flags/${key}`, { is_enabled: v }),
  bulkUpdate: (flags) => api.patch('/feature-flags', { flags }),
};

// ─── CERTIFICATE VERIFY (public) ─────────────────────────────
export const certVerifyAPI = {
  verify: (certNo) => api.get(`/verify/${certNo}`),
};
