// AutoKYCSimple.js - Fixed Auto-KYC Component
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AutoKYCSimple = ({ 
  currentUser, 
  javaBackendUrl = 'http://localhost:8080',
  onVerificationComplete 
}) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [verificationInProgress, setVerificationInProgress] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [error, setError] = useState(null);
  const [serviceStatus, setServiceStatus] = useState(null);

  useEffect(() => {
    checkServiceStatus();
  }, []);

  const checkServiceStatus = async () => {
    try {
      const response = await fetch(`${javaBackendUrl}/api/autokyc/health`);
      const data = await response.json();
      setServiceStatus(data);
    } catch (err) {
      setServiceStatus({ service_healthy: false, error: err.message });
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
    }
  };

  const performVerification = async () => {
    if (!selectedFile) {
      setError('Please select a document file');
      return;
    }

    setVerificationInProgress(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('document_file', selectedFile);
      formData.append('document_type', 'id_card');
      formData.append('user_id', currentUser?.id || 'anonymous');

      const response = await fetch(`${javaBackendUrl}/api/autokyc/complete-verification`, {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      
      if (response.ok) {
        setVerificationResult(result);
        if (onVerificationComplete) {
          onVerificationComplete(result);
        }
      } else {
        setError(result.message || 'Verification failed');
      }
    } catch (err) {
      setError('Verification failed: ' + err.message);
    } finally {
      setVerificationInProgress(false);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setVerificationResult(null);
    setError(null);
  };

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
    backgroundColor: '#007bff',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginRight: '10px',
    fontSize: '14px'
  };

  const buttonDisabledStyle = {
    backgroundColor: '#ccc',
    color: '#666',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'not-allowed',
    marginRight: '10px',
    fontSize: '14px'
  };

  const alertStyle = {
    padding: '15px',
    marginBottom: '20px',
    borderRadius: '4px',
    border: '1px solid'
  };

  const successAlertStyle = {
    ...alertStyle,
    backgroundColor: '#d4edda',
    borderColor: '#c3e6cb',
    color: '#155724'
  };

  const errorAlertStyle = {
    ...alertStyle,
    backgroundColor: '#f8d7da',
    borderColor: '#f5c6cb',
    color: '#721c24'
  };

  const infoAlertStyle = {
    ...alertStyle,
    backgroundColor: '#d1ecf1',
    borderColor: '#bee5eb',
    color: '#0c5460'
  };

  const headerStyle = {
    color: '#333',
    marginBottom: '20px',
    textAlign: 'center'
  };

  const subHeaderStyle = {
    color: '#666',
    marginBottom: '15px'
  };

  return (
    <div style={containerStyle}>
      <h1 style={headerStyle}>🤖 Auto-KYC Document Verification</h1>
      
      {/* Service Status */}
      {serviceStatus && (
        <div style={serviceStatus.service_healthy ? successAlertStyle : errorAlertStyle}>
          <strong>🔧 Service Status:</strong> {serviceStatus.service_healthy ? '✅ Connected and operational' : '❌ Service unavailable'}
          {serviceStatus.error && <span><br />Error: {serviceStatus.error}</span>}
        </div>
      )}

      {/* Verification Card */}
      <div style={cardStyle}>
        <h2 style={subHeaderStyle}>📄 Document Upload & Verification</h2>
        
        {/* File Upload */}
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="document-upload" style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
            Select Document:
          </label>
          <input
            type="file"
            id="document-upload"
            accept=".jpg,.jpeg,.png,.pdf"
            onChange={handleFileSelect}
            style={{ marginBottom: '10px', padding: '8px' }}
          />
        </div>

        {/* Selected File Info */}
        {selectedFile && (
          <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#e9ecef', borderRadius: '4px' }}>
            <strong>📎 Selected File:</strong> {selectedFile.name}<br />
            <strong>📏 Size:</strong> {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div style={errorAlertStyle}>
            <strong>❌ Error:</strong> {error}
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ marginBottom: '20px' }}>
          <button
            onClick={performVerification}
            disabled={!selectedFile || verificationInProgress}
            style={!selectedFile || verificationInProgress ? buttonDisabledStyle : buttonStyle}
          >
            {verificationInProgress ? '🔄 Verifying...' : '🚀 Start AI Verification'}
          </button>
          
          <button
            onClick={resetForm}
            disabled={verificationInProgress}
            style={verificationInProgress ? buttonDisabledStyle : buttonStyle}
          >
            🔄 Reset
          </button>
        </div>

        {/* Progress */}
        {verificationInProgress && (
          <div style={infoAlertStyle}>
            <strong>🔄 Processing document with AI...</strong><br />
            Please wait while our AI system analyzes your document...
          </div>
        )}

        {/* Results */}
        {verificationResult && (
          <div style={successAlertStyle}>
            <h3>✅ Verification Complete!</h3>
            <p><strong>📊 Status:</strong> {verificationResult.overall_status}</p>
            <p><strong>⏰ Timestamp:</strong> {new Date(verificationResult.timestamp).toLocaleString()}</p>
            <p><strong>💬 Message:</strong> Document has been successfully processed by AI</p>
          </div>
        )}
      </div>

      {/* Features Card */}
      <div style={cardStyle}>
        <h2 style={subHeaderStyle}>🔍 AI Verification Features</h2>
        <ul style={{ lineHeight: '1.6' }}>
          <li>📄 <strong>Document Analysis</strong> - Extract and validate document information</li>
          <li>👤 <strong>Face Verification</strong> - Match face with document photo</li>
          <li>🔒 <strong>Liveness Detection</strong> - Prevent spoofing attacks</li>
          <li>📈 <strong>Confidence Scoring</strong> - Reliability assessment</li>
        </ul>
      </div>

      {/* Instructions Card */}
      <div style={cardStyle}>
        <h2 style={subHeaderStyle}>📋 How to Use:</h2>
        <ol style={{ lineHeight: '1.6' }}>
          <li>Select a document (ID card, passport, or driver license)</li>
          <li>Click "Start AI Verification"</li>
          <li>Wait for AI processing to complete</li>
          <li>View verification results</li>
        </ol>
      </div>
    </div>
  );
};

export default AutoKYCSimple;
