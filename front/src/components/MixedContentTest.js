import React, { useEffect, useState } from 'react';
import { ENV_CONFIG } from '../config/environment';

/**
 * ⚠️ Mixed Content Test Component
 * 
 * Test xem HTTPS Frontend có gọi được HTTP Backend không
 * CHỈ dùng để DEBUG, không dùng trong production
 */
const MixedContentTest = () => {
  const [testResults, setTestResults] = useState({
    frontendProtocol: window.location.protocol,
    backendURL: ENV_CONFIG.getApiBaseUrl(),
    canConnect: null,
    error: null,
  });

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      console.log('🧪 Testing Mixed Content...');
      console.log('Frontend:', window.location.protocol, window.location.host);
      console.log('Backend:', ENV_CONFIG.getApiBaseUrl());

      // Test simple GET request
      const response = await fetch(`${ENV_CONFIG.getApiBaseUrl()}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setTestResults(prev => ({
          ...prev,
          canConnect: true,
          error: null,
        }));
        console.log('✅ Mixed Content working!');
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        canConnect: false,
        error: error.message,
      }));
      console.error('❌ Mixed Content blocked:', error);
    }
  };

  const isMixedContent = 
    testResults.frontendProtocol === 'https:' && 
    testResults.backendURL.startsWith('http://');

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      padding: '20px',
      background: isMixedContent ? '#fff3cd' : '#d1ecf1',
      border: `2px solid ${isMixedContent ? '#ffc107' : '#17a2b8'}`,
      borderRadius: '8px',
      maxWidth: '400px',
      fontSize: '12px',
      zIndex: 9999,
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    }}>
      <h4 style={{ margin: '0 0 10px 0' }}>
        🧪 Mixed Content Test
      </h4>
      
      <div style={{ marginBottom: '10px' }}>
        <strong>Frontend:</strong> {testResults.frontendProtocol}//{window.location.host}
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <strong>Backend:</strong> {testResults.backendURL}
      </div>
      
      {isMixedContent && (
        <div style={{
          padding: '10px',
          background: '#fff',
          border: '1px solid #ffc107',
          borderRadius: '4px',
          marginBottom: '10px',
        }}>
          ⚠️ <strong>MIXED CONTENT DETECTED!</strong>
          <br />
          HTTPS Frontend → HTTP Backend
        </div>
      )}
      
      <div style={{
        padding: '10px',
        background: testResults.canConnect === null ? '#e9ecef' :
                    testResults.canConnect ? '#d4edda' : '#f8d7da',
        border: `1px solid ${
          testResults.canConnect === null ? '#dee2e6' :
          testResults.canConnect ? '#c3e6cb' : '#f5c6cb'
        }`,
        borderRadius: '4px',
      }}>
        <strong>Connection Status:</strong> {
          testResults.canConnect === null ? '⏳ Testing...' :
          testResults.canConnect ? '✅ Connected' : '❌ Failed'
        }
        {testResults.error && (
          <div style={{ marginTop: '5px', color: '#721c24' }}>
            <strong>Error:</strong> {testResults.error}
          </div>
        )}
      </div>

      {!testResults.canConnect && testResults.error && (
        <div style={{ marginTop: '10px', fontSize: '11px', color: '#666' }}>
          <strong>💡 Giải pháp:</strong>
          <ol style={{ margin: '5px 0', paddingLeft: '20px' }}>
            <li>Thêm HTTPS cho backend</li>
            <li>Hoặc deploy frontend trên HTTP</li>
          </ol>
        </div>
      )}

      <button
        onClick={testConnection}
        style={{
          marginTop: '10px',
          padding: '8px 16px',
          background: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          width: '100%',
        }}
      >
        🔄 Test lại
      </button>
    </div>
  );
};

export default MixedContentTest;
