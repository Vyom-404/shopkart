import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3002',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' }
});

export default api;

export const getProducts = (params = {}) => api.get('/products', { params });
export const getProduct = (id) => api.get(`/products/${id}`);
export const getWishlist = () => api.get('/wishlist');
const notifyWishlistChanged = () => window.dispatchEvent(new Event('shopkart:wishlist-updated'));

export const addToWishlist = async (productId) => {
  const response = await api.post(`/wishlist/${productId}`);
  notifyWishlistChanged();
  return response;
};
export const toggleWishlist = async (productId) => {
  const response = await api.patch(`/wishlist/${productId}/toggle`);
  notifyWishlistChanged();
  return response;
};
export const removeFromWishlist = async (productId) => {
  const response = await api.delete(`/wishlist/${productId}`);
  notifyWishlistChanged();
  return response;
};
