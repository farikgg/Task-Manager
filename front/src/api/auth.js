import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

// Создаем экземпляр axios с базовым URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // Важно для работы с cookies
});

// Добавляем перехватчик для добавления токена к запросам
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Добавляем перехватчик для обработки ошибок и обновления токена
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Если ошибка 401 и это не повторный запрос
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Пытаемся обновить токен
        const response = await api.post('/auth/refresh');
        const { accessToken } = response.data;
        
        // Сохраняем новый access token
        localStorage.setItem('accessToken', accessToken);
        
        // Обновляем заголовок в оригинальном запросе
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        
        // Повторяем оригинальный запрос
        return api(originalRequest);
      } catch (refreshError) {
        // Если не удалось обновить токен, выходим из системы
        logout();
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  // Сохраняем только access token
  localStorage.setItem('accessToken', response.data.accessToken);
  return response.data;
};

export const refreshToken = async () => {
  try {
    const response = await api.post('/auth/refresh');
    localStorage.setItem('accessToken', response.data.accessToken);
    return response.data;
  } catch (error) {
    logout();
    throw error;
  }
};

export const logout = () => {
  localStorage.removeItem('accessToken');
  api.post('/auth/logout');
};

export const getProfile = async () => {
  const response = await api.get('/auth/profile');
  return response.data;
};

export const updateProfile = async (profileData) => {
  // profileData: { username, email }
  const response = await api.put('/auth/profile', profileData);
  return response.data;
};

export const updateCategories = async (categories) => {
  // categories: массив строк
  const response = await api.put('/auth/categories', { categories });
  return response.data;
};

export const updateThemeColor = async (themeColor) => {
  // themeColor: строка
  const response = await api.put('/auth/theme', { themeColor });
  return response.data;
};

export const changePassword = async (passwordData) => {
  const response = await api.put('/auth/password', passwordData);
  return response.data;
};