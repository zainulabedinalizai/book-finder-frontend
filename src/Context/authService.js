export const authService = {
    register: async (userData) => {
      // Keep your existing registration logic
      return {
        success: false,
        message: "Registration is disabled in test mode"
      };
    },
  
    login: async (credentials) => {
      console.log("Static login validation with:", credentials);
      
      // Static validation
      if (credentials.username === "Admin" && credentials.password === "123") {
        return {
          success: true,
          data: {
            username: "Admin",
            role: "Administrator",
            email: "admin@test.com"
          },
          token: "static-test-token-admin-123",
          message: "Static login successful"
        };
      }
      
      return {
        success: false,
        message: "Invalid credentials. Use Admin/123 for test login"
      };
    },
  
    logout: () => {
      console.log("Static logout");
      return Promise.resolve();
    }
  };