import axios from 'axios';

const API = axios.create({
  baseURL: 'https://localhost:7128/api'
});

// Request interceptor to add auth token if available
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const authAPI = {
  register: (formData) => API.post('/UserRegistration', formData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }),
  login: (credentials) => API.post('/GetUserLogin', credentials, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }),
  getUserLogin: (credentials) => {
    // Hardcoded test credentials
    const testCredentials = {
      username: 'Admin',
      password: '123'
    };
    
    const formData = new URLSearchParams();
    formData.append('UserName', testCredentials.username);
    formData.append('Password', testCredentials.password);
    
    return API.post('/GetUserLogin', formData.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
  }
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