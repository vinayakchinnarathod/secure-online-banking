// TestAutoKYC.js - Simple Test Component
import React from 'react';

const TestAutoKYC = () => {
  const containerStyle = {
    padding: '20px',
    maxWidth: '800px',
    margin: '0 auto',
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#f5f5f5'
  };

  const cardStyle = {
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '20px',
    backgroundColor: '#ffffff',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  };

  const buttonStyle = {
    backgroundColor: '#28a745',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginRight: '10px',
    fontSize: '14px'
  };

  const successStyle = {
    color: '#28a745',
    fontWeight: 'bold'
  };

  const errorStyle = {
    color: '#dc3545',
    fontWeight: 'bold'
  };

  return (
    <div style={containerStyle}>
      <h1>🧪 Auto-KYC Integration Test</h1>
      
      <div style={cardStyle}>
        <h2>📋 What to Test</h2>
        <ol>
          <li><strong>Document Upload:</strong> Upload ID card, passport, or driver license</li>
          <li><strong>AI Verification:</strong> Process document with AI</li>
          <li><strong>Face Verification:</strong> Optional face matching</li>
          <li><strong>Liveness Detection:</strong> Anti-spoofing check</li>
          <li><strong>Results Display:</strong> Show verification outcomes</li>
        </ol>
      </div>
    </div>
  );
};

export default TestAutoKYC;
