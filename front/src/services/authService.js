import axios from 'axios';
import { ENV_CONFIG } from '../config/environment';

// Helper to get API base URL dynamically
const getBaseURL = () => {
    const url = ENV_CONFIG.getApiBaseUrl();
    // 💡 SỬA ĐỔI 1: Nếu URL base kết thúc bằng '/api' (như trong env Amplify), loại bỏ nó.
    // Điều này tránh lỗi 404 Not Found do URL bị trùng: .../api/api/Auth/login
    if (url && url.endsWith('/api')) {
        return url.substring(0, url.length - 4);
    }
    return url;
};

// Tạo axios instance với baseURL được đánh giá mỗi lần gọi
const apiClient = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
});

// Thêm baseURL vào mỗi request (dynamic)
apiClient.interceptors.request.use(
  (config) => {
    // Set baseURL mỗi lần request
    if (!config.baseURL) {
      config.baseURL = getBaseURL();
    }
    
    // 💡 SỬA ĐỔI 2: Ưu tiên gửi ID Token (Cognito) hoặc Local Token (Shipper)
    // ID Token cần thiết cho việc xác thực và lấy thông tin role/claims.
    const idToken = localStorage.getItem('id_token');
    const localToken = localStorage.getItem('local_token');
    // const accessToken = localStorage.getItem('access_token'); // Giữ lại cho việc check cũ nếu cần

    // Ưu tiên ID Token, sau đó là Local Token
    const activeToken = idToken || localToken;
    
    if (activeToken) {
      config.headers.Authorization = `Bearer ${activeToken}`;
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
      authService.logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth service functions
const authService = {
  // Login function - gửi body JSON như Swagger API expect
  login: async (username, password) => {
    try {
      // Gửi dưới dạng JSON body như Swagger API expect
      // 💡 SỬA ĐỔI 1: Thêm lại tiền tố '/api' vì nó đã bị loại bỏ khỏi Base URL
      const response = await apiClient.post('/api/Auth/login', {
        username: username,
        password: password
      });
      
      // Check authType to determine how to handle response
      if (response.data.authType === 'Local') {
        // Local Auth (Shipper) - direct token and user info
        localStorage.setItem('local_token', response.data.token);
        
        const userData = { 
          username: response.data.username,
          userId: response.data.userId,
          email: response.data.username, // Username is email for shipper
          role: response.data.role, // "Shipper"
          authType: response.data.authType, // "Local"
          rewardPoints: 0,
          voucherCount: 0
        };
        localStorage.setItem('user', JSON.stringify(userData));
      } else {
        // Cognito Auth (User/Admin) - Lưu các Cognito tokens
        if (response.data.accessToken) {
          localStorage.setItem('access_token', response.data.accessToken);
          localStorage.setItem('id_token', response.data.idToken);
          localStorage.setItem('refresh_token', response.data.refreshToken);
          
          // Parse user info từ ID token (JWT payload)
          const userInfo = parseJWTPayload(response.data.idToken);
          
          // ⚠️ ƯU TIÊN dùng role từ backend (DynamoDB) thay vì JWT
          const userData = { 
            username: username, // Username from form
            userId: response.data.userId || userInfo.sub, // Ưu tiên backend userId
            cognitoUsername: userInfo['cognito:username'] || username,
            email: userInfo.email || '',
            role: response.data.role || userInfo['custom:role'] || 'User', // ⭐ Backend role ưu tiên
            phone: userInfo.phone_number || '',
            emailVerified: userInfo.email_verified || false,
            authType: 'Cognito',
            rewardPoints: 0,
            voucherCount: 0,
            iat: userInfo.iat,
            exp: userInfo.exp
          };
          localStorage.setItem('user', JSON.stringify(userData));

          // Fetch thêm thông tin user từ DynamoDB (nếu cần)
          try {
            await authService.loadUserProfile(userData.userId);
          } catch (profileError) {
            // Ignore profile load errors
          }
        }
      }
      
      return {
        success: true,
        message: response.data.message || 'Đăng nhập thành công!',
        user: JSON.parse(localStorage.getItem('user')),
        tokens: response.data.authType === 'Local' ? {
          local_token: response.data.token
        } : {
          access_token: response.data.accessToken,
          id_token: response.data.idToken,
          refresh_token: response.data.refreshToken
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
      // 💡 SỬA ĐỔI 1: Thêm lại tiền tố '/api' vì nó đã bị loại bỏ khỏi Base URL
      const response = await apiClient.post('/api/Auth/register', { 
            username: username, 
            password: password, 
            role: role
        });
      
      return {
        success: true,
        message: 'Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.',
        user: response.data.user,
        needsConfirmation: true,
        username: username
      };
    } catch (error) {
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
      // 💡 SỬA ĐỔI 1: Thêm lại tiền tố '/api' vì nó đã bị loại bỏ khỏi Base URL
      const response = await apiClient.post(`/api/Auth/confirm`, {
      username: username, // Gửi trong body
      confirmationCode: confirmationCode // Gửi trong body
    });
      
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
      if (errorMessage === 'Mã xác thực không đúng hoặc đã hết hạn.' && error.response?.data?.error) {
        errorMessage = error.response.data.error;
    }
      throw { message: errorMessage };
    }
  },

  // Resend confirmation code
  resendConfirmationCode: async (username) => {
    try {
      // 💡 SỬA ĐỔI 1: Thêm lại tiền tố '/api' vì nó đã bị loại bỏ khỏi Base URL
      const response = await apiClient.post(`/api/Auth/resend`, { 
            username: username
      });
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
      // const response = await apiClient.get(`/api/User/${userId}`); // THÊM /api
      // const userData = JSON.parse(localStorage.getItem('user'));
      // const updatedUser = { ...userData, ...response.data };
      // localStorage.setItem('user', JSON.stringify(updatedUser));
      // return updatedUser;
    } catch (error) {
      console.error('Load profile error:', error);
      throw error;
    }
  },

  // Logout function - hỗ trợ cả Cognito và Local auth
  logout: async () => {
    try {
      const user = authService.getCurrentUser();
      const accessToken = localStorage.getItem('access_token');
      
      // Nếu là Cognito user (User/Admin), gọi API logout
      if (accessToken && user?.authType === 'Cognito') {
        // 💡 SỬA ĐỔI 1: Thêm lại tiền tố '/api' vì nó đã bị loại bỏ khỏi Base URL
        await apiClient.post('/api/Auth/logout', {}, {
          headers: {
            // 💡 Lưu ý: Logout API thường cần ACCESS TOKEN
            'Authorization': `Bearer ${accessToken}`
          }
        });
      }
    } catch (error) {
      // Vẫn logout ở frontend dù API fail
    } finally {
      // Clear tất cả tokens và user data
      localStorage.removeItem('access_token');
      localStorage.removeItem('id_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('local_token');
      localStorage.removeItem('user');
      
      // Redirect to login page
      window.location.href = '/login';
    }
  },

  // Get current user
  getCurrentUser: () => {
    try {
      const user = localStorage.getItem('user');
      if (!user) return null;
      
      const userData = JSON.parse(user);
      
      // For shipper: different validation
      if (userData.role === 'Shipper') {
        const localToken = localStorage.getItem('local_token');
        return localToken ? userData : null;
      }
      
      // For regular users: need access_token and check expiry
      const idToken = localStorage.getItem('id_token'); // Dùng ID Token để kiểm tra
      if (!idToken) {
        return null;
      }
      
      // Kiểm tra token expiry (only for Cognito tokens)
      if (userData.exp) {
        const now = Date.now();
        const expMillis = userData.exp * 1000;
        
        if (now >= expMillis) {
          authService.logout();
          return null;
        }
      }
      
      return userData;
    } catch (error) {
      return null;
    }
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const user = authService.getCurrentUser();
    const idToken = localStorage.getItem('id_token');
    const localToken = localStorage.getItem('local_token');
    
    // For shipper: only need local_token and user with Shipper role
    if (user?.role === 'Shipper') {
      return !!(localToken && user);
    }
    
    // For regular users (User/Admin): need Cognito ID_token
    return !!(idToken && user);
  },
  // ... (Các hàm is* khác không đổi)

  // Get appropriate token based on user type
  getToken: () => {
    const user = authService.getCurrentUser();
    if (user?.role === 'Shipper') {
      return localStorage.getItem('local_token');
    }
    // 💡 Trả về ID Token cho User/Admin
    return localStorage.getItem('id_token'); 
  }
};

// Helper function để parse JWT payload (Không đổi)
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