import React, { useEffect, useState } from "react";
import api from "../api";

export default function UserKyc({ username, onLogout }) {
  const [kycData, setKycData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [info, setInfo] = useState("");

  useEffect(() => {
    loadKycStatus();
  }, []);

  const loadKycStatus = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/kyc/status?username=${username}`);
      setKycData(res.data);
      setInfo("KYC status loaded successfully");
    } catch (error) {
      setInfo("Error loading KYC status");
      console.error("Error loading KYC:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "APPROVED":
        return "#28a745";
      case "REJECTED":
        return "#dc3545";
      case "PENDING":
        return "#ffc107";
      case "SUBMITTED":
        return "#17a2b8";
      default:
        return "#6c757d";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "APPROVED":
        return "✅ Approved - You can now use all banking services";
      case "REJECTED":
        return "❌ Rejected - Please contact support";
      case "PENDING":
        return "⏳ Pending - Please complete KYC submission";
      case "SUBMITTED":
        return "📋 Submitted - Waiting for admin approval";
      default:
        return "❓ Unknown Status";
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <div>Loading KYC status...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
        <h2>My KYC Status</h2>
        <button
          onClick={onLogout}
          style={{
            padding: "8px 16px",
            backgroundColor: "#dc3545",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          Logout
        </button>
      </div>

      {info && (
        <div style={{
          padding: "10px",
          marginBottom: "20px",
          backgroundColor: "#d4edda",
          border: "1px solid #c3e6cb",
          borderRadius: "4px",
          color: "#155724"
        }}>
          {info}
        </div>
      )}

      {kycData ? (
        <div style={{
          backgroundColor: "white",
          padding: "30px",
          borderRadius: "8px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
        }}>
          {/* KYC Status Header */}
          <div style={{
            textAlign: "center",
            padding: "20px",
            marginBottom: "30px",
            backgroundColor: "#f8f9fa",
            borderRadius: "6px",
            border: `2px solid ${getStatusColor(kycData.status)}`
          }}>
            <h3 style={{ color: getStatusColor(kycData.status), margin: "0 0 10px 0" }}>
              KYC Status: {kycData.status}
            </h3>
            <p style={{ margin: "0", fontSize: "16px" }}>
              {getStatusText(kycData.status)}
            </p>
          </div>

          {/* Personal Information */}
          <div style={{ marginBottom: "30px" }}>
            <h4 style={{ color: "#495057", borderBottom: "2px solid #007bff", paddingBottom: "5px" }}>
              Personal Information
            </h4>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
              <div>
                <strong>Username:</strong> {kycData.username || username}
              </div>
              <div>
                <strong>Email:</strong> {kycData.email || "Not provided"}
              </div>
              <div>
                <strong>Phone:</strong> {kycData.phoneNumber || "Not provided"}
              </div>
              <div>
                <strong>Address:</strong> {kycData.address || "Not provided"}
              </div>
            </div>
          </div>

          {/* KYC Documents */}
          <div style={{ marginBottom: "30px" }}>
            <h4 style={{ color: "#495057", borderBottom: "2px solid #007bff", paddingBottom: "5px" }}>
              KYC Documents
            </h4>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
              <div>
                <strong>Aadhaar Number:</strong> {kycData.aadhaarNumber || "Not provided"}
              </div>
              <div>
                <strong>PAN Number:</strong> {kycData.panNumber || "Not provided"}
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div style={{ marginBottom: "30px" }}>
            <h4 style={{ color: "#495057", borderBottom: "2px solid #007bff", paddingBottom: "5px" }}>
              KYC Timeline
            </h4>
            <div style={{ display: "grid", gap: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "10px", backgroundColor: "#f8f9fa", borderRadius: "4px" }}>
                <span><strong>Submission Date:</strong></span>
                <span>{kycData.submissionDate || "Not submitted"}</span>
              </div>
              {kycData.reviewedDate && (
                <div style={{ display: "flex", justifyContent: "space-between", padding: "10px", backgroundColor: "#f8f9fa", borderRadius: "4px" }}>
                  <span><strong>Reviewed Date:</strong></span>
                  <span>{kycData.reviewedDate}</span>
                </div>
              )}
              {kycData.reviewedBy && (
                <div style={{ display: "flex", justifyContent: "space-between", padding: "10px", backgroundColor: "#f8f9fa", borderRadius: "4px" }}>
                  <span><strong>Reviewed By:</strong></span>
                  <span>{kycData.reviewedBy}</span>
                </div>
              )}
            </div>
          </div>

          {/* Additional Information */}
          {kycData.rejectionReason && (
            <div style={{ marginBottom: "30px" }}>
              <h4 style={{ color: "#dc3545", borderBottom: "2px solid #dc3545", paddingBottom: "5px" }}>
                Rejection Details
              </h4>
              <div style={{ padding: "15px", backgroundColor: "#f8d7da", borderRadius: "4px", color: "#721c24" }}>
                <strong>Reason:</strong> {kycData.rejectionReason}
              </div>
            </div>
          )}

          {kycData.reviewComments && (
            <div style={{ marginBottom: "30px" }}>
              <h4 style={{ color: "#495057", borderBottom: "2px solid #007bff", paddingBottom: "5px" }}>
                Review Comments
              </h4>
              <div style={{ padding: "15px", backgroundColor: "#e2e3e5", borderRadius: "4px" }}>
                {kycData.reviewComments}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ textAlign: "center", marginTop: "30px" }}>
            <button
              onClick={loadKycStatus}
              style={{
                padding: "10px 20px",
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                marginRight: "10px"
              }}
            >
              Refresh Status
            </button>
            
            {kycData.status === "PENDING" && (
              <button
                onClick={() => window.location.href = "#kyc-form"}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#28a745",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer"
                }}
              >
                Complete KYC Submission
              </button>
            )}
          </div>
        </div>
      ) : (
        <div style={{
          textAlign: "center",
          padding: "40px",
          backgroundColor: "#f8f9fa",
          borderRadius: "8px"
        }}>
          <h3>No KYC Data Found</h3>
          <p>You haven't submitted your KYC yet.</p>
          <button
            onClick={() => window.location.href = "#kyc-form"}
            style={{
              padding: "12px 24px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            Submit KYC Now
          </button>
        </div>
      )}
    </div>
  );
}
