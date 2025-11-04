import axios from 'axios';

// URL backend C# của bạn
const API_BASE_URL = 'http://localhost:5144/api';

// Tạo axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor để thêm access token vào mỗi request
apiClient.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('access_token');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor để xử lý response errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired, logout user
      console.warn('Token expired, logging out...');
      authService.logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth service functions
export const authService = {
  // Login function - sử dụng query parameters như backend
  login: async (username, password) => {
    try {
      // Gửi dưới dạng query parameters như backend expect
      const response = await apiClient.post(`/Auth/login?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`);
      
      console.log('Login response:', response.data);
      
      // Lưu các Cognito tokens
      if (response.data.access_token) {
        localStorage.setItem('access_token', response.data.access_token);
        localStorage.setItem('id_token', response.data.id_token);
        localStorage.setItem('refresh_token', response.data.refresh_token);
        
        // Parse user info từ ID token (JWT payload)
        const userInfo = parseJWTPayload(response.data.id_token);
        const userData = { 
          username: username, // Username from form
          userId: userInfo.sub, // Cognito User ID (UserSub)
          cognitoUsername: userInfo['cognito:username'] || username, // Cognito username
          email: userInfo.email || '',
          role: userInfo['custom:role'] || 'User', // Role từ Cognito custom attribute
          phone: userInfo.phone_number || '',
          emailVerified: userInfo.email_verified || false,
          rewardPoints: 0, // Sẽ được load từ DynamoDB
          voucherCount: 0, // Sẽ được load từ DynamoDB
          iat: userInfo.iat,
          exp: userInfo.exp
        };
        localStorage.setItem('user', JSON.stringify(userData));

        // Fetch thêm thông tin user từ DynamoDB (nếu cần)
        try {
          await authService.loadUserProfile(userData.userId);
        } catch (profileError) {
          console.warn('Could not load user profile from DynamoDB:', profileError);
        }
      }
      
      return {
        success: true,
        message: 'Đăng nhập thành công!',
        user: JSON.parse(localStorage.getItem('user')),
        tokens: {
          access_token: response.data.access_token,
          id_token: response.data.id_token,
          refresh_token: response.data.refresh_token
        }
      };
    } catch (error) {
      console.error('Login error:', error);
      let errorMessage = 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.';
      
      if (error.response?.data?.error) {
        const backendError = error.response.data.error;
        if (backendError.includes('NotAuthorizedException')) {
          errorMessage = 'Tên đăng nhập hoặc mật khẩu không đúng.';
        } else if (backendError.includes('UserNotConfirmedException')) {
          errorMessage = 'Tài khoản chưa được xác thực. Vui lòng kiểm tra email và xác thực tài khoản.';
        } else if (backendError.includes('UserNotFoundException')) {
          errorMessage = 'Tài khoản không tồn tại.';
        }
      }
      
      throw { message: errorMessage };
    }
  },

  // Register function - sử dụng query parameters
  register: async (username, password, role = 'User') => {
    try {
      console.log('🚀 Sending register request to:', API_BASE_URL);
      console.log('📝 Register data:', { username, role });
      
      // Gửi dưới dạng query parameters
      const response = await apiClient.post(`/Auth/register?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&role=${encodeURIComponent(role)}`);
      
      console.log('✅ Register response:', response.data);
      
      return {
        success: true,
        message: 'Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.',
        user: response.data.user,
        needsConfirmation: true,
        username: username
      };
    } catch (error) {
      console.error('❌ Register error:', error);
      console.error('❌ Error response data:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      
      let errorMessage = 'Đăng ký thất bại. Vui lòng thử lại.';
      
      // Xử lý lỗi từ backend
      if (error.response?.data) {
        const backendError = error.response.data;
        
        // Nếu backend trả về string error message trực tiếp
        if (typeof backendError === 'string') {
          if (backendError.includes('User already exists') || 
              backendError.includes('already exists') ||
              backendError.includes('UsernameExistsException')) {
            errorMessage = 'Tên đăng nhập đã tồn tại. Vui lòng chọn tên khác.';
          } else if (backendError.includes('InvalidPasswordException')) {
            errorMessage = 'Mật khẩu không đủ mạnh. Vui lòng sử dụng ít nhất 8 ký tự bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.';
          } else {
            errorMessage = backendError; // Hiển thị message từ backend
          }
        }
        // Nếu backend trả về object với error property
        else if (backendError.error) {
          const errorText = backendError.error;
          if (errorText.includes('UsernameExistsException') || 
              errorText.includes('User already exists') ||
              errorText.includes('already exists')) {
            errorMessage = 'Tên đăng nhập đã tồn tại..';
          } else if (errorText.includes('InvalidPasswordException')) {
            errorMessage = 'Mật khẩu không đủ mạnh. Vui lòng sử dụng ít nhất 8 ký tự bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.';
          } else if (errorText.includes('InvalidParameterException')) {
            errorMessage = 'Thông tin đăng ký không hợp lệ. Vui lòng kiểm tra lại.';
          } else {
            errorMessage = errorText;
          }
        }
        // Nếu backend trả về object với message property
        else if (backendError.message) {
          errorMessage = backendError.message;
        }
      }
      
      throw { message: errorMessage };
    }
  },

  // Confirm sign up - Xác thực email với Cognito
  confirmSignUp: async (username, confirmationCode) => {
    try {
      const response = await apiClient.post(`/Auth/confirm?username=${encodeURIComponent(username)}&confirmationCode=${encodeURIComponent(confirmationCode)}`);
      
      return {
        success: true,
        message: 'Xác thực tài khoản thành công! Bạn có thể đăng nhập ngay.'
      };
    } catch (error) {
      console.error('Confirm error:', error);
      let errorMessage = 'Mã xác thực không đúng hoặc đã hết hạn.';
      
      if (error.response?.data?.error) {
        const backendError = error.response.data.error;
        if (backendError.includes('CodeMismatchException')) {
          errorMessage = 'Mã xác thực không đúng. Vui lòng kiểm tra lại.';
        } else if (backendError.includes('ExpiredCodeException')) {
          errorMessage = 'Mã xác thực đã hết hạn. Vui lòng yêu cầu mã mới.';
        } else if (backendError.includes('NotAuthorizedException')) {
          errorMessage = 'Tài khoản đã được xác thực hoặc không tồn tại.';
        }
      }
      
      throw { message: errorMessage };
    }
  },

  // Resend confirmation code
  resendConfirmationCode: async (username) => {
    try {
      const response = await apiClient.post(`/Auth/resend?username=${encodeURIComponent(username)}`);
      
      return {
        success: true,
        message: 'Mã xác thực mới đã được gửi đến email của bạn.'
      };
    } catch (error) {
      console.error('Resend error:', error);
      let errorMessage = 'Không thể gửi lại mã xác thực.';
      
      if (error.response?.data?.error) {
        const backendError = error.response.data.error;
        if (backendError.includes('LimitExceededException')) {
          errorMessage = 'Bạn đã yêu cầu quá nhiều lần. Vui lòng thử lại sau.';
        } else if (backendError.includes('UserNotFoundException')) {
          errorMessage = 'Tài khoản không tồn tại.';
        }
      }
      
      throw { message: errorMessage };
    }
  },

  // Load user profile từ DynamoDB
  loadUserProfile: async (userId) => {
    try {
      // TODO: Implement API endpoint để lấy user profile từ DynamoDB
      // const response = await apiClient.get(`/User/${userId}`);
      // const userData = JSON.parse(localStorage.getItem('user'));
      // const updatedUser = { ...userData, ...response.data };
      // localStorage.setItem('user', JSON.stringify(updatedUser));
      // return updatedUser;
    } catch (error) {
      console.error('Load profile error:', error);
      throw error;
    }
  },

  // Logout function - gọi API logout của Cognito
  logout: async () => {
    try {
      const accessToken = localStorage.getItem('access_token');
      if (accessToken) {
        // Cognito GlobalSignOut
        await apiClient.post('/Auth/logout', {}, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Vẫn logout ở frontend dù API fail
    } finally {
      // Clear tất cả tokens và user data
      localStorage.removeItem('access_token');
      localStorage.removeItem('id_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    }
  },

  // Get current user
  getCurrentUser: () => {
    try {
      const user = localStorage.getItem('user');
      const accessToken = localStorage.getItem('access_token');
      
      if (!user || !accessToken) return null;
      
      const userData = JSON.parse(user);
      
      // Kiểm tra token expiry
      if (userData.exp && Date.now() >= userData.exp * 1000) {
        console.warn('Token expired');
        authService.logout();
        return null;
      }
      
      return userData;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const accessToken = localStorage.getItem('access_token');
    const user = authService.getCurrentUser();
    return !!(accessToken && user);
  },

  // Check if user is admin
  isAdmin: () => {
    const user = authService.getCurrentUser();
    return user?.role === 'Admin';
  },

  // Get access token
  getAccessToken: () => {
    return localStorage.getItem('access_token');
  },

  // Get ID token
  getIdToken: () => {
    return localStorage.getItem('id_token');
  },

  // Get refresh token
  getRefreshToken: () => {
    return localStorage.getItem('refresh_token');
  }
};

// Helper function để parse JWT payload
const parseJWTPayload = (token) => {
  try {
    if (!token || typeof token !== 'string') {
      throw new Error('Invalid token');
    }
    
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format');
    }
    
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    
    // Add padding if needed
    const padding = base64.length % 4;
    const paddedBase64 = padding ? base64 + '='.repeat(4 - padding) : base64;
    
    const jsonPayload = decodeURIComponent(
      atob(paddedBase64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error parsing JWT:', error);
    return {};
  }
};

export default authService;