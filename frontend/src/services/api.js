import axios from 'axios';

// Multiple backend servers for automatic failover
const API_SERVERS = [
  'http://192.168.1.7:5000/api',
  'http://192.168.1.7:5000/api'
];

let currentServerIndex = 0;

const api = axios.create({
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 5000 // 5 second timeout
});

// Add token and set base URL for each request
api.interceptors.request.use((config) => {
  config.baseURL = API_SERVERS[currentServerIndex];
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log(`Request to: ${config.baseURL}${config.url}`);
  return config;
});

// Automatic failover on server errors
api.interceptors.response.use(
  (response) => {
    // Success - keep using current server
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Check if error is due to server being down/unreachable
    const isServerError = 
      error.code === 'ECONNABORTED' || 
      error.code === 'ERR_NETWORK' || 
      !error.response ||
      (error.response && error.response.status >= 500);
    
    // Prevent infinite retry loop
    if (!originalRequest._retry && isServerError) {
      originalRequest._retry = true;
      
      console.warn(`Server ${API_SERVERS[currentServerIndex]} failed, trying next server...`);
      
      // Try next server in the list
      currentServerIndex = (currentServerIndex + 1) % API_SERVERS.length;
      originalRequest.baseURL = API_SERVERS[currentServerIndex];
      
      try {
        console.log(`Retrying request on: ${originalRequest.baseURL}${originalRequest.url}`);
        return await axios.request(originalRequest);
      } catch (retryError) {
        console.error('Failover failed, all servers may be down');
        // You could try remaining servers here if you want
        throw retryError;
      }
    }
    
    // Non-server errors (like 401, 403, 404) or already retried
    throw error;
  }
);

// Auth
export const login = (credentials) => api.post('/auth/login', credentials);

// Products
export const getProducts = () => api.get('/products');
export const getCategories = () => api.get('/products/categories/list');
export const addProduct = (product) => api.post('/products', product);
export const updateProduct = (id, product) => api.put(`/products/${id}`, product);
export const deleteProduct = (id) => api.delete(`/products/${id}`);

// Sales
export const createSale = (sale) => api.post('/sales', sale);
export const getSales = (params) => api.get('/sales', { params });
export const getMySales = () => api.get('/sales/my-sales');

// Reports
export const getDashboard = () => api.get('/reports/dashboard');
export const getTopProducts = (limit) => api.get('/reports/top-products', { params: { limit } });
export const getSalesByCategory = () => api.get('/reports/sales-by-category');
export const getLowStock = (threshold) => api.get('/reports/low-stock', { params: { threshold } });
export const getSalesTrend = (days) => api.get('/reports/sales-trend', { params: { days } });

export default api;