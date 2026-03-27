import React, { useState } from "react";
import api from "../api";

export default function KycFormEnhanced({ username, onKycSubmit, onKycApproved, currentStatus }) {
  const [formData, setFormData] = useState({
    fullName: "",
    aadhaarNumber: "",
    panNumber: "",
    address: "",
    phoneNumber: "",
    email: "",
    passportSize: ""
  });
  const [files, setFiles] = useState({
    aadhaarCard: null,
    panCard: null,
    passportPhoto: null,
    addressProof: null
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e, fileType) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setMessage(`${fileType} file size should be less than 5MB`);
        return;
      }
      setFiles({ ...files, [fileType]: file });
      setUploadProgress({ ...uploadProgress, [fileType]: 'Selected' });
    }
  };

  const uploadFile = async (file, fileType) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', fileType);
    formData.append('username', username);

    try {
      setUploadProgress({ ...uploadProgress, [fileType]: 'Uploading...' });
      
      // Simulate file upload (replace with actual upload endpoint)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setUploadProgress({ ...uploadProgress, [fileType]: 'Uploaded' });
      return true;
    } catch (error) {
      setUploadProgress({ ...uploadProgress, [fileType]: 'Failed' });
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      // Upload all files first
      const uploadPromises = [];
      Object.entries(files).forEach(([key, file]) => {
        if (file) {
          uploadPromises.push(uploadFile(file, key));
        }
      });

      await Promise.all(uploadPromises);

      // Submit KYC data
      const payload = {
        ...formData,
        username,
        status: "SUBMITTED"
      };

      const response = await api.post("/kyc/submit", payload);
      
      if (onKycSubmit) {
        onKycSubmit(username, "USER");
      }
      
      setMessage("✅ KYC submitted successfully! Your documents are under review.");
      
      // Clear form
      setFormData({
        fullName: "",
        aadhaarNumber: "",
        panNumber: "",
        address: "",
        phoneNumber: "",
        email: "",
        passportSize: ""
      });
      setFiles({
        aadhaarCard: null,
        panCard: null,
        passportPhoto: null,
        addressProof: null
      });
      
    } catch (error) {
      setMessage(error.response?.data || "Error submitting KYC");
    } finally {
      setLoading(false);
    }
  };

  const checkKycStatus = async () => {
    try {
      const response = await api.get(`/kyc/status?username=${username}`);
      if (response.data.status === "APPROVED" && onKycApproved) {
        onKycApproved();
      }
    } catch (error) {
      console.error("Error checking KYC status:", error);
    }
  };

  // Show success message if KYC is approved
  if (currentStatus === "APPROVED") {
    return (
      <div className="kyc-success-container">
        <div className="success-card">
          <div className="success-icon">✅</div>
          <h2>Account Created Successfully!</h2>
          <p>Your KYC has been approved and your account is now active.</p>
          <p>You can now access all banking features.</p>
          <button onClick={() => onKycApproved()} className="proceed-btn">
            Proceed to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="kyc-container">
      <div className="kyc-header">
        <h1>📋 Know Your Customer (KYC)</h1>
        <p>Please complete your KYC verification to activate your banking account</p>
        {currentStatus === "SUBMITTED" && (
          <div className="status-badge submitted">
            ⏳ KYC Submitted - Under Review
          </div>
        )}
      </div>

      <div className="kyc-form-container">
        <form onSubmit={handleSubmit} className="kyc-form">
          <div className="form-section">
            <h2>👤 Personal Information</h2>
            
            <div className="form-row">
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                  required
                />
              </div>
              <div className="form-group">
                <label>Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email address"
                  required
                />
              </div>
            </div>

            <div className="form-group full-width">
              <label>Residential Address *</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter your complete residential address"
                rows="3"
                required
              />
            </div>
          </div>

          <div className="form-section">
            <h2>🆔 Government Documents</h2>
            
            <div className="form-row">
              <div className="form-group">
                <label>Aadhaar Number *</label>
                <input
                  type="text"
                  name="aadhaarNumber"
                  value={formData.aadhaarNumber}
                  onChange={handleChange}
                  placeholder="Enter 12-digit Aadhaar number"
                  maxLength="12"
                  required
                />
              </div>
              <div className="form-group">
                <label>PAN Number *</label>
                <input
                  type="text"
                  name="panNumber"
                  value={formData.panNumber}
                  onChange={handleChange}
                  placeholder="Enter 10-digit PAN number"
                  maxLength="10"
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2>📸 Document Upload</h2>
            <p className="upload-instructions">
              Please upload clear, scanned copies of your documents. Maximum file size: 5MB
            </p>
            
            <div className="upload-grid">
              <div className="upload-item">
                <label>Aadhaar Card *</label>
                <div className="file-upload">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileChange(e, 'aadhaarCard')}
                    required
                  />
                  <div className="upload-preview">
                    {files.aadhaarCard ? (
                      <div className="file-selected">
                        <span>📄 {files.aadhaarCard.name}</span>
                        <span className="upload-status">{uploadProgress.aadhaarCard}</span>
                      </div>
                    ) : (
                      <div className="upload-placeholder">
                        <span>📤 Click to upload Aadhaar Card</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="upload-item">
                <label>PAN Card *</label>
                <div className="file-upload">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileChange(e, 'panCard')}
                    required
                  />
                  <div className="upload-preview">
                    {files.panCard ? (
                      <div className="file-selected">
                        <span>📄 {files.panCard.name}</span>
                        <span className="upload-status">{uploadProgress.panCard}</span>
                      </div>
                    ) : (
                      <div className="upload-placeholder">
                        <span>📤 Click to upload PAN Card</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="upload-item">
                <label>Passport Size Photo *</label>
                <div className="file-upload">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'passportPhoto')}
                    required
                  />
                  <div className="upload-preview">
                    {files.passportPhoto ? (
                      <div className="file-selected">
                        <span>🖼️ {files.passportPhoto.name}</span>
                        <span className="upload-status">{uploadProgress.passportPhoto}</span>
                      </div>
                    ) : (
                      <div className="upload-placeholder">
                        <span>📤 Click to upload Passport Photo</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="upload-item">
                <label>Address Proof *</label>
                <div className="file-upload">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileChange(e, 'addressProof')}
                    required
                  />
                  <div className="upload-preview">
                    {files.addressProof ? (
                      <div className="file-selected">
                        <span>📄 {files.addressProof.name}</span>
                        <span className="upload-status">{uploadProgress.addressProof}</span>
                      </div>
                    ) : (
                      <div className="upload-placeholder">
                        <span>📤 Click to upload Address Proof</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="submit" 
              className="submit-btn"
              disabled={loading}
            >
              {loading ? "⏳ Submitting..." : "📤 Submit KYC"}
            </button>
            
            {currentStatus === "SUBMITTED" && (
              <button 
                type="button" 
                className="check-status-btn"
                onClick={checkKycStatus}
              >
                🔄 Check Status
              </button>
            )}
          </div>
        </form>
      </div>

      {message && (
        <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      <style jsx>{`
        .kyc-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        .kyc-header {
          text-align: center;
          margin-bottom: 30px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px;
          border-radius: 15px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }

        .kyc-header h1 {
          margin: 0 0 10px 0;
          font-size: 28px;
          font-weight: 600;
        }

        .kyc-header p {
          margin: 0;
          opacity: 0.9;
          font-size: 16px;
        }

        .status-badge {
          display: inline-block;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 600;
          margin-top: 15px;
        }

        .status-badge.submitted {
          background: #fff3cd;
          color: #856404;
          border: 1px solid #ffeaa7;
        }

        .kyc-form-container {
          background: white;
          border-radius: 15px;
          padding: 30px;
          box-shadow: 0 5px 20px rgba(0,0,0,0.1);
        }

        .form-section {
          margin-bottom: 30px;
        }

        .form-section h2 {
          color: #333;
          margin-bottom: 20px;
          font-size: 20px;
          border-bottom: 2px solid #667eea;
          padding-bottom: 10px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-group.full-width {
          grid-column: 1 / -1;
        }

        .form-group label {
          margin-bottom: 8px;
          font-weight: 600;
          color: #555;
        }

        .form-group input,
        .form-group textarea {
          padding: 12px;
          border: 2px solid #e1e8ed;
          border-radius: 8px;
          font-size: 16px;
          transition: all 0.3s ease;
        }

        .form-group input:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .upload-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-top: 20px;
        }

        .upload-item {
          margin-bottom: 20px;
        }

        .upload-item label {
          display: block;
          margin-bottom: 10px;
          font-weight: 600;
          color: #555;
        }

        .file-upload {
          position: relative;
        }

        .file-upload input[type="file"] {
          position: absolute;
          opacity: 0;
          width: 100%;
          height: 100%;
          cursor: pointer;
        }

        .upload-preview {
          border: 2px dashed #ddd;
          border-radius: 8px;
          padding: 20px;
          text-align: center;
          min-height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }

        .upload-preview:hover {
          border-color: #667eea;
          background: #f8f9ff;
        }

        .file-selected {
          color: #28a745;
        }

        .upload-placeholder {
          color: #6c757d;
        }

        .upload-status {
          display: block;
          margin-top: 5px;
          font-size: 12px;
          color: #667eea;
          font-weight: 600;
        }

        .upload-instructions {
          background: #e3f2fd;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 20px;
          border-left: 4px solid #2196f3;
        }

        .form-actions {
          display: flex;
          gap: 15px;
          margin-top: 30px;
        }

        .submit-btn,
        .check-status-btn {
          padding: 15px 30px;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .submit-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          flex: 1;
        }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
        }

        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .check-status-btn {
          background: #6c757d;
          color: white;
        }

        .check-status-btn:hover {
          background: #5a6268;
        }

        .message {
          padding: 15px;
          border-radius: 8px;
          margin-top: 20px;
          text-align: center;
          font-weight: 600;
        }

        .message.success {
          background: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }

        .message.error {
          background: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }

        .kyc-success-container {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .success-card {
          background: white;
          padding: 40px;
          border-radius: 15px;
          text-align: center;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          max-width: 400px;
        }

        .success-icon {
          font-size: 60px;
          margin-bottom: 20px;
        }

        .success-card h2 {
          color: #28a745;
          margin-bottom: 15px;
        }

        .success-card p {
          color: #6c757d;
          margin-bottom: 10px;
        }

        .proceed-btn {
          background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
          color: white;
          border: none;
          padding: 15px 30px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          margin-top: 20px;
          transition: all 0.3s ease;
        }

        .proceed-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(40, 167, 69, 0.4);
        }

        @media (max-width: 768px) {
          .form-row {
            grid-template-columns: 1fr;
          }
          
          .upload-grid {
            grid-template-columns: 1fr;
          }
          
          .form-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}
