import axios from 'axios';

const API = axios.create({
  baseURL: 'https://localhost:7259/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (userData) => API.post('/auth/register', userData),
  login: (userData) => API.post('/auth/login', userData)
};

export const bookAPI = {
  search: (query) => API.get(`/books?search=${query}`),
  getBook: (id) => API.get(`/books/${id}`),
    getById: (id) => API.get(`/books/${id}`),
  
};

export const favoritesAPI = {
  getFavorites: () => API.get('/favorites'),
  getFavoriteBook: (id) => API.get(`/favorites/${id}`), 
  searchFavorites: (query) => API.get(`/favorites/search?query=${encodeURIComponent(query)}`),
  addFavorite: (bookData) => API.post('/favorites', bookData),
  removeFavorite: (bookId) => API.delete(`/favorites/${bookId}`),
};

export default API;