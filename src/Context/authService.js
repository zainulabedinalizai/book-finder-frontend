// authService.js
import { authAPI, userAPI } from "../Api/api";

export const authService = {
  register: async (userData) => {
    try {
      const formattedDate = new Date(userData.dob).toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric'
      });
      
      const formData = new URLSearchParams();
      formData.append('Username', userData.username);
      formData.append('Email', userData.email);
      formData.append('Password', userData.password);
      formData.append('FullName', userData.fullName);
      formData.append('DOB', formattedDate);
      formData.append('Gender', userData.gender);
      formData.append('Mobile', userData.mobile);
      formData.append('PostalAddress', userData.address);

      const response = await authAPI.register(formData.toString());
      return {
        success: true,
        data: response.data,
        message: "Registration successful"
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Registration failed"
      };
    }
  },

  adminRegister: async (adminData) => {
    try {
      const formattedDate = new Date(adminData.dob).toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric'
      });
      
      const formData = new URLSearchParams();
      formData.append('Username', adminData.username);
      formData.append('Email', adminData.email);
      formData.append('Password', adminData.password);
      formData.append('FullName', adminData.fullName);
      formData.append('DOB', formattedDate);
      formData.append('Gender', adminData.gender);
      formData.append('Mobile', adminData.mobile);
      formData.append('PostalAddress', adminData.address);
      formData.append('RoleID', adminData.roleID);

      const response = await authAPI.adminRegister(formData.toString());
      return {
        success: true,
        data: response.data,
        message: "Admin registration successful"
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Admin registration failed"
      };
    }
  },

// authService.js
login: async (credentials) => {
  try {
    const response = await authAPI.login(credentials.username, credentials.password);
    console.log('Login response:', response.data); // Debugging
    
    if (response.data.success) {  // Changed from Success to success
      const userData = response.data.data && response.data.data.length > 0 
        ? response.data.data[0] 
        : null;
      
      // Create a token if not provided by backend
      const token = userData?.Token || 'default-token-from-backend';
      
      return {
        success: true,
        data: userData,
        token: token,
        message: "Login successful"
      };
    } else {
      return {
        success: false,
        message: response.data.message || "Invalid credentials"  // Changed from Message to message
      };
    }
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      message: error.response?.data?.message ||  // Changed from Message to message
             error.message || 
             "Invalid credentials"
    };
  }
},

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return Promise.resolve();
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  } ,

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

  return userAPI.post('/UpdateUserProfile', formData.toString(), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });
}

};

export const userService = {
  getUserList: async (userId) => {
    try {
      const response = await userAPI.getUserList(userId);
      return {
        success: true,
        data: response.data,
        message: "Users fetched successfully"
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch users"
      };
    }
  },

  deleteUser: async (userId) => {
    try {
      const response = await userAPI.deleteUser(userId);
      return {
        success: true,
        data: response.data,
        message: "User deleted successfully"
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to delete user"
      };
    }
  }
};