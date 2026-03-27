import React, { useState, useEffect } from "react";
import Register from "./components/RegisterPage3D";
import Login from "./components/LoginPage3D";
import KycFormEnhanced from "./components/KycFormEnhanced";
import DashboardEnhanced from "./components/DashboardEnhanced";
import AdminKycPanel from "./components/AdminKycPanel";
import UserKyc from "./components/UserKyc";
import DatabaseViewer from "./components/DatabaseViewer";
import HomePage3D from "./components/HomePage3D";
import UserHomePage from "./components/UserHomePage";
import DocumentUpload from "./components/DocumentUpload";
import DocumentVerification from "./components/DocumentVerification";
import api from "./api";
import "./App3D.css";

function App() {
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("USER");
  const [loggedIn, setLoggedIn] = useState(false);
  const [kycStatus, setKycStatus] = useState("PENDING");
  const [documentStatus, setDocumentStatus] = useState("NOT_UPLOADED"); // NOT_UPLOADED, PENDING, VERIFIED
  const [showDbViewer, setShowDbViewer] = useState(false);
  const [showHomePage, setShowHomePage] = useState(true);
  const [showDocumentUpload, setShowDocumentUpload] = useState(false);

  // Check document status when user logs in
  const checkDocumentStatus = async (user) => {
    try {
      const response = await api.get(`/documents/user/${user}`);
      const documents = response.data;
      
      if (documents.length === 0) {
        setDocumentStatus("NOT_UPLOADED");
        return false;
      }
      
      const allVerified = documents.every(doc => doc.uploadStatus === "VERIFIED");
      const anyPending = documents.some(doc => doc.uploadStatus === "UPLOADED");
      
      if (allVerified && documents.length >= 2) { // Aadhaar + PAN
        setDocumentStatus("VERIFIED");
        return true;
      } else if (anyPending) {
        setDocumentStatus("PENDING");
        return false;
      } else {
        setDocumentStatus("NOT_UPLOADED");
        return false;
      }
    } catch (error) {
      console.error("Error checking document status:", error);
      setDocumentStatus("NOT_UPLOADED");
      return false;
    }
  };

  const handleLoginSuccess = async (user, userRole, kycStatus) => {
    setUsername(user);
    setRole(userRole || "USER");
    setKycStatus(kycStatus || "PENDING");
    setLoggedIn(true);
    setShowHomePage(false);
    
    // Check document status after login
    if (userRole !== "ADMIN") {
      const docsVerified = await checkDocumentStatus(user);
      if (!docsVerified && kycStatus === "APPROVED") {
        setShowDocumentUpload(true);
      } else if (docsVerified) {
        setDocumentStatus("VERIFIED");
        setShowDocumentUpload(false);
      }
    }
  };

  const handleKycSubmit = (user, userRole) => {
    setUsername(user);
    setRole(userRole || "USER");
    setKycStatus("SUBMITTED");
    setLoggedIn(true);
    setShowHomePage(false);
  };

  const handleKycApproved = () => {
    setKycStatus("APPROVED");
  };

  const handleDocumentsUploaded = async () => {
    const docsVerified = await checkDocumentStatus(username);
    if (docsVerified) {
      setShowDocumentUpload(false);
      setDocumentStatus("VERIFIED");
    } else {
      setDocumentStatus("PENDING");
    }
  };

  const handleLogout = () => {
    setLoggedIn(false);
    setShowHomePage(true);
    setShowDocumentUpload(false);
    setUsername("");
    setRole("USER");
    setKycStatus("PENDING");
    setDocumentStatus("NOT_UPLOADED");
    setShowDbViewer(false);
  };

  // Show 3D Homepage
  if (showHomePage) {
    return <HomePage3D onShowLogin={() => setShowHomePage(false)} />;
  }

  // User KYC Status View - For regular users to check their KYC
  if (loggedIn && role === "USER" && (kycStatus === "PENDING" || kycStatus === "SUBMITTED" || kycStatus === "REJECTED")) {
    return <UserKyc username={username} onLogout={handleLogout} />;
  }

  // Admin Panel
  if (loggedIn && role === "ADMIN") {
    if (showDbViewer) {
      return <DatabaseViewer username={username} onLogout={handleLogout} />;
    }
    
    return (
      <div>
        <div style={{ padding: "10px", background: "#f8f9fa", borderBottom: "1px solid #ddd" }}>
          <button onClick={() => setShowDbViewer(!showDbViewer)} className="admin-toggle-btn">
            {showDbViewer ? "📋 KYC Panel" : "🗄️ Database Viewer"}
          </button>
        </div>
        <AdminKycPanel username={username} onLogout={handleLogout} />
      </div>
    );
  }

  // Show Document Upload if KYC approved but documents not verified
  if (loggedIn && role === "USER" && kycStatus === "APPROVED" && (documentStatus === "NOT_UPLOADED" || documentStatus === "PENDING")) {
    return <UserHomePage 
      username={username} 
      onLogout={handleLogout}
      onDocumentsUploaded={handleDocumentsUploaded}
    />;
  }

  // Regular User Dashboard - Only if KYC is approved AND documents verified
  if (loggedIn && role === "USER" && kycStatus === "APPROVED" && documentStatus === "VERIFIED") {
    return (
      <div>
        <DashboardEnhanced username={username} onLogout={handleLogout} documentVerified={true} />
      </div>
    );
  }

  // Default: Show Login/Register options
  return (
    <div className="auth-3d-container">
      <div className="auth-3d-wrapper">
        <Login onSuccess={handleLoginSuccess} />
        <Register />
      </div>
    </div>
  );
}

export default App;
