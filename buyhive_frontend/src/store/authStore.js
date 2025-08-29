// src/store/authStore.js
import { create } from 'zustand';

const useAuthStore = create((set, get) => ({
  // ✅ Fix: Use 'access_token' to match your API service
  accessToken: localStorage.getItem('access_token') || null,
  refreshToken: localStorage.getItem('refresh_token') || null,
  user: null,
  returnUrl: null,
  
  setTokens: (accessToken, refreshToken = null) => {
    localStorage.setItem('access_token', accessToken);
    if (refreshToken) {
      localStorage.setItem('refresh_token', refreshToken);
    }
    set({ 
      accessToken, 
      refreshToken: refreshToken || get().refreshToken 
    });
  },
  
  setUser: (user) => {
    set({ user });
  },
  
  setReturnUrl: (url) => {
    set({ returnUrl: url });
  },
  
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    set({ 
      accessToken: null, 
      refreshToken: null, 
      user: null, 
      returnUrl: null 
    });
  },
  
  // Helper to check if user is authenticated
  isAuthenticated: () => {
    return !!get().accessToken;
  },
  
  // Helper to get current user
  getCurrentUser: () => {
    return get().user;
  },
}));

export default useAuthStore;
