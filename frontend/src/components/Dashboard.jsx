import React, { useEffect, useState } from "react";
import api from "../api";

export default function Dashboard({ username, onLogout }) {
  const [accountBalance, setAccountBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loans, setLoans] = useState([]);
  const [loanForm, setLoanForm] = useState({
    principal: "",
    interestRate: "",
    tenureMonths: "",
  });
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    loadDashboardData();
  }, [username]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load account balance
      const balanceRes = await api.get(`/account/balance?username=${username}`);
      setAccountBalance(balanceRes.data.balance || 25000);

      // Load transactions
      const transRes = await api.get("/transactions", {
        params: { username },
      });
      setTransactions(transRes.data || []);

      // Load loans
      const loansRes = await api.get("/loan/all", {
        params: { username },
      });
      setLoans(loansRes.data || []);
    } catch (error) {
      console.error("Dashboard data loading error:", error);
      setInfo("Error loading dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const requestCheckBook = async () => {
    try {
      const res = await api.post("/checkbook/request", {
        username,
      });
      setInfo(res.data);
    } catch (error) {
      setInfo("Error requesting check book");
    }
  };

  const applyLoan = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        principal: parseFloat(loanForm.principal),
        interestRate: parseFloat(loanForm.interestRate),
        tenureMonths: parseInt(loanForm.tenureMonths, 10),
        username,
      };

      const res = await api.post("/loan/apply", payload);
      setInfo("Loan applied successfully");
      loadDashboardData();
      setLoanForm({ principal: "", interestRate: "", tenureMonths: "" });
    } catch (error) {
      setInfo("Error applying for loan");
    }
  };

  const handleLoanChange = (e) => {
    setLoanForm({ ...loanForm, [e.target.name]: e.target.value });
  };

  const downloadStatement = () => {
    setInfo("Account statement download started...");
    // Simulate download - in real app, this would call an API
    setTimeout(() => {
      setInfo("Account statement downloaded successfully!");
    }, 2000);
  };

  const contactSupport = () => {
    setInfo("Connecting to customer support...");
    // Simulate support connection
    setTimeout(() => {
      setInfo("Customer support team will contact you within 24 hours.");
    }, 1500);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <div>Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>Welcome, {username}</h1>
        <button onClick={onLogout} style={{ padding: '10px 20px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          Logout
        </button>
      </div>

      {info && (
        <div style={{ padding: '15px', backgroundColor: '#d4edda', border: '1px solid #c3e6cb', borderRadius: '5px', marginBottom: '20px', color: '#155724' }}>
          {info}
        </div>
      )}

      {/* Account Balance */}
      <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '10px', marginBottom: '20px' }}>
        <h2>Account Balance</h2>
        <h3 style={{ color: '#28a745', fontSize: '36px' }}>₹{accountBalance.toLocaleString()}</h3>
      </div>

      {/* Tabs */}
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={() => setActiveTab("overview")}
          style={{ 
            padding: '10px 20px', 
            marginRight: '10px', 
            backgroundColor: activeTab === "overview" ? '#007bff' : '#6c757d', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Overview
        </button>
        <button 
          onClick={() => setActiveTab("transactions")}
          style={{ 
            padding: '10px 20px', 
            marginRight: '10px', 
            backgroundColor: activeTab === "transactions" ? '#007bff' : '#6c757d', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Transactions
        </button>
        <button 
          onClick={() => setActiveTab("loans")}
          style={{ 
            padding: '10px 20px', 
            marginRight: '10px', 
            backgroundColor: activeTab === "loans" ? '#007bff' : '#6c757d', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Loans
        </button>
        <button 
          onClick={() => setActiveTab("services")}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: activeTab === "services" ? '#007bff' : '#6c757d', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Services
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '10px' }}>
            <h3>Quick Stats</h3>
            <p>Account Balance: ₹{accountBalance.toLocaleString()}</p>
            <p>Total Transactions: {transactions.length}</p>
            <p>Active Loans: {loans.filter(l => l.status === 'APPROVED').length}</p>
          </div>
          <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '10px' }}>
            <h3>Recent Activity</h3>
            {transactions.slice(0, 3).map((trans, index) => (
              <div key={index} style={{ marginBottom: '10px' }}>
                {trans.type}: ₹{trans.amount} - {trans.description}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "transactions" && (
        <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '10px' }}>
          <h3>Transaction History</h3>
          {transactions.length === 0 ? (
            <p>No transactions found.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#dee2e6' }}>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Type</th>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Amount</th>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Description</th>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((trans, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #dee2e6' }}>
                    <td style={{ padding: '10px' }}>{trans.type}</td>
                    <td style={{ padding: '10px', color: trans.type === 'CREDIT' ? '#28a745' : '#dc3545' }}>
                      ₹{trans.amount}
                    </td>
                    <td style={{ padding: '10px' }}>{trans.description}</td>
                    <td style={{ padding: '10px' }}>{trans.timestamp || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === "loans" && (
        <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '10px' }}>
          <h3>Loan Management</h3>
          
          {/* Apply for Loan Form */}
          <div style={{ marginBottom: '30px' }}>
            <h4>Apply for New Loan</h4>
            <form onSubmit={applyLoan} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
              <input
                type="number"
                name="principal"
                placeholder="Principal Amount"
                value={loanForm.principal}
                onChange={handleLoanChange}
                required
                style={{ padding: '10px', border: '1px solid #ced4da', borderRadius: '5px' }}
              />
              <input
                type="number"
                step="0.1"
                name="interestRate"
                placeholder="Interest Rate (%)"
                value={loanForm.interestRate}
                onChange={handleLoanChange}
                required
                style={{ padding: '10px', border: '1px solid #ced4da', borderRadius: '5px' }}
              />
              <input
                type="number"
                name="tenureMonths"
                placeholder="Tenure (Months)"
                value={loanForm.tenureMonths}
                onChange={handleLoanChange}
                required
                style={{ padding: '10px', border: '1px solid #ced4da', borderRadius: '5px' }}
              />
              <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                Apply Loan
              </button>
            </form>
          </div>

          {/* Existing Loans */}
          <h4>Your Loans</h4>
          {loans.length === 0 ? (
            <p>No loans found.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#dee2e6' }}>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Principal</th>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Interest Rate</th>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Tenure</th>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {loans.map((loan, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #dee2e6' }}>
                    <td style={{ padding: '10px' }}>₹{loan.principal}</td>
                    <td style={{ padding: '10px' }}>{loan.interestRate}%</td>
                    <td style={{ padding: '10px' }}>{loan.tenureMonths} months</td>
                    <td style={{ padding: '10px' }}>
                      <span style={{ 
                        backgroundColor: loan.status === 'APPROVED' ? '#28a745' : loan.status === 'PENDING' ? '#ffc107' : '#dc3545',
                        color: 'white',
                        padding: '5px 10px',
                        borderRadius: '3px',
                        fontSize: '12px'
                      }}>
                        {loan.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === "services" && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '10px', textAlign: 'center' }}>
            <h3>Checkbook Request</h3>
            <p>Request a new checkbook for your account</p>
            <button onClick={requestCheckBook} style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
              Request Checkbook
            </button>
          </div>
          <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '10px', textAlign: 'center' }}>
            <h3>Account Statement</h3>
            <p>Download your monthly account statement</p>
            <button onClick={downloadStatement} style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
              Download Statement
            </button>
          </div>
          <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '10px', textAlign: 'center' }}>
            <h3>Customer Support</h3>
            <p>Get help with your account</p>
            <button onClick={contactSupport} style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
              Contact Support
            </button>
          </div>
        </div>
      )}
    </div>
  );
}