import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests if it exists
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  login: async (credentials) => {
    try {
      const response = await axiosInstance.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  },
  register: async (userData) => {
    try {
      const response = await axiosInstance.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  }
};

export const productService = {
  getAllProducts: () => axiosInstance.get('/products'),
  getProduct: (id) => axiosInstance.get(`/products/${id}`),
  addProduct: (data) => axiosInstance.post('/products', data),
  updateProduct: (id, data) => axiosInstance.put(`/products/${id}`, data),
  deleteProduct: (id) => axiosInstance.delete(`/products/${id}`)
};

export const reviewService = {
  addReview: (data) => axiosInstance.post('/reviews', {
    productId: parseInt(data.productId),
    rating: parseInt(data.rating),
    feedback: data.feedback
  }),
  getProductReviews: (productId) => axiosInstance.get(`/reviews/product/${productId}`),
  getAllReviews: () => axiosInstance.get('/reviews')
};

export const cartService = {
  addToCart: (data) =>
    axiosInstance.post('/cart/add', {
      productId: parseInt(data.productId),
      quantity: parseInt(data.quantity) || 1
    }),
  getCart: () => axiosInstance.get('/cart'),
  updateCartItem: (id, quantity) =>
    axiosInstance.put(`/cart/update/${id}`, {
      quantity: parseInt(quantity)
    }),
  removeCartItem: (id) => axiosInstance.delete(`/cart/remove/${id}`), // Remove single item
  clearCart: () => axiosInstance.delete('/cart/clear') // Remove all items
};

// Order Service
export const orderService = {
  getUserOrders: () => axiosInstance.get('/orders'), // Fetch all orders
  // getOrderById: (id) => axiosInstance.get(/orders), // Fetch a specific order by ID
  createOrder: (data) => axiosInstance.post('/orders', data), // Create a new order
  updateOrderStatus: (id, status) => axiosInstance.put(`/orders/${id}`, { status }), // Update order status
  deleteOrder: (id) => axiosInstance.delete(`/orders/${id}`) // Delete an order
};

export default axiosInstance;
