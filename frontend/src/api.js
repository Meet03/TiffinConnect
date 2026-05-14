// api.js
import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
});

API.interceptors.request.use((req) => {
  const token = sessionStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API; // Default export for API

// User registration and login
export const registerUser = (formData) => API.post('/auth/register', formData);
export const loginUser = (formData) => API.post('/auth/login', formData);

// Provider profile APIs
export const getProviderProfile = () => API.get('/provider/profile');
export const updateProviderProfile = (profileData) => API.put('/provider/profile', profileData);

// Menu item APIs
export const getMenuItems = () => API.get('/provider/menu');
export const addMenuItem = (menuItemData) => API.post('/provider/menu', menuItemData);
export const updateMenuItem = (id, menuItemData) => API.put(`/provider/menu/${id}`, menuItemData);
export const deleteMenuItem = (id) => API.delete(`/provider/menu/${id}`);

// Subscription plan APIs
export const getSubscriptionPlans = () => API.get('/provider/plans');
export const addSubscriptionPlan = (planData) => API.post('/provider/plans', planData);
export const updateSubscriptionPlan = (id, planData) => API.put(`/provider/plans/${id}`, planData);
export const deleteSubscriptionPlan = (id) => API.delete(`/provider/plans/${id}`);

// Customer profile APIs
export const getCustomerProfile = () => API.get('/customer/profile');
export const updateCustomerProfile = (profileData) => 
  API.put('/customer/profile', profileData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  
  export const bookSubscription = async (subscriptionId) => {
    console.log(`Calling API to book subscription with ID: ${subscriptionId}`);
    return API.post('/provider/bookSubscription', { subscriptionId });
  };
  
