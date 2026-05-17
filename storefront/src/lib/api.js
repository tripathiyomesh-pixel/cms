import axios from 'axios';

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
const api = axios.create({ baseURL: BASE, timeout: 15000 });

export const sfAPI = {
  store:       ()      => api.get('/storefront/store'),
  products:    (p)     => api.get('/storefront/products', { params: p }),
  product:     (slug)  => api.get(`/storefront/products/${slug}`),
  categories:  ()      => api.get('/storefront/categories'),
  collections: ()      => api.get('/storefront/collections'),
  collection:  (slug)  => api.get(`/storefront/collections/${slug}`),
  banners:     (pos)   => api.get('/storefront/banners', { params: { position: pos } }),
  metalRates:  ()      => api.get('/storefront/metal-rates'),
};

export const diamondAPI = {
  search:  (p)   => api.get('/diamonds', { params: p }),
  get:     (id)  => api.get(`/diamonds/${id}`),
  compare: (ids) => api.post('/diamonds/compare', { ids }),
};

export const gemstoneAPI = {
  search: (p)  => api.get('/gemstones', { params: p }),
  get:    (id) => api.get(`/gemstones/${id}`),
};

export const pearlAPI = {
  search: (p)  => api.get('/pearls', { params: p }),
  get:    (id) => api.get(`/pearls/${id}`),
};

export const mountingAPI = {
  search: (p)  => api.get('/mountings', { params: p }),
  get:    (id) => api.get(`/mountings/${id}`),
};

export const certAPI   = { verify: (n) => api.get(`/verify/${n}`) };
export const enquiryAPI = {
  submit:      (d) => api.post('/enquiries', d),
  appointment: (d) => api.post('/appointments', d),
  slots:       (p) => api.get('/appointments/slots', { params: p }),
};
export const customOrderAPI = { submit: (d) => api.post('/custom-orders', d) };

export default api;
