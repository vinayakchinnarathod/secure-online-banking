import React, { useEffect, useState } from "react";
import api from "../api";

export default function AdminKycPanel({ username, onLogout }) {
  const [kycList, setKycList] = useState([]);
  const [info, setInfo] = useState("");

  useEffect(() => {
    loadKyc();
  }, []);

  const loadKyc = async () => {
    try {
      const res = await api.get("/admin/kyc");
      setKycList(res.data);
    } catch {
      setInfo("Error loading KYC records.");
    }
  };

  const act = async (id, action) => {
    try {
      const reviewData = {
        reviewedBy: username,
        comments: `${action} by admin ${username}`
      };
      
      await api.post(`/admin/kyc/${id}/${action}`, reviewData);
      setInfo(`KYC ${action}d successfully`);
      loadKyc();
    } catch (error) {
      console.error(`Failed to ${action} KYC:`, error);
      setInfo(`Failed to ${action} KYC`);
    }
  };

  return (
    <div className="dashboard">
      <div style={{ padding: "10px", background: "#f8f9fa", borderBottom: "1px solid #ddd", marginBottom: "20px" }}>
        <h2>Admin KYC Management</h2>
        <p>Review and approve user KYC applications</p>
        <button onClick={onLogout} style={{ padding: "8px 16px", backgroundColor: "#dc3545", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
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

      <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 10px rgba(0,0,0,0.1)" }}>
        <h3>Pending KYC Applications</h3>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#007bff", color: "white" }}>
              <th style={{ padding: "12px", textAlign: "left", border: "1px solid #ddd" }}>User ID</th>
              <th style={{ padding: "12px", textAlign: "left", border: "1px solid #ddd" }}>Aadhaar</th>
              <th style={{ padding: "12px", textAlign: "left", border: "1px solid #ddd" }}>PAN</th>
              <th style={{ padding: "12px", textAlign: "left", border: "1px solid #ddd" }}>Address</th>
              <th style={{ padding: "12px", textAlign: "left", border: "1px solid #ddd" }}>Status</th>
              <th style={{ padding: "12px", textAlign: "left", border: "1px solid #ddd" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {kycList.map((k) => (
              <tr key={k.id} style={{ backgroundColor: "#f8f9fa" }}>
                <td style={{ padding: "12px", border: "1px solid #ddd" }}>{k.user?.id || k.id}</td>
                <td style={{ padding: "12px", border: "1px solid #ddd" }}>{k.aadhaarNumber}</td>
                <td style={{ padding: "12px", border: "1px solid #ddd" }}>{k.panNumber}</td>
                <td style={{ padding: "12px", border: "1px solid #ddd" }}>{k.address}</td>
                <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                  <span style={{
                    padding: "4px 8px",
                    borderRadius: "4px",
                    backgroundColor: k.status === "PENDING" ? "#ffc107" : k.status === "APPROVED" ? "#28a745" : "#dc3545",
                    color: "white"
                  }}>
                    {k.status}
                  </span>
                </td>
                <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                  <button 
                    onClick={() => act(k.id, "approve")} 
                    style={{ 
                      padding: "6px 12px", 
                      backgroundColor: "#28a745", 
                      color: "white", 
                      border: "none", 
                      borderRadius: "4px", 
                      cursor: "pointer",
                      marginRight: "8px"
                    }}
                  >
                    Approve
                  </button>
                  <button 
                    onClick={() => act(k.id, "reject")} 
                    style={{ 
                      padding: "6px 12px", 
                      backgroundColor: "#dc3545", 
                      color: "white", 
                      border: "none", 
                      borderRadius: "4px", 
                      cursor: "pointer"
                    }}
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {kycList.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px", color: "#6c757d" }}>
            No pending KYC applications found.
          </div>
        )}
      </div>
    </div>
  );
}
