import React, { useState, useEffect } from 'react';
import './UserHomePage.css';
import api from '../api';
import DocumentUpload from './DocumentUpload';

export default function UserHomePage({ username, onLogout, onDocumentsUploaded }) {
  const [documentStatus, setDocumentStatus] = useState('NOT_UPLOADED');
  const [showDocumentUpload, setShowDocumentUpload] = useState(false);
  const [showAIVerification, setShowAIVerification] = useState(false);
  const [loading, setLoading] = useState(true);
  const [aiProcessing, setAiProcessing] = useState(false);
  const [aiResults, setAiResults] = useState(null);
  const [selectedAIFile, setSelectedAIFile] = useState(null);

  useEffect(() => {
    checkDocumentStatus();
  }, [username]);

  const checkDocumentStatus = async () => {
    try {
      const response = await api.get(`/documents/user/${username}`);
      const documents = response.data;
      
      if (documents.length === 0) {
        setDocumentStatus('NOT_UPLOADED');
      } else {
        const allVerified = documents.every(doc => doc.uploadStatus === 'VERIFIED');
        const anyPending = documents.some(doc => doc.uploadStatus === 'UPLOADED');
        
        if (allVerified && documents.length >= 2) {
          setDocumentStatus('VERIFIED');
          onDocumentsUploaded();
        } else if (anyPending) {
          setDocumentStatus('PENDING');
        } else {
          setDocumentStatus('NOT_UPLOADED');
        }
      }
    } catch (error) {
      console.error('Error checking document status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentUpload = () => {
    setShowDocumentUpload(true);
  };

  const handleAIVerification = () => {
    setShowAIVerification(true);
  };

  const handleAIFileSelect = (event) => {
    const file = event.target.files[0];
    setSelectedAIFile(file);
    setAiResults(null);
  };

  const processWithAI = async () => {
    if (!selectedAIFile) {
      alert('Please select a file first');
      return;
    }

    setAiProcessing(true);
    setAiResults(null);

    try {
      // Create form data for file upload
      const formData = new FormData();
      formData.append('file', selectedAIFile);
      formData.append('username', username);

      // Call Java backend AI verification endpoint
      const response = await api.post('/documents/ai-verify', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        setAiResults(response.data.aiAnalysis);
        
        // Refresh document status since it was automatically updated
        await checkDocumentStatus();
        
        // Show success message
        if (response.data.aiAnalysis && response.data.aiAnalysis.confidence > 0.8) {
          // Auto-verified successfully
          setTimeout(() => {
            alert('🎉 Your documents have been automatically verified by AI!');
          }, 1000);
        }
      } else {
        setAiResults({ error: response.data.message });
      }
    } catch (error) {
      setAiResults({ error: 'AI processing failed: ' + (error.response?.data?.message || error.message) });
    } finally {
      setAiProcessing(false);
    }
  };

  const handleBackToHome = () => {
    setShowDocumentUpload(false);
    setShowAIVerification(false);
    checkDocumentStatus();
  };

  if (loading) {
    return (
      <div className="user-homepage">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (showAIVerification) {
    return (
      <div className="ai-verification-page">
        <div className="verification-header">
          <button onClick={handleBackToHome} className="back-btn">
            ← Back to Dashboard
          </button>
          <h1>🤖 AI Document Verification</h1>
          <p>Upload your document for instant AI-powered verification</p>
        </div>
        
        <div className="ai-verification-container">
          <div className="upload-section">
            <h2>📤 Upload Document for AI Analysis</h2>
            <div className="file-upload-area">
              <input
                type="file"
                id="ai-file-input"
                accept="image/*,.pdf"
                onChange={handleAIFileSelect}
                style={{ display: 'none' }}
              />
              <label htmlFor="ai-file-input" className="file-upload-label">
                <div className="upload-icon">📄</div>
                <p>Click to upload or drag and drop</p>
                <p className="upload-hint">Supports: Images (JPG, PNG) and PDF files</p>
              </label>
            </div>
            
            {selectedAIFile && (
              <div className="selected-file">
                <p><strong>Selected File:</strong> {selectedAIFile.name}</p>
                <p><strong>Size:</strong> {(selectedAIFile.size / 1024).toFixed(2)} KB</p>
              </div>
            )}
            
            <button 
              onClick={processWithAI} 
              className="ai-process-btn"
              disabled={!selectedAIFile || aiProcessing}
            >
              {aiProcessing ? '🔄 Processing with AI...' : '🤖 Start AI Verification'}
            </button>
          </div>
          
          {aiResults && (
            <div className="ai-results-section">
              <h2>🔍 AI Analysis Results</h2>
              {aiResults.error ? (
                <div className="error-result">
                  <p><strong>❌ Error:</strong> {aiResults.error}</p>
                </div>
              ) : (
                <div className="success-result">
                  <div className="result-header">
                    <h3>✅ Document Successfully Analyzed</h3>
                    <div className="confidence-score">
                      <strong>Confidence:</strong> 
                      <span className={`confidence ${aiResults.confidence > 0.8 ? 'high' : 'medium'}`}>
                        {(aiResults.confidence || 0.9) * 100}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="result-details">
                    <p><strong>Document Type:</strong> {aiResults.document_type || 'ID Document'}</p>
                    <p><strong>Processing Time:</strong> {aiResults.processing_time || '2.3'} seconds</p>
                    {aiResults.extracted_data && (
                      <div className="extracted-data">
                        <h4>📋 Extracted Information:</h4>
                        <pre>{JSON.stringify(aiResults.extracted_data, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                  
                  {aiResults.confidence > 0.8 && (
                    <div className="auto-verified">
                      <p><strong>🎉 Auto-Verified:</strong> Your documents have been automatically verified and updated in the system!</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (showDocumentUpload) {
    return (
      <div className="document-upload-page">
        <div className="upload-header">
          <button onClick={handleBackToHome} className="back-btn">
            ← Back to Dashboard
          </button>
          <h1>📋 Upload Your Documents</h1>
          <p>Please upload your Aadhaar Card and PAN Card for verification</p>
        </div>
        <DocumentUpload username={username} />
      </div>
    );
  }

  return (
    <div className="user-homepage">
      {/* Header */}
      <div className="homepage-header">
        <div className="header-content">
          <h1>🏦 Welcome to Secure Bank</h1>
          <p>Hello, <strong>{username}</strong>! Complete your document verification to access banking services.</p>
        </div>
        <button onClick={onLogout} className="logout-btn">
          Logout
        </button>
      </div>

      {/* Action Buttons */}
      <div className="action-section">
        {documentStatus === 'NOT_UPLOADED' && (
          <div className="action-buttons">
            <button onClick={handleDocumentUpload} className="action-btn primary">
              📤 Upload Documents
            </button>
            <button onClick={handleAIVerification} className="action-btn secondary">
              🤖 AI Verification
            </button>
          </div>
        )}
        
        {documentStatus === 'PENDING' && (
          <div className="pending-actions">
            <div className="pending-message">
              <div className="pending-icon">⏳</div>
              <h3>Verification in Progress</h3>
              <p>Your documents are being reviewed. This usually takes 1-2 business days.</p>
            </div>
            <div className="action-buttons">
              <button onClick={handleAIVerification} className="action-btn secondary">
                🤖 Try AI Verification (Instant)
              </button>
            </div>
          </div>
        )}
        
        {documentStatus === 'VERIFIED' && (
          <div className="success-message">
            <div className="success-icon">✅</div>
            <h3>All Set!</h3>
            <p>Your account is fully verified. You can now access all banking services.</p>
            <button className="action-btn success" onClick={onDocumentsUploaded}>
              Go to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
