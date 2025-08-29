// src/services/api.js
import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/token/refresh/`, {
            refresh: refreshToken,
          });
          const { access } = response.data;
          localStorage.setItem('access_token', access);
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Authentication API calls
export const authAPI = {
  register: (userData) => api.post('/accounts/register/', userData),
  login: (credentials) => api.post('/token/', credentials),
  refreshToken: (refresh) => api.post('/token/refresh/', { refresh }),
  getProfile: () => api.get('/accounts/profile/'),
  updateProfile: (data) => {
    const hasFile = data.profile_picture && data.profile_picture.length > 0;
    if (hasFile) {
      const formData = new FormData();
      if (data.first_name !== undefined) formData.append('first_name', data.first_name);
      if (data.last_name !== undefined) formData.append('last_name', data.last_name);
      if (data.phone_number !== undefined) formData.append('profile.phone_number', data.phone_number);
      if (data.bio !== undefined) formData.append('profile.bio', data.bio);
      formData.append('profile.profile_picture', data.profile_picture[0]);
      return api.patch('/accounts/profile/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    } else {
      const updateData = {
        first_name: data.first_name,
        last_name: data.last_name,
        profile: {
          phone_number: data.phone_number,
          bio: data.bio,
        },
      };
      return api.patch('/accounts/profile/', updateData);
    }
  },
};

// Address API calls
export const addressAPI = {
  list: () => api.get('/accounts/addresses/'),
  create: (data) => api.post('/accounts/addresses/', data),
  update: (id, data) => api.patch(`/accounts/addresses/${id}/`, data),
  delete: (id) => api.delete(`/accounts/addresses/${id}/`),
  setDefault: (id) => {
    return api.patch(`/accounts/addresses/${id}/`, { is_default: true });
  },
};

// Helper function for handling API errors
export const handleAPIError = (error) => {
  if (error.response) {
    const status = error.response.status;
    const data = error.response.data;
    switch (status) {
      case 400:
        return {
          type: 'validation',
          message: 'Please check your input data',
          details: data
        };
      case 401:
        return {
          type: 'auth',
          message: 'Please log in again',
          details: data
        };
      case 403:
        return {
          type: 'permission',
          message: 'You do not have permission to perform this action',
          details: data
        };
      case 404:
        return {
          type: 'not_found',
          message: 'The requested resource was not found',
          details: data
        };
      case 500:
        return {
          type: 'server',
          message: 'Server error. Please try again later',
          details: data
        };
      default:
        return {
          type: 'unknown',
          message: 'An unexpected error occurred',
          details: data
        };
    }
  } else if (error.request) {
    return {
      type: 'network',
      message: 'Network error. Please check your connection',
      details: null
    };
  } else {
    return {
      type: 'unknown',
      message: error.message || 'An unexpected error occurred',
      details: null
    };
  }
};

// Products API calls
export const productsAPI = {
  list: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/products/products/${queryString ? '?' + queryString : ''}`);
  },
  detail: (id) => api.get(`/products/products/${id}/`),
  categories: () => api.get('/products/categories/'),
  reviews: (productId) => api.get(`/products/products/${productId}/reviews/`),
  createReview: (productId, reviewData) => api.post(`/products/products/${productId}/reviews/`, reviewData),
  search: (query, filters = {}) => {
    const params = { search: query, ...filters };
    return productsAPI.list(params);
  },
  byCategory: (categoryId) => productsAPI.list({ category: categoryId }),
  featured: () => productsAPI.list({ featured: true }),
};

// Orders API calls
export const ordersAPI = {
  getCart: () => api.get('/orders/cart/'),
  addToCart: (itemData) => api.post('/orders/cart/items/', itemData),
  updateCartItem: (itemId, data) => api.patch(`/orders/cart/items/${itemId}/`, data),
  removeFromCart: (itemId) => api.delete(`/orders/cart/items/${itemId}/`),
  checkout: (checkoutData) => api.post('/orders/checkout/', checkoutData),
  getOrders: () => api.get('/orders/customer-orders/'),
  getOrderDetail: (orderId) => api.get(`/orders/customer-orders/${orderId}/`),
};

// Vendors API calls
export const vendorsAPI = {
  getPublicVendors: () => api.get('/vendors/public/'),
  applyToVendor: (applicationData) => {
    return api.post('/vendors/apply/', applicationData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  getVendorStatus: () => api.get('/vendors/status/'),
  getVendorProfile: () => api.get('/vendors/profile/'),
  getVendorDetail: (vendorId) => api.get(`/vendors/public/${vendorId}/`),
  getVendorProducts: (vendorId, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/products/products/${queryString ? '?' + queryString + `&vendor=${vendorId}` : `?vendor=${vendorId}`}`);
  },
  updateVendorProfile: (profileData) => {
    const hasFiles = profileData.business_logo || profileData.business_license;
    if (hasFiles) {
      const formData = new FormData();
      if (profileData.business_name) formData.append('business_name', profileData.business_name);
      if (profileData.description) formData.append('description', profileData.description);
      if (profileData.tax_id) formData.append('tax_id', profileData.tax_id);
      if (profileData.business_logo) formData.append('business_logo', profileData.business_logo);
      if (profileData.business_license) formData.append('business_license', profileData.business_license);
      return api.patch('/vendors/profile/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    } else {
      return api.patch('/vendors/profile/', profileData);
    }
  },
  getAnalytics: () => api.get('/vendors/analytics/'),
  getProductsManage: (filters = {}) => {
    const queryString = new URLSearchParams(filters).toString();
    return api.get(`/vendors/products/manage/${queryString ? '?' + queryString : ''}`);
  },
  getOrdersManage: (filters = {}) => {
    const queryString = new URLSearchParams(filters).toString();
    return api.get(`/vendors/orders/manage/${queryString ? '?' + queryString : ''}`);
  },
  updateOrderStatus: (data) => api.patch('/vendors/orders/update-status/', data),
createProduct: (productData) => {
  // ✅ Simply pass FormData directly - no need to check images
  return api.post('/products/products/', productData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
},
updateProduct: (productId, productData) => {
  return api.patch(`/products/products/${productId}/`, productData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
},
  deleteProduct: (productId) => api.delete(`/products/products/${productId}/`),
  getProductVariants: (productId) => api.get(`/products/products/${productId}/variants/`),
  createProductVariant: (productId, variantData) => api.post(`/products/products/${productId}/variants/`, variantData),
  updateProductVariant: (productId, variantId, variantData) => api.patch(`/products/products/${productId}/variants/${variantId}/`, variantData),
  deleteProductVariant: (productId, variantId) => api.delete(`/products/products/${productId}/variants/${variantId}/`),
};
// Add this to your existing api.js file

// Wishlist API calls
export const wishlistAPI = {
  getWishlist: () => api.get('/wishlist/'),
  toggleProduct: (productId) => api.post(`/wishlist/toggle/${productId}/`),
  clearWishlist: () => api.delete('/wishlist/clear/'),
};

export default api;
