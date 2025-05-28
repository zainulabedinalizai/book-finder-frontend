import axios from 'axios';

// SIMPLE URL SWITCH - just comment/uncomment the line you want to use
// const baseURL = 'https://localhost:7128/api';       // Local development
//const baseURL = 'https://210.56.11.158:441/api';  // Live production API
// const baseURL = 'https://portal.medskls.com/api'; // Other environment
// const baseURL = 'http://210.56.11.154:777/api';  // Live production API
const baseURL = 'https://portal.medskls.com:441/API';  // Live production API

const API = axios.create({
  baseURL: baseURL,  // Using the selected URL
  timeout: 30000,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/x-www-form-urlencoded'
  }
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

// Response interceptor to handle errors globally
API.interceptors.response.use(
  response => response,
  error => {
    if (error.code === 'ECONNABORTED') {
      return Promise.reject({ message: 'Request timeout. Please check your network connection.' });
    }
    
    if (!error.response) {
      return Promise.reject({ 
        message: 'Network Error. Please check your internet connection.',
        isNetworkError: true 
      });
    }
    
    if (error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location = '/login';
    }
    
    return Promise.reject(error);
  }
);

// Auth API Endpoints
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

// User API Endpoints
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
  },

  updateUserProfile: (profileData) => {
    const formData = new FormData();
    formData.append('UserID', profileData.UserID);
    formData.append('Email', profileData.Email);
    formData.append('FullName', profileData.FullName);
    formData.append('DOB', profileData.DOB);
    formData.append('Gender', profileData.Gender);
    formData.append('Mobile', profileData.Mobile);
    formData.append('PostalAddress', profileData.PostalAddress);
    if (profileData.ImagePath) {
      formData.append('ImagePath', profileData.ImagePath);
    }
    
    return API.post('/UpdateUserProfile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }
};

// Question API Endpoints
export const questionAPI = {
  getQuestionAndOptionList: () => {
    const formData = new URLSearchParams();
    
    return API.post('/GetQuestionAndOptionList', formData.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
  }
};

// Patient API Endpoints
export const patientAPI = {
  savePatientApplication: (submissionData) => {
    return API.post('/SavePatientApplication', submissionData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  },

  getPatientApplication: (param) => {
    const formData = new URLSearchParams();
    formData.append('UserID', param.UserID);
    
    return API.post('/GetPatientApplication', formData.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
  },

  getRoleWiseApplication: (param) => {
    const formData = new URLSearchParams();
    formData.append('RoleID', param.RoleID);
    formData.append('UserID', param.UserID);
    
    return API.post('/GetRoleWiseApplication', formData.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
  },

  updateUserApplication: (param) => {
    const formData = new FormData();
    formData.append('ID', param.ID);
    formData.append('StatusID', param.StatusID);
    formData.append('RoleID', param.RoleID);
    formData.append('Description', param.Description || '');
    if (param.ImagePath) {
      formData.append('FilePath', param.ImagePath);
    }
    
    return API.post('/UpdateUserApplication', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  // New endpoint for getting DDL status
  getDDLStatus: () => {
    const formData = new URLSearchParams();
    
    return API.post('/GetDDLStatus', formData.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
  }
};

// Role API Endpoints
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

// Status API Endpoints
export const statusAPI = {
  getDDLStatus: () => {
    const formData = new URLSearchParams();
    
    return API.post('/GetDDLStatus', formData.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
  }
};

// Book API Endpoints (if needed)
export const bookAPI = {
  search: (query) => API.get(`/books?search=${query}`),
  getBook: (id) => API.get(`/books/${id}`),
  getById: (id) => API.get(`/books/${id}`),
};

// Favorites API Endpoints (if needed)
export const favoritesAPI = {
};

export default API;

export const UploadEmployeeFiles = async (params) => {
  try {
    let response = await fetch(`${baseURL}/FileUpload/UploadFiles`, {
      method: 'POST', 
      headers: {
        'Content-Type': 'application/json',
      },
     body: JSON.stringify(params),
    });

    const data = await response.json();
    console.log('data', data);
    if (response.ok) {
      return { error: false, data };
    } else {
      return { error: true, message: data.message || 'Failed to update attendance status' };
    }
  } catch (error) {
    return { error: true, message: error.message || 'Network error' };
  }
};