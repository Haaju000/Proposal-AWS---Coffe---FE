// Environment configuration for the application

export const ENV_CONFIG = {
  API: {
    LOCAL: {
      USE_AMPLIFY_AUTH: false,
      API_BASE_URL: 'http://localhost:5144/api',
      AUTH_TYPE: 'custom'
    },
    PRODUCTION: {
      USE_AMPLIFY_AUTH: true,
      API_BASE_URL: 'https://main.d3djm3hylbiyyu.amplifyapp.com/', // Fallback to localhost for now
      AUTH_TYPE: 'amplify'
    }
  },
  
  // Environment detection
  IS_LOCALHOST: Boolean(
    window.location.hostname === 'localhost' ||
    window.location.hostname === '[::1]' ||
    window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
  ),
  
  // Current environment
  get CURRENT() {
    return this.IS_LOCALHOST ? 'LOCAL' : 'PRODUCTION';
  },

  // Helper methods
  getApiBaseUrl() {
    return this.API[this.CURRENT].API_BASE_URL;
  },

  shouldUseAmplify() {
    return this.API[this.CURRENT].USE_AMPLIFY_AUTH;
  }
};