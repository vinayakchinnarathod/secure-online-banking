import React, { useEffect, useState } from "react";
import api from "../api";
import DocumentUpload from "./DocumentUpload";

export default function DashboardEnhanced({ username, onLogout, documentVerified = false }) {
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
  const [showDocumentRequiredModal, setShowDocumentRequiredModal] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, [username]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load account balance
      const balanceRes = await api.get(`/account/balance?username=${username}`);
      setAccountBalance(balanceRes.data.balance || 25000); // Default balance if API fails

      // Load transactions
      const t = await api.get("/transactions", {
        params: { username },
      });
      setTransactions(t.data);

      // Load loans
      const l = await api.get("/loan/all", {
        params: { username },
      });
      setLoans(l.data);
    } catch (error) {
      console.error("Dashboard data loading error:", error);
      if (error.response) {
        setInfo(`Server error: ${error.response.status} - ${error.response.data || 'Unknown error'}`);
      } else if (error.request) {
        setInfo("Cannot connect to backend server. Please ensure backend is running on localhost:8080");
      } else {
        setInfo(`Error: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const requestCheckBook = async () => {
    if (!documentVerified) {
      setShowDocumentRequiredModal(true);
      return;
    }
    
    try {
      const res = await api.post("/checkbook/request", {
        username,
      });
      setInfo(res.data);
    } catch {
      setInfo("Error requesting check book");
    }
  };

  const handleServiceClick = (serviceType) => {
    if (!documentVerified) {
      setShowDocumentRequiredModal(true);
      return;
    }
    
    if (serviceType === 'checkbook') {
      requestCheckBook();
    }
    // Add other service handlers here
  };

  const applyLoan = async (e) => {
    e.preventDefault();
    
    if (!documentVerified) {
      setShowDocumentRequiredModal(true);
      return;
    }
    
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
    } catch {
      setInfo("Error applying for loan");
    }
  };

  const handleLoanChange = (e) => {
    setLoanForm({ ...loanForm, [e.target.name]: e.target.value });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getTransactionIcon = (type) => {
    return type === 'CREDIT' ? '📈' : '📉';
  };

  const getLoanStatusColor = (status) => {
    switch (status) {
      case 'APPROVED': return '#28a745';
      case 'PENDING': return '#ffc107';
      case 'REJECTED': return '#dc3545';
      default: return '#6c757d';
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading your banking dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-enhanced">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="user-info">
            <h1>🏦 Secure Bank</h1>
            <p className="welcome-message">Welcome back, {username}!</p>
          </div>
          <button onClick={onLogout} className="logout-btn">
            🚪 Logout
          </button>
        </div>
      </header>

      <div className="dashboard-tabs">
        <button 
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button 
          className={`tab-btn ${activeTab === 'transactions' ? 'active' : ''}`}
          onClick={() => setActiveTab('transactions')}
        >
          💳 Transactions
        </button>
        <button 
          className={`tab-btn ${activeTab === 'loans' ? 'active' : ''}`}
          onClick={() => setActiveTab('loans')}
        >
          💰 Loans
        </button>
        <button 
          className={`tab-btn ${activeTab === 'services' ? 'active' : ''}`}
          onClick={() => setActiveTab('services')}
        >
          🛠️ Services
        </button>
        <button 
          className={`tab-btn ${activeTab === 'documents' ? 'active' : ''}`}
          onClick={() => setActiveTab('documents')}
        >
          📋 Documents
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'overview' && (
          <div className="overview-section">
            <div className="balance-card">
              <h2>💰 Account Balance</h2>
              <div className="balance-amount">
                {formatCurrency(accountBalance)}
              </div>
              <p className="balance-subtitle">Available Balance</p>
            </div>

            <div className="quick-stats">
              <div className="stat-card">
                <h3>📈 Total Credits</h3>
                <p>
                  {formatCurrency(
                    transactions
                      .filter(t => t.type === 'CREDIT')
                      .reduce((sum, t) => sum + t.amount, 0)
                  )}
                </p>
              </div>
              <div className="stat-card">
                <h3>📉 Total Debits</h3>
                <p>
                  {formatCurrency(
                    transactions
                      .filter(t => t.type === 'DEBIT')
                      .reduce((sum, t) => sum + t.amount, 0)
                  )}
                </p>
              </div>
              <div className="stat-card">
                <h3>📋 Active Loans</h3>
                <p>{loans.filter(l => l.status === 'APPROVED').length}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="transactions-section">
            <h2>💳 Transaction History</h2>
            <div className="transactions-list">
              {transactions.length === 0 ? (
                <div className="no-data">
                  <p>📭 No transactions yet</p>
                </div>
              ) : (
                transactions.map((t) => (
                  <div key={t.id} className="transaction-item">
                    <div className="transaction-icon">
                      {getTransactionIcon(t.type)}
                    </div>
                    <div className="transaction-details">
                      <div className="transaction-header">
                        <span className="transaction-type">{t.type}</span>
                        <span className="transaction-amount">
                          {t.type === 'CREDIT' ? '+' : '-'} {formatCurrency(t.amount)}
                        </span>
                      </div>
                      <div className="transaction-description">{t.description}</div>
                      <div className="transaction-date">{t.timestamp}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'loans' && (
          <div className="loans-section">
            <h2>💰 Loan Management</h2>
            
            <div className="loan-application">
              <h3>Apply for New Loan</h3>
              <form onSubmit={applyLoan} className="loan-form">
                <div className="form-row">
                  <input
                    name="principal"
                    placeholder="Principal Amount (₹)"
                    value={loanForm.principal}
                    onChange={handleLoanChange}
                    required
                  />
                  <input
                    name="interestRate"
                    placeholder="Interest Rate (%)"
                    value={loanForm.interestRate}
                    onChange={handleLoanChange}
                    required
                  />
                  <input
                    name="tenureMonths"
                    placeholder="Tenure (months)"
                    value={loanForm.tenureMonths}
                    onChange={handleLoanChange}
                    required
                  />
                </div>
                <button type="submit" className="apply-loan-btn">
                  📤 Apply for Loan
                </button>
              </form>
            </div>

            <div className="existing-loans">
              <h3>Your Existing Loans</h3>
              {loans.length === 0 ? (
                <div className="no-data">
                  <p>📭 No loans yet</p>
                </div>
              ) : (
                <div className="loans-list">
                  {loans.map((loan) => (
                    <div key={loan.id} className="loan-item">
                      <div className="loan-header">
                        <span className="loan-principal">{formatCurrency(loan.principal)}</span>
                        <span 
                          className="loan-status" 
                          style={{ color: getLoanStatusColor(loan.status) }}
                        >
                          {loan.status}
                        </span>
                      </div>
                      <div className="loan-details">
                        <p><strong>Interest Rate:</strong> {loan.interestRate}%</p>
                        <p><strong>Tenure:</strong> {loan.tenureMonths} months</p>
                        {loan.emiAmount && (
                          <p><strong>EMI:</strong> {formatCurrency(loan.emiAmount)}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'services' && (
          <div className="services-section">
            <h2>🛠️ Banking Services</h2>
            <div className="services-grid">
              <div className="service-card" onClick={requestCheckBook}>
                <div className="service-icon">�</div>
                <h3>Checkbook Request</h3>
                <p>Request a new checkbook</p>
              </div>
              <div className="service-card">
                <div className="service-icon">�</div>
                <h3>Card Services</h3>
                <p>Manage debit/credit cards</p>
              </div>
              <div className="service-card">
                <div className="service-icon">�</div>
                <h3>Mobile Banking</h3>
                <p>Banking on the go</p>
              </div>
              <div className="service-card">
                <div className="service-icon">🏧</div>
                <h3>Bill Payments</h3>
                <p>Pay utility bills online</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="documents-section">
            <DocumentUpload username={username} />
          </div>
        )}
      </div>

      {info && <div className="info-message">{info}</div>}

      <style jsx>{`
        .dashboard-enhanced {
          min-height: 100vh;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        .loading-container {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
        }

        .loading-spinner {
          text-align: center;
          color: #667eea;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #667eea;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 20px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .dashboard-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 20px 30px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          max-width: 1200px;
          margin: 0 auto;
        }

        .user-info h1 {
          margin: 0 0 5px 0;
          font-size: 24px;
          font-weight: 600;
        }

        .welcome-message {
          margin: 0;
          opacity: 0.9;
          font-size: 14px;
        }

        .logout-btn {
          background: rgba(255,255,255,0.2);
          border: 1px solid rgba(255,255,255,0.3);
          color: white;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .logout-btn:hover {
          background: rgba(255,255,255,0.3);
        }

        .dashboard-tabs {
          background: white;
          padding: 0 30px;
          display: flex;
          gap: 10px;
          border-bottom: 1px solid #e1e8ed;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }

        .tab-btn {
          background: none;
          border: none;
          padding: 15px 25px;
          cursor: pointer;
          border-bottom: 3px solid transparent;
          transition: all 0.3s ease;
          font-weight: 500;
          color: #6c757d;
        }

        .tab-btn.active {
          color: #667eea;
          border-bottom-color: #667eea;
        }

        .tab-btn:hover {
          color: #667eea;
        }

        .dashboard-content {
          padding: 30px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .overview-section {
          display: grid;
          gap: 30px;
        }

        .balance-card {
          background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
          color: white;
          padding: 30px;
          border-radius: 15px;
          text-align: center;
          box-shadow: 0 10px 30px rgba(40, 167, 69, 0.3);
        }

        .balance-card h2 {
          margin: 0 0 10px 0;
          font-size: 18px;
          opacity: 0.9;
        }

        .balance-amount {
          font-size: 36px;
          font-weight: 700;
          margin-bottom: 5px;
        }

        .balance-subtitle {
          margin: 0;
          opacity: 0.8;
          font-size: 14px;
        }

        .quick-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
        }

        .stat-card {
          background: white;
          padding: 25px;
          border-radius: 12px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
          text-align: center;
        }

        .stat-card h3 {
          margin: 0 0 10px 0;
          color: #495057;
          font-size: 16px;
        }

        .stat-card p {
          margin: 0;
          font-size: 24px;
          font-weight: 600;
          color: #667eea;
        }

        .transactions-section,
        .loans-section,
        .services-section,
        .documents-section {
          background: white;
          border-radius: 15px;
          padding: 30px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }

        .transactions-section h2,
        .loans-section h2,
        .services-section h2 {
          margin: 0 0 25px 0;
          color: #333;
          font-size: 24px;
          border-bottom: 2px solid #667eea;
          padding-bottom: 10px;
        }

        .transactions-list {
          display: grid;
          gap: 15px;
        }

        .transaction-item {
          display: flex;
          align-items: center;
          padding: 20px;
          border: 1px solid #e1e8ed;
          border-radius: 10px;
          transition: all 0.3s ease;
        }

        .transaction-item:hover {
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
          transform: translateY(-2px);
        }

        .transaction-icon {
          font-size: 24px;
          margin-right: 20px;
        }

        .transaction-details {
          flex: 1;
        }

        .transaction-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .transaction-type {
          font-weight: 600;
          color: #495057;
        }

        .transaction-amount {
          font-weight: 700;
          font-size: 18px;
        }

        .transaction-description {
          color: #6c757d;
          margin-bottom: 5px;
        }

        .transaction-date {
          color: #adb5bd;
          font-size: 14px;
        }

        .loan-application {
          background: #f8f9fa;
          padding: 25px;
          border-radius: 10px;
          margin-bottom: 30px;
        }

        .loan-form {
          display: flex;
          gap: 15px;
          align-items: end;
        }

        .loan-form input {
          flex: 1;
          padding: 12px;
          border: 2px solid #e1e8ed;
          border-radius: 8px;
          font-size: 16px;
        }

        .apply-loan-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 12px 30px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .apply-loan-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
        }

        .loans-list {
          display: grid;
          gap: 15px;
        }

        .loan-item {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 10px;
          border: 1px solid #e1e8ed;
        }

        .loan-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }

        .loan-principal {
          font-size: 20px;
          font-weight: 700;
          color: #333;
        }

        .loan-status {
          padding: 5px 12px;
          border-radius: 15px;
          font-size: 12px;
          font-weight: 600;
        }

        .loan-details p {
          margin: 5px 0;
          color: #6c757d;
        }

        .services-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
        }

        .service-card {
          background: #f8f9fa;
          padding: 25px;
          border-radius: 12px;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          border: 2px solid transparent;
        }

        .service-card:hover {
          border-color: #667eea;
          box-shadow: 0 5px 15px rgba(102, 126, 234, 0.2);
          transform: translateY(-3px);
        }

        .service-icon {
          font-size: 40px;
          margin-bottom: 15px;
        }

        .service-card h3 {
          margin: 0 0 10px 0;
          color: #333;
          font-size: 18px;
        }

        .service-card p {
          margin: 0;
          color: #6c757d;
          font-size: 14px;
        }

        .no-data {
          text-align: center;
          padding: 40px;
          color: #6c757d;
        }

        .info-message {
          background: #d1ecf1;
          color: #0c5460;
          padding: 15px;
          border-radius: 8px;
          margin: 20px 30px;
          text-align: center;
          font-weight: 600;
        }

        @media (max-width: 768px) {
          .header-content {
            flex-direction: column;
            gap: 15px;
          }

          .dashboard-tabs {
            overflow-x: auto;
            justify-content: flex-start;
          }

          .loan-form {
            flex-direction: column;
            gap: 10px;
          }

          .quick-stats {
            grid-template-columns: 1fr;
          }

          .services-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
