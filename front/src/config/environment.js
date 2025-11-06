const isDevelopment = process.env.NODE_ENV === 'development';
const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
  window.location.hostname === '[::1]' ||
  window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
);

export const ENV_CONFIG = {
  // API Configuration
  API: {
    // Cho localhost development - sử dụng backend API
    LOCAL: {
      USE_AMPLIFY_AUTH: false, // Sử dụng custom API
      API_BASE_URL: 'http://localhost:5144/api',
      AUTH_TYPE: 'custom'
    },
    // Cho domain deployment - sử dụng Amplify + Cognito
    PRODUCTION: {
      USE_AMPLIFY_AUTH: true, // Sử dụng Amplify Auth
      API_BASE_URL: '', // Không cần API URL vì dùng Amplify trực tiếp
      AUTH_TYPE: 'amplify',
      DESCRIPTION: 'Production with AWS Amplify Auth'
    }
  },
  
  // Environment detection
  IS_DEVELOPMENT: isDevelopment,
  IS_LOCALHOST: isLocalhost,
  
  // Current config
  CURRENT: isLocalhost ? 'LOCAL' : 'PRODUCTION',
  
  // Domain information
  DOMAIN: {
    LOCALHOST: 'http://localhost:3000',
    PRODUCTION: 'https://main.d3djm3hylbiyyu.amplifyapp.com'
  }
};

console.log('🌍 Environment Detection:');
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- Hostname:', window.location.hostname);
console.log('- Is Localhost:', isLocalhost);
console.log('- Current Config:', ENV_CONFIG.CURRENT);
console.log('- Auth Type:', ENV_CONFIG.API[ENV_CONFIG.CURRENT].AUTH_TYPE);
console.log('- Description:', ENV_CONFIG.API[ENV_CONFIG.CURRENT].DESCRIPTION);