import React, { useEffect, useState } from "react";
import api from "../api";
import "./DatabaseViewer.css";

export default function DatabaseViewer({ username, onLogout }) {
  const [activeTab, setActiveTab] = useState("users");
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [viewingDocument, setViewingDocument] = useState(null);
  const [verificationModal, setVerificationModal] = useState(null);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      let endpoint = "";
      switch (activeTab) {
        case "users":
          endpoint = "/admin/users";
          break;
        case "kyc":
          endpoint = "/admin/kyc";
          break;
        case "documents":
          endpoint = "/documents/all";
          break;
        case "checkbooks":
          endpoint = "/admin/checkbook-requests";
          break;
        case "loans":
          endpoint = "/admin/loans";
          break;
        case "transactions":
          endpoint = "/transactions";
          break;
        default:
          endpoint = "/admin/users";
      }

      const response = await api.get(endpoint, {
        params: activeTab === "loans" || activeTab === "transactions" ? { username: "john_doe" } : {}
      });
      
      setData(response.data);
    } catch (err) {
      console.error(`Error loading ${activeTab}:`, err);
      setError(`Error loading ${activeTab}: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const renderUsers = () => (
    <div className="table-container">
      <h3>👥 All Users</h3>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(data) && data.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.username}</td>
              <td>
                <span className={`role-badge ${user.role ? user.role.toLowerCase() : 'user'}`}>
                  {user.role || 'USER'}
                </span>
              </td>
              <td>
                <button onClick={() => handleViewUserDetails(user)}>
                  👤 View Details
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderKyc = () => (
    <div className="table-container">
      <h3>📋 KYC Applications</h3>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>User</th>
            <th>Aadhaar</th>
            <th>PAN</th>
            <th>Address</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(data) && data.map((kyc) => (
            <tr key={kyc.id}>
              <td>{kyc.id}</td>
              <td>{kyc.username || 'N/A'}</td>
              <td>{kyc.aadhaarNumber}</td>
              <td>{kyc.panNumber}</td>
              <td>{kyc.address}</td>
              <td>
                <span className={`status-badge ${kyc.status ? kyc.status.toLowerCase() : 'pending'}`}>
                  {kyc.status || 'PENDING'}
                </span>
              </td>
              <td>
                <button onClick={() => handleViewUserDetails(kyc)}>
                  👤 View Details
                </button>
                {kyc.status === "PENDING" && (
                  <>
                    <button onClick={() => handleKycAction(kyc.id, "approve")}>
                      ✅ Approve
                    </button>
                    <button onClick={() => handleKycAction(kyc.id, "reject")}>
                      ❌ Reject
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderTransactions = () => (
    <div className="table-container">
      <h3>💳 Transactions</h3>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Timestamp</th>
            <th>Type</th>
            <th>Amount</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(data) && data.length > 0 ? (
            data.map((transaction) => (
              <tr key={transaction.id}>
                <td>{transaction.id}</td>
                <td>{transaction.timestamp}</td>
                <td>
                  <span className={`type-badge ${transaction.type ? transaction.type.toLowerCase() : 'credit'}`}>
                    {transaction.type || 'CREDIT'}
                  </span>
                </td>
                <td>₹{transaction.amount}</td>
                <td>{transaction.description}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>
                No transactions found for this user
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  const renderLoans = () => (
    <div className="table-container">
      <h3>💰 Loans</h3>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Principal</th>
            <th>Interest Rate</th>
            <th>Tenure</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(data) && data.map((loan) => (
            <tr key={loan.id}>
              <td>{loan.id}</td>
              <td>₹{loan.principal}</td>
              <td>{loan.interestRate}%</td>
              <td>{loan.tenureMonths} months</td>
              <td>
                <span className={`status-badge ${loan.status ? loan.status.toLowerCase() : 'pending'}`}>
                  {loan.status || 'PENDING'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderCheckbooks = () => (
    <div className="table-container">
      <h3>📬 Checkbook Requests</h3>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Account Number</th>
            <th>Request Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(data) && data.map((checkbook) => (
            <tr key={checkbook.id}>
              <td>{checkbook.id}</td>
              <td>{checkbook.accountNumber || "N/A"}</td>
              <td>{checkbook.requestDate}</td>
              <td>
                <span className={`status-badge ${checkbook.status?.toLowerCase()}`}>
                  {checkbook.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const handleViewUserDetails = async (user) => {
    try {
      // Get detailed user information including KYC data
      const response = await api.get(`/admin/kyc/${user.id}`);
      setSelectedUser(response.data);
      setShowUserDetails(true);
    } catch (err) {
      setError(`Failed to load user details: ${err.message}`);
    }
  };

  const closeUserDetails = () => {
    setShowUserDetails(false);
    setSelectedUser(null);
  };

  const handleKycAction = async (id, action) => {
    try {
      const reviewData = {
        reviewedBy: username,
        comments: `${action}d by admin`,
        reason: action === "reject" ? "Rejected by admin" : ""
      };
      
      await api.post(`/admin/kyc/${id}/${action}`, reviewData);
      loadData();
    } catch (err) {
      setError(`Failed to ${action} KYC: ${err.message}`);
    }
  };

  const handleViewDocument = async (documentId) => {
    try {
      const response = await api.get(`/documents/view/${documentId}`, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      
      const document = data.find(doc => doc.id === documentId);
      const fileName = document?.fileName || 'document';
      const isPdf = fileName.toLowerCase().endsWith('.pdf');
      
      setViewingDocument({
        url: url,
        fileName: fileName,
        isPdf: isPdf
      });
    } catch (error) {
      setError('Error viewing document');
      console.error('Error viewing document:', error);
    }
  };

  const handleVerifyDocument = (document) => {
    setVerificationModal({
      documentId: document.id,
      currentStatus: document.uploadStatus,
      fileName: document.fileName,
      username: document.username,
      documentType: document.documentType
    });
  };

  const submitVerification = async (status, comments) => {
    try {
      await api.post(`/documents/verify/${verificationModal.documentId}`, {
        status: status,
        comments: comments
      });
      
      setVerificationModal(null);
      loadData();
    } catch (error) {
      setError(`Failed to verify document: ${error.message}`);
    }
  };

  const renderDocuments = () => (
    <div className="table-container">
      <h3>📄 Document Verification</h3>
      <table>
        <thead>
          <tr>
            <th>Username</th>
            <th>Document Type</th>
            <th>File Name</th>
            <th>Upload Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data && data.map((doc) => (
            <tr key={doc.id}>
              <td>{doc.username}</td>
              <td>
                <span className={`doc-type-badge ${doc.documentType ? doc.documentType.toLowerCase() : ''}`}>
                  {doc.documentType === 'AADHAAR' ? '🆔' : '📋'} {doc.documentType || 'Unknown'}
                </span>
              </td>
              <td>{doc.fileName}</td>
              <td>{new Date(doc.uploadTime).toLocaleDateString()}</td>
              <td>
                <span className={`status-badge ${doc.uploadStatus ? doc.uploadStatus.toLowerCase() : ''}`}>
                  {doc.uploadStatus ? doc.uploadStatus.replace('_', ' ') : 'Unknown'}
                </span>
              </td>
              <td>
                <div className="action-buttons">
                  <button
                    className="view-btn"
                    onClick={() => handleViewDocument(doc.id)}
                    title="View Document"
                  >
                    👁️
                  </button>
                  {doc.uploadStatus === 'UPLOADED' && (
                    <>
                      <button
                        className="verify-btn"
                        onClick={() => handleVerifyDocument(doc)}
                        title="Verify Document"
                      >
                        ✅
                      </button>
                      <button
                        className="reject-btn"
                        onClick={() => handleVerifyDocument(doc)}
                        title="Reject Document"
                      >
                        ❌
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderContent = () => {
    if (loading) return <div className="loading">Loading {activeTab} data...</div>;
    if (error) return <div className="error">❌ {error}</div>;

    // Check if data is empty or undefined
    if (!data || (Array.isArray(data) && data.length === 0)) {
      if (activeTab === "documents") {
        return (
          <div className="no-documents">
            <h3>📄 No Documents Found</h3>
            <p>No documents have been uploaded yet.</p>
            <p>Please ask users to upload their documents first.</p>
          </div>
        );
      }
      return <div className="error">⚠️ No {activeTab} data available</div>;
    }

    switch (activeTab) {
      case "users":
        return renderUsers();
      case "kyc":
        return renderKyc();
      case "documents":
        return renderDocuments();
      case "transactions":
        return renderTransactions();
      case "loans":
        return renderLoans();
      case "checkbooks":
        return renderCheckbooks();
      default:
        return renderUsers();
    }
  };

  return (
    <div className="database-viewer">
      <header className="top-bar">
        <div>
          <h1>🗄️ Database Viewer</h1>
          <p className="subtitle">Logged in as {username}</p>
        </div>
        <button onClick={onLogout}>Logout</button>
      </header>

      <div className="tabs">
        <button
          className={`tab ${activeTab === "users" ? "active" : ""}`}
          onClick={() => setActiveTab("users")}
        >
          👥 Users
        </button>
        <button
          className={`tab ${activeTab === "kyc" ? "active" : ""}`}
          onClick={() => setActiveTab("kyc")}
        >
          📋 KYC
        </button>
        <button
          className={`tab ${activeTab === "documents" ? "active" : ""}`}
          onClick={() => setActiveTab("documents")}
        >
          📄 Documents
        </button>
        <button
          className={`tab ${activeTab === "transactions" ? "active" : ""}`}
          onClick={() => setActiveTab("transactions")}
        >
          💳 Transactions
        </button>
        <button
          className={`tab ${activeTab === "loans" ? "active" : ""}`}
          onClick={() => setActiveTab("loans")}
        >
          💰 Loans
        </button>
        <button
          className={`tab ${activeTab === "checkbooks" ? "active" : ""}`}
          onClick={() => setActiveTab("checkbooks")}
        >
          📬 Checkbooks
        </button>
      </div>

      <div className="content">
        {renderContent()}
      </div>

      {/* User Details Modal */}
      {showUserDetails && selectedUser && (
        <div className="modal-overlay" onClick={closeUserDetails}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>👤 User Details</h2>
              <button className="close-btn" onClick={closeUserDetails}>✕</button>
            </div>
            <div className="modal-body">
              <div className="user-details-grid">
                <div className="detail-group">
                  <label>User ID:</label>
                  <span>{selectedUser.id}</span>
                </div>
                <div className="detail-group">
                  <label>Username:</label>
                  <span>{selectedUser.username}</span>
                </div>
                <div className="detail-group">
                  <label>Full Name:</label>
                  <span>{selectedUser.fullName || 'Not Set'}</span>
                </div>
                <div className="detail-group">
                  <label>Email:</label>
                  <span>{selectedUser.email || 'Not Provided'}</span>
                </div>
                <div className="detail-group">
                  <label>Phone Number:</label>
                  <span>{selectedUser.phoneNumber || 'Not Provided'}</span>
                </div>
                <div className="detail-group">
                  <label>Aadhaar Number:</label>
                  <span>{selectedUser.aadhaarNumber || 'Not Provided'}</span>
                </div>
                <div className="detail-group">
                  <label>PAN Number:</label>
                  <span>{selectedUser.panNumber || 'Not Provided'}</span>
                </div>
                <div className="detail-group">
                  <label>Address:</label>
                  <span>{selectedUser.address || 'Not Provided'}</span>
                </div>
                <div className="detail-group">
                  <label>KYC Status:</label>
                  <span className={`status-badge ${selectedUser.status ? selectedUser.status.toLowerCase() : 'pending'}`}>
                    {selectedUser.status || 'PENDING'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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

      {/* Document Verification Modal */}
      {verificationModal && (
        <div className="modal-overlay" onClick={() => setVerificationModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📄 Verify Document</h2>
              <button className="close-btn" onClick={() => setVerificationModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="document-summary">
                <h4>Document Information</h4>
                <p><strong>User:</strong> {verificationModal.username}</p>
                <p><strong>Type:</strong> {verificationModal.documentType}</p>
                <p><strong>File:</strong> {verificationModal.fileName}</p>
                <p><strong>Current Status:</strong> {verificationModal.currentStatus}</p>
              </div>
              <div className="verification-form">
                <div className="form-group">
                  <label>Verification Action:</label>
                  <select id="verification-status" className="verification-select">
                    <option value="VERIFIED">✅ Verify</option>
                    <option value="REJECTED">❌ Reject</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Comments:</label>
                  <textarea 
                    id="verification-comments"
                    className="verification-textarea"
                    placeholder="Enter verification comments..."
                    rows="4"
                  ></textarea>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setVerificationModal(null)}>
                Cancel
              </button>
              <button 
                className="submit-btn"
                onClick={() => {
                  const status = document.getElementById('verification-status').value;
                  const comments = document.getElementById('verification-comments').value;
                  submitVerification(status, comments);
                }}
              >
                Submit Verification
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}