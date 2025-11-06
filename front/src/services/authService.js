import axios from 'axios';
import { ENV_CONFIG } from '../config/environment';

// Conditional Auth import - chỉ import khi cần
let Auth = null;

// Lazy load Amplify Auth cho production
const loadAmplifyAuth = async () => {
  if (!Auth && ENV_CONFIG.CURRENT === 'PRODUCTION') {
    try {
      const amplifyModule = await import('aws-amplify');
      Auth = amplifyModule.Auth;
      console.log('✅ Amplify Auth loaded');
    } catch (error) {
      console.error('❌ Failed to load Amplify Auth:', error);
    }
  }
  return Auth;
};

// API Client cho localhost
const apiClient = axios.create({
  baseURL: ENV_CONFIG.API.LOCAL.API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor để thêm access token vào mỗi request (localhost only)
apiClient.interceptors.request.use(
  (config) => {
    if (ENV_CONFIG.CURRENT === 'LOCAL') {
      const accessToken = localStorage.getItem('access_token');
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Helper để parse JWT payload
const parseJWTPayload = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error parsing JWT:', error);
    return {};
  }
};

// Hybrid Auth Service
export const authService = {
  
  // Login function - hybrid approach
  login: async (username, password) => {
    console.log('🔄 Login attempt with environment:', ENV_CONFIG.CURRENT);
    
    if (ENV_CONFIG.CURRENT === 'PRODUCTION') {
      // Production: Use Amplify Auth
      return await authService.amplifyLogin(username, password);
    } else {
      // Development: Use custom API
      return await authService.customLogin(username, password);
    }
  },

  // Amplify Login (for production)
  amplifyLogin: async (username, password) => {
    try {
      console.log('🚀 Using Amplify Auth for production');
      
      const amplifyAuth = await loadAmplifyAuth();
      if (!amplifyAuth) {
        throw new Error('Amplify Auth not available');
      }
      
      const user = await amplifyAuth.signIn(username, password);
      const session = await amplifyAuth.currentSession();
      const userInfo = await amplifyAuth.currentUserInfo();
      
      const userData = {
        username: user.username,
        userId: userInfo?.id || user.username,
        email: userInfo?.attributes?.email || '',
        role: userInfo?.attributes?.['custom:role'] || 'User',
        accessToken: session.getAccessToken().getJwtToken(),
        authType: 'amplify'
      };
      
      localStorage.setItem('user', JSON.stringify(userData));
      
      return {
        success: true,
        message: 'Đăng nhập thành công!',
        user: userData,
        tokens: {
          access_token: userData.accessToken,
          id_token: session.getIdToken().getJwtToken(),
          refresh_token: session.getRefreshToken().getToken()
        }
      };
    } catch (error) {
      console.error('❌ Amplify login error:', error);
      throw { message: authService.getAmplifyErrorMessage(error) };
    }
  },

  // Custom API Login (for localhost)
  customLogin: async (username, password) => {
    try {
      console.log('🏠 Using Custom API for localhost development');
      
      const response = await apiClient.post(`/Auth/login?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`);
      
      if (response.data.access_token) {
        // Lưu tokens
        localStorage.setItem('access_token', response.data.access_token);
        localStorage.setItem('id_token', response.data.id_token);
        localStorage.setItem('refresh_token', response.data.refresh_token);
        
        // Parse user info từ JWT
        const userInfo = parseJWTPayload(response.data.id_token);
        const userData = { 
          username: username,
          userId: userInfo.sub,
          email: userInfo.email || '',
          role: userInfo['custom:role'] || 'User',
          accessToken: response.data.access_token,
          authType: 'custom'
        };
        
        localStorage.setItem('user', JSON.stringify(userData));
        
        return {
          success: true,
          message: 'Đăng nhập thành công!',
          user: userData,
          tokens: {
            access_token: response.data.access_token,
            id_token: response.data.id_token,
            refresh_token: response.data.refresh_token
          }
        };
      }
    } catch (error) {
      console.error('❌ Custom API login error:', error);
      throw { message: authService.getCustomAPIErrorMessage(error) };
    }
  },

  // Register function - hybrid
  register: async (username, password, role = 'User') => {
    console.log('🔄 Register attempt with environment:', ENV_CONFIG.CURRENT);
    
    if (ENV_CONFIG.CURRENT === 'PRODUCTION') {
      return await authService.amplifyRegister(username, password, role);
    } else {
      return await authService.customRegister(username, password, role);
    }
  },

  // Amplify Register
  amplifyRegister: async (username, password, role) => {
    try {
      console.log('🚀 Using Amplify Auth register for production');
      
      const amplifyAuth = await loadAmplifyAuth();
      if (!amplifyAuth) {
        throw new Error('Amplify Auth not available');
      }
      
      const result = await amplifyAuth.signUp({
        username,
        password,
        attributes: {
          'custom:role': role
        }
      });
      
      return {
        success: true,
        message: 'Đăng ký thành công! Vui lòng kiểm tra email để xác thực.',
        needsConfirmation: !result.userConfirmed,
        username: username
      };
    } catch (error) {
      console.error('❌ Amplify register error:', error);
      throw { message: authService.getAmplifyErrorMessage(error) };
    }
  },

  // Custom API Register
  customRegister: async (username, password, role) => {
    try {
      console.log('🏠 Using Custom API register for localhost');
      
      const response = await apiClient.post(`/Auth/register?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&role=${encodeURIComponent(role)}`);
      
      return {
        success: true,
        message: 'Đăng ký thành công! Vui lòng kiểm tra email để xác thực.',
        user: response.data.user,
        needsConfirmation: true,
        username: username
      };
    } catch (error) {
      console.error('❌ Custom API register error:', error);
      throw { message: authService.getCustomAPIErrorMessage(error) };
    }
  },

  // Confirm SignUp - hybrid
  confirmSignUp: async (username, code) => {
    console.log('🔄 Confirm signup with environment:', ENV_CONFIG.CURRENT);
    
    if (ENV_CONFIG.CURRENT === 'PRODUCTION') {
      return await authService.amplifyConfirmSignUp(username, code);
    } else {
      return await authService.customConfirmSignUp(username, code);
    }
  },

  // Amplify Confirm SignUp
  amplifyConfirmSignUp: async (username, code) => {
    try {
      const amplifyAuth = await loadAmplifyAuth();
      if (!amplifyAuth) {
        throw new Error('Amplify Auth not available');
      }
      
      await amplifyAuth.confirmSignUp(username, code);
      
      return {
        success: true,
        message: 'Xác thực tài khoản thành công! Bạn có thể đăng nhập ngay.'
      };
    } catch (error) {
      console.error('❌ Amplify confirm error:', error);
      throw { message: authService.getAmplifyErrorMessage(error) };
    }
  },

  // Custom API Confirm SignUp
  customConfirmSignUp: async (username, code) => {
    try {
      const response = await apiClient.post(`/Auth/confirm?username=${encodeURIComponent(username)}&code=${encodeURIComponent(code)}`);
      
      return {
        success: true,
        message: 'Xác thực tài khoản thành công! Bạn có thể đăng nhập ngay.'
      };
    } catch (error) {
      console.error('❌ Custom API confirm error:', error);
      throw { message: authService.getCustomAPIErrorMessage(error) };
    }
  },

  // Resend Confirmation Code - hybrid
  resendConfirmationCode: async (username) => {
    console.log('🔄 Resend code with environment:', ENV_CONFIG.CURRENT);
    
    if (ENV_CONFIG.CURRENT === 'PRODUCTION') {
      return await authService.amplifyResendCode(username);
    } else {
      return await authService.customResendCode(username);
    }
  },

  // Amplify Resend Code
  amplifyResendCode: async (username) => {
    try {
      const amplifyAuth = await loadAmplifyAuth();
      if (!amplifyAuth) {
        throw new Error('Amplify Auth not available');
      }
      
      await amplifyAuth.resendSignUp(username);
      
      return {
        success: true,
        message: 'Mã xác thực mới đã được gửi đến email của bạn.'
      };
    } catch (error) {
      console.error('❌ Amplify resend error:', error);
      throw { message: authService.getAmplifyErrorMessage(error) };
    }
  },

  // Custom API Resend Code
  customResendCode: async (username) => {
    try {
      const response = await apiClient.post(`/Auth/resend?username=${encodeURIComponent(username)}`);
      
      return {
        success: true,
        message: 'Mã xác thực mới đã được gửi đến email của bạn.'
      };
    } catch (error) {
      console.error('❌ Custom API resend error:', error);
      throw { message: authService.getCustomAPIErrorMessage(error) };
    }
  },

  // Logout - hybrid
  logout: async () => {
    try {
      if (ENV_CONFIG.CURRENT === 'PRODUCTION') {
        const amplifyAuth = await loadAmplifyAuth();
        if (amplifyAuth) {
          await amplifyAuth.signOut();
        }
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear all stored data cho cả 2 environments
      localStorage.removeItem('access_token');
      localStorage.removeItem('id_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      console.log('✅ Logout completed');
    }
  },

  // Get current user
  getCurrentUser: () => {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  },

  // Check authentication
  isAuthenticated: () => {
    const user = authService.getCurrentUser();
    return !!user && !!user.accessToken;
  },

  // Check if user is admin
  isAdmin: () => {
    const user = authService.getCurrentUser();
    return user?.role === 'Admin';
  },

  // Get access token
  getAccessToken: () => {
    const user = authService.getCurrentUser();
    return user?.accessToken || localStorage.getItem('access_token');
  },

  // Error message helpers
  getAmplifyErrorMessage: (error) => {
    switch (error.code) {
      case 'NotAuthorizedException':
        return 'Tên đăng nhập hoặc mật khẩu không đúng.';
      case 'UserNotConfirmedException':
        return 'Tài khoản chưa được xác thực. Vui lòng kiểm tra email và xác thực tài khoản.';
      case 'UserNotFoundException':
        return 'Tài khoản không tồn tại.';
      case 'UsernameExistsException':
        return 'Tên đăng nhập đã tồn tại. Vui lòng chọn tên khác.';
      case 'InvalidPasswordException':
        return 'Mật khẩu không đủ mạnh. Vui lòng sử dụng ít nhất 8 ký tự bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.';
      case 'CodeMismatchException':
        return 'Mã xác thực không đúng. Vui lòng kiểm tra lại.';
      case 'ExpiredCodeException':
        return 'Mã xác thực đã hết hạn. Vui lòng yêu cầu mã mới.';
      case 'LimitExceededException':
        return 'Bạn đã thực hiện quá nhiều lần. Vui lòng thử lại sau.';
      case 'TooManyRequestsException':
        return 'Quá nhiều yêu cầu. Vui lòng thử lại sau.';
      default:
        return error.message || 'Có lỗi xảy ra. Vui lòng thử lại.';
    }
  },

  getCustomAPIErrorMessage: (error) => {
    if (error.response?.data) {
      const responseData = error.response.data;
      
      if (typeof responseData === 'string') {
        if (responseData.includes('User already exists') || 
            responseData.includes('already exists')) {
          return 'Tên đăng nhập đã tồn tại. Vui lòng chọn tên khác.';
        }
        return responseData;
      } else if (responseData.error) {
        return responseData.error;
      } else if (responseData.message) {
        return responseData.message;
      }
    }
    
    return error.message || 'Có lỗi xảy ra. Vui lòng thử lại.';
  }
};

export default authService;