import React, { useState, useEffect } from 'react';
import './DocumentVerification.css';
import api from '../api';

export default function DocumentVerification() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [verificationForm, setVerificationForm] = useState({
    status: '',
    comments: ''
  });
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const response = await api.get('/documents/all');
      setDocuments(response.data);
    } catch (err) {
      setError('Failed to load documents: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (documentId) => {
    if (!verificationForm.status) {
      setError('Please select verification status');
      return;
    }

    try {
      const response = await api.post(`/documents/verify/${documentId}`, verificationForm);
      
      if (response.data.success) {
        setShowModal(false);
        setSelectedDocument(null);
        setVerificationForm({ status: '', comments: '' });
        loadDocuments();
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError('Failed to verify document: ' + err.message);
    }
  };

  const openVerificationModal = (document) => {
    setSelectedDocument(document);
    setVerificationForm({
      status: document.uploadStatus.toLowerCase(),
      comments: document.verificationComments || ''
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedDocument(null);
    setVerificationForm({ status: '', comments: '' });
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'uploaded': return '#ffc107';
      case 'verified': return '#28a745';
      case 'rejected': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'uploaded': return '📤';
      case 'verified': return '✅';
      case 'rejected': return '❌';
      default: return '📋';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getFileIcon = (contentType) => {
    if (contentType?.startsWith('image/')) return '🖼️';
    if (contentType === 'application/pdf') return '📄';
    return '📎';
  };

  if (loading) {
    return (
      <div className="document-verification">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading documents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="document-verification">
      <div className="verification-header">
        <h2>📋 Document Verification Center</h2>
        <p>Review and verify user uploaded documents</p>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="documents-grid">
        {documents.map((document) => (
          <div key={document.id} className="document-card">
            <div className="document-header">
              <div className="document-info">
                <h3>{document.documentType}</h3>
                <p className="username">👤 {document.username}</p>
              </div>
              <div className="document-status">
                <span 
                  className="status-badge" 
                  style={{ backgroundColor: getStatusColor(document.uploadStatus) }}
                >
                  {getStatusIcon(document.uploadStatus)} {document.uploadStatus}
                </span>
              </div>
            </div>

            <div className="document-details">
              <div className="detail-row">
                <span className="detail-icon">{getFileIcon(document.contentType)}</span>
                <div className="detail-info">
                  <p className="filename">{document.fileName}</p>
                  <p className="file-meta">
                    {formatFileSize(document.fileSize)} • {formatDate(document.uploadTime)}
                  </p>
                </div>
              </div>

              {document.verificationComments && (
                <div className="comments-section">
                  <p><strong>💬 Comments:</strong> {document.verificationComments}</p>
                </div>
              )}
            </div>

            <div className="document-actions">
              <button
                className="view-btn"
                onClick={() => window.open(`/api/documents/view/${document.id}`, '_blank')}
              >
                👁️ View Document
              </button>
              <button
                className="verify-btn"
                onClick={() => openVerificationModal(document)}
              >
                ✏️ Verify
              </button>
            </div>
          </div>
        ))}
      </div>

      {documents.length === 0 && (
        <div className="no-documents">
          <p>📭 No documents found</p>
        </div>
      )}

      {/* Verification Modal */}
      {showModal && selectedDocument && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>📋 Verify Document</h3>
              <button className="close-btn" onClick={closeModal}>✕</button>
            </div>
            
            <div className="modal-body">
              <div className="document-summary">
                <h4>{selectedDocument.documentType} - {selectedDocument.username}</h4>
                <p>📄 {selectedDocument.fileName}</p>
                <p>📅 Uploaded: {formatDate(selectedDocument.uploadTime)}</p>
              </div>

              <div className="verification-form">
                <div className="form-group">
                  <label>Verification Status:</label>
                  <select
                    value={verificationForm.status}
                    onChange={(e) => setVerificationForm({...verificationForm, status: e.target.value})}
                    className="status-select"
                  >
                    <option value="">Select Status</option>
                    <option value="uploaded">📤 Uploaded</option>
                    <option value="verified">✅ Verified</option>
                    <option value="rejected">❌ Rejected</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Comments:</label>
                  <textarea
                    value={verificationForm.comments}
                    onChange={(e) => setVerificationForm({...verificationForm, comments: e.target.value})}
                    placeholder="Add verification comments..."
                    rows="4"
                    className="comments-textarea"
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="cancel-btn" onClick={closeModal}>
                Cancel
              </button>
              <button 
                className="submit-btn" 
                onClick={() => handleVerify(selectedDocument.id)}
                disabled={!verificationForm.status}
              >
                Update Verification
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
