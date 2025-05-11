import axios from 'axios';

const API = axios.create({
  // baseURL: 'https://localhost:7128/api'
  baseURL:'https://210.56.11.158:441/api'
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
  
  adminRegister: (formData) => API.post('/AdminRegistration', formData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }),

  login: (username, password) => {
    const formData = new URLSearchParams();
    formData.append('UserName', username);
    formData.append('Password', password);
    
    return API.post('/GetUserLogin', formData.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
  }
};

export const userAPI = {
  getUserList: (userId) => {
    const formData = new URLSearchParams();
    formData.append('UserID', userId);
    
    return API.post('/GetUserList', formData.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
  },

  getDecryptedPassword: (encryptedPassword) => {
  const formData = new URLSearchParams();
  formData.append('Password', encryptedPassword);

  return API.post('/GetUserPassword', formData.toString(), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });
},


  updateUserProfile: (userData) => {
    const formData = new URLSearchParams();
    formData.append('UserID', userData.userId);
    formData.append('Email', userData.email);
    formData.append('FullName', userData.fullName);
    formData.append('DOB', userData.dob);
    formData.append('Gender', userData.gender);
    formData.append('Mobile', userData.mobile);
    formData.append('ImagePath', userData.profilePath || '');
    formData.append('PostalAddress', userData.address || '');

    return API.post('/UpdateUserProfile', formData.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
  },
  
  updatePassword: (userId, newPassword) => {
    const formData = new URLSearchParams();
    formData.append('UserID', userId);
    formData.append('Password', newPassword);
    
    return API.post('/UpdateUserPassword', formData.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
  },

  updateUserStatus: (userId, statusId) => {
    const formData = new URLSearchParams();
    formData.append('UserID', userId);
    formData.append('StatusID', statusId);
    
    return API.post('/UpdateUserStatus', formData.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
  }
};

export const questionAPI = {
  getQuestionAndOptionList: () => {
    const formData = new URLSearchParams();
    
    return API.post('/GetQuestionAndOptionList', formData.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
  },

  savePatientApplication: (submissionData) => {
  return API.post('/SavePatientApplication', submissionData, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

};

export const roleAPI = {
  getRoleList: (roleId = -1) => {
    const formData = new URLSearchParams();
    formData.append('RoleID', roleId);
    
    return API.post('/GetRoleList', formData.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
  },
  
  updateRole: (roleData) => {
    const formData = new URLSearchParams();
    formData.append('RoleID', roleData.RoleID);
    formData.append('RoleName', roleData.RoleName);
    formData.append('Description', roleData.Description);
    
    return API.post('/UpdateRole', formData.toString(), {
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