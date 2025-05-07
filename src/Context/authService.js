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
      formData.append('RoleID', adminData.roleID); // Using roleID (uppercase D)

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

  login: async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      
      return {
        success: true,
        data: response.data.user,
        token: response.data.token,
        message: "Login successful"
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Invalid credentials"
      };
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    return Promise.resolve();
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