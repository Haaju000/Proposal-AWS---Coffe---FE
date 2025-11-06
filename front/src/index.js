import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Environment detection và conditional Amplify setup
const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
  window.location.hostname === '[::1]' ||
  window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
);

// Conditional Amplify configuration - chỉ setup cho production
if (!isLocalhost) {
  console.log('🌐 Production environment detected - configuring Amplify');
  import('aws-amplify').then(({ Amplify }) => {
    import('./aws-exports').then(({ default: awsExports }) => {
      Amplify.configure(awsExports);
      console.log('✅ Amplify configured for production');
    });
  });
} else {
  console.log('🏠 Localhost environment detected - using custom API');
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
