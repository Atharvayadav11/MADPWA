import axios from 'axios';
import { toast } from '@/components/ui/use-toast';

// Create axios instance with base URL
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://madpwa.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const message = 
      error.response?.data?.message || 
      'An unexpected error occurred';
    
    toast({
      variant: "destructive",
      title: "Error",
      description: message,
    });
    
    return Promise.reject(error);
  }
);