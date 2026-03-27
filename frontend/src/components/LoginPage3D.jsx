import React, { useState } from 'react';
import './LoginPage3D.css';
import api from '../api';

export default function LoginPage3D({ onSuccess }) {
  const [form, setForm] = useState({ username: '', password: '' });
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const res = await api.post('/auth/login', form);
      localStorage.setItem('token', res.data.token);
      
      // Check KYC status
      try {
        const kycRes = await api.get(`/kyc/status?username=${form.username}`);
        const kycStatus = kycRes.data.status || 'PENDING';
        setMessage('Login successful! Redirecting...');
        onSuccess(form.username, res.data.role, kycStatus);
      } catch (kycError) {
        setMessage('Login successful! Redirecting...');
        onSuccess(form.username, res.data.role, 'PENDING');
      }
    } catch (err) {
      setMessage(err.response?.data || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page-3d">
      <div className="login-container-3d">
        <div className="login-card-3d">
          <div className="login-header-3d">
            <div className="logo-3d">
              <div className="logo-icon">🏦</div>
              <h1>Secure Bank</h1>
            </div>
            <p className="login-subtitle">Welcome back to your secure banking experience</p>
          </div>

          <form onSubmit={submit} className="login-form-3d">
            <div className="input-group-3d">
              <div className="input-icon-3d">👤</div>
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={form.username}
                onChange={handleChange}
                required
                className="input-3d"
              />
            </div>

            <div className="input-group-3d">
              <div className="input-icon-3d">🔒</div>
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                required
                className="input-3d"
              />
            </div>

            <button type="submit" className="login-btn-3d" disabled={isLoading}>
              {isLoading ? (
                <div className="loading-spinner-3d"></div>
              ) : (
                <span>Login to Account</span>
              )}
            </button>
          </form>

          {message && (
            <div className={`message-3d ${message.includes('successful') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}

          <div className="login-footer-3d">
            <a href="#" className="forgot-link-3d">Forgot Password?</a>
            <div className="divider-3d">or</div>
            <p className="signup-prompt-3d">
              Don't have an account? <a href="#" className="signup-link-3d">Register here</a>
            </p>
          </div>
        </div>

        <div className="floating-elements-3d">
          <div className="float-element element-1">💳</div>
          <div className="float-element element-2">🔐</div>
          <div className="float-element element-3">💰</div>
          <div className="float-element element-4">🏦</div>
        </div>
      </div>
    </div>
  );
}
