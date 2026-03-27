import React, { useState, useEffect } from 'react';
import './DocumentUpload.css';
import api from '../api';

export default function DocumentUpload({ username, onDocumentsUploaded }) {
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedFiles, setSelectedFiles] = useState({
    aadhaar: null,
    pan: null
  });
  const [viewingDocument, setViewingDocument] = useState(null);

  useEffect(() => {
    if (username) {
      loadDocuments();
    }
  }, [username]);

  const loadDocuments = async () => {
    try {
      const response = await api.get(`/documents/user/${username}`);
      setDocuments(response.data);
    } catch (error) {
      console.error('Error loading documents:', error);
    }
  };

  const handleFileSelect = (documentType, file) => {
    setSelectedFiles(prev => ({
      ...prev,
      [documentType]: file
    }));
    setMessage('');
  };

  const handleUpload = async (documentType) => {
    const file = selectedFiles[documentType];
    if (!file) {
      setMessage(`Please select a ${documentType} document`);
      return;
    }

    setUploading(true);
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('username', username);
      formData.append('documentType', documentType);

      const response = await api.post('/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        setMessage(`${documentType} document uploaded successfully!`);
        setSelectedFiles(prev => ({ ...prev, [documentType]: null }));
        loadDocuments();
        
        // Notify parent that documents were uploaded
        if (onDocumentsUploaded) {
          onDocumentsUploaded();
        }
      } else {
        setMessage(response.data.message);
      }
    } catch (error) {
      setMessage(`Upload failed: ${error.response?.data?.message || error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (documentId) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        await api.delete(`/documents/${documentId}`);
        await loadDocuments();
        setMessage('Document deleted successfully');
        setTimeout(() => setMessage(''), 3000);
      } catch (error) {
        setMessage('Error deleting document');
        console.error('Error deleting document:', error);
      }
    }
  };

  const handleViewDocument = async (documentId) => {
    try {
      const response = await api.get(`/documents/view/${documentId}`, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      
      // Get document info
      const document = documents.find(doc => doc.id === documentId);
      const fileName = document?.fileName || 'document';
      const isPdf = fileName.toLowerCase().endsWith('.pdf');
      
      setViewingDocument({
        url: url,
        fileName: fileName,
        isPdf: isPdf
      });
    } catch (error) {
      setMessage('Error viewing document');
      console.error('Error viewing document:', error);
    }
  };

  const getDocumentStatus = (documentType) => {
    const doc = documents.find(d => d.documentType === documentType.toUpperCase());
    if (!doc) return 'NOT_UPLOADED';
    return doc.uploadStatus;
  };

  const getDocumentById = (documentType) => {
    return documents.find(d => d.documentType === documentType.toUpperCase());
  };

  return (
    <div className="document-upload">
      <h2 className="section-title">📋 Document Verification</h2>
      <p className="section-subtitle">
        Upload your Aadhaar Card and PAN Card for KYC verification
      </p>

      {message && (
        <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      <div className="documents-grid">
        {/* Aadhaar Card Upload */}
        <div className="document-card">
          <div className="document-header">
            <span className="document-icon">🆔</span>
            <h3>Aadhaar Card</h3>
            <span className={`status-badge ${getDocumentStatus('aadhaar').toLowerCase()}`}>
              {getDocumentStatus('aadhaar').replace('_', ' ')}
            </span>
          </div>
          
          {getDocumentStatus('aadhaar') === 'NOT_UPLOADED' ? (
            <div className="upload-section">
              <input
                type="file"
                id="aadhaar-file"
                accept="image/*,.pdf"
                onChange={(e) => handleFileSelect('aadhaar', e.target.files[0])}
                style={{ display: 'none' }}
              />
              <label htmlFor="aadhaar-file" className="file-input-label">
                <div className="file-input-content">
                  <span className="upload-icon">📤</span>
                  <span className="upload-text">
                    {selectedFiles.aadhaar ? selectedFiles.aadhaar.name : 'Choose Aadhaar Card'}
                  </span>
                </div>
              </label>
              <button
                className="upload-btn"
                onClick={() => handleUpload('aadhaar')}
                disabled={!selectedFiles.aadhaar || uploading}
              >
                {uploading ? 'Uploading...' : 'Upload Aadhaar'}
              </button>
            </div>
          ) : (
            <div className="uploaded-section">
              <div className="document-info">
                <p><strong>File:</strong> {getDocumentById('aadhaar')?.fileName}</p>
                <p><strong>Size:</strong> {Math.round((getDocumentById('aadhaar')?.fileSize || 0) / 1024)} KB</p>
                <p><strong>Uploaded:</strong> {new Date(getDocumentById('aadhaar')?.uploadTime).toLocaleDateString()}</p>
                {getDocumentById('aadhaar')?.verificationComments && (
                  <p><strong>Comments:</strong> {getDocumentById('aadhaar').verificationComments}</p>
                )}
              </div>
              <div className="document-actions">
                <button
                  className="view-btn"
                  onClick={() => handleViewDocument(getDocumentById('aadhaar')?.id)}
                >
                  👁️ View
                </button>
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(getDocumentById('aadhaar')?.id)}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          )}
        </div>

        {/* PAN Card Upload */}
        <div className="document-card">
          <div className="document-header">
            <span className="document-icon">📋</span>
            <h3>PAN Card</h3>
            <span className={`status-badge ${getDocumentStatus('pan').toLowerCase()}`}>
              {getDocumentStatus('pan').replace('_', ' ')}
            </span>
          </div>
          
          {getDocumentStatus('pan') === 'NOT_UPLOADED' ? (
            <div className="upload-section">
              <input
                type="file"
                id="pan-file"
                accept="image/*,.pdf"
                onChange={(e) => handleFileSelect('pan', e.target.files[0])}
                style={{ display: 'none' }}
              />
              <label htmlFor="pan-file" className="file-input-label">
                <div className="file-input-content">
                  <span className="upload-icon">📤</span>
                  <span className="upload-text">
                    {selectedFiles.pan ? selectedFiles.pan.name : 'Choose PAN Card'}
                  </span>
                </div>
              </label>
              <button
                className="upload-btn"
                onClick={() => handleUpload('pan')}
                disabled={!selectedFiles.pan || uploading}
              >
                {uploading ? 'Uploading...' : 'Upload PAN'}
              </button>
            </div>
          ) : (
            <div className="uploaded-section">
              <div className="document-info">
                <p><strong>File:</strong> {getDocumentById('pan')?.fileName}</p>
                <p><strong>Size:</strong> {Math.round((getDocumentById('pan')?.fileSize || 0) / 1024)} KB</p>
                <p><strong>Uploaded:</strong> {new Date(getDocumentById('pan')?.uploadTime).toLocaleDateString()}</p>
                {getDocumentById('pan')?.verificationComments && (
                  <p><strong>Comments:</strong> {getDocumentById('pan').verificationComments}</p>
                )}
              </div>
              <div className="document-actions">
                <button
                  className="view-btn"
                  onClick={() => handleViewDocument(getDocumentById('pan')?.id)}
                >
                  👁️ View
                </button>
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(getDocumentById('pan')?.id)}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="upload-guidelines">
        <h4>📝 Upload Guidelines:</h4>
        <ul>
          <li>Accepted formats: JPG, PNG, PDF</li>
          <li>Maximum file size: 5MB</li>
          <li>Documents must be clear and readable</li>
          <li>Make sure all details are visible</li>
        </ul>
      </div>

      {/* Document Viewer Modal */}
      {viewingDocument && (
        <div className="document-viewer-overlay" onClick={() => {
          setViewingDocument(null);
          window.URL.revokeObjectURL(viewingDocument.url);
        }}>
          <div className="document-viewer-modal" onClick={(e) => e.stopPropagation()}>
            <div className="document-viewer-header">
              <h3>{viewingDocument.fileName}</h3>
              <button 
                className="close-viewer-btn"
                onClick={() => {
                  setViewingDocument(null);
                  window.URL.revokeObjectURL(viewingDocument.url);
                }}
              >
                ✕
              </button>
            </div>
            <div className="document-viewer-content">
              {viewingDocument.isPdf ? (
                <iframe
                  src={viewingDocument.url}
                  style={{ width: '100%', height: '500px', border: 'none' }}
                  title={viewingDocument.fileName}
                />
              ) : (
                <img
                  src={viewingDocument.url}
                  alt={viewingDocument.fileName}
                  style={{ maxWidth: '100%', maxHeight: '500px' }}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
