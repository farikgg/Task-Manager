import axios from 'axios';
import { refreshToken } from './auth';

const API_URL = 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Включить отправку cookies
});

// Перехватчик запросов
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Перехватчик ответов
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Если ошибка 401 и мы еще не пытались обновить токен
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Попытаться обновить токен
        await refreshToken();
        
        // Обновить заголовок авторизации
        const newToken = localStorage.getItem('accessToken');
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        
        // Повторить исходный запрос
        return api(originalRequest);
      } catch (refreshError) {
        // Если обновление токена не удалось, перенаправить на страницу входа
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;