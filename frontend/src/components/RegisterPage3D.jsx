import React, { useState } from 'react';
import './RegisterPage3D.css';
import api from '../api';

export default function RegisterPage3D() {
  const [form, setForm] = useState({ 
    username: '', 
    password: '', 
    email: '', 
    fullName: '',
    aadhaarNumber: '',
    panNumber: '',
    address: '',
    phoneNumber: ''
  });
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateEmail = (email) => {
    // Only allow Gmail addresses
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    return gmailRegex.test(email);
  };

  const validateAadhaar = (aadhaar) => {
    // Must be exactly 12 digits
    const aadhaarRegex = /^\d{12}$/;
    return aadhaarRegex.test(aadhaar);
  };

  const validateMobile = (mobile) => {
    // Must be exactly 10 digits starting with 9, 8, 7, or 6
    const mobileRegex = /^[6-9]\d{9}$/;
    return mobileRegex.test(mobile);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Apply input restrictions
    let processedValue = value;
    
    if (name === 'aadhaarNumber') {
      // Only allow digits
      processedValue = value.replace(/\D/g, '');
    } else if (name === 'phoneNumber') {
      // Only allow digits
      processedValue = value.replace(/\D/g, '');
    }
    
    setForm({ ...form, [name]: processedValue });
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Email validation - only Gmail allowed
    if (!form.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(form.email)) {
      newErrors.email = 'Only Gmail addresses (@gmail.com) are allowed';
    }
    
    // Aadhaar validation - exactly 12 digits
    if (!form.aadhaarNumber) {
      newErrors.aadhaarNumber = 'Aadhaar number is required';
    } else if (!validateAadhaar(form.aadhaarNumber)) {
      newErrors.aadhaarNumber = 'Aadhaar number must be exactly 12 digits';
    }
    
    // Mobile validation - 10 digits starting with 6,7,8,9
    if (!form.phoneNumber) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!validateMobile(form.phoneNumber)) {
      newErrors.phoneNumber = 'Phone number must be 10 digits starting with 6, 7, 8, or 9';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setMessage('');

    try {
      const res = await api.post('/auth/register', form);
      setMessage('Registration successful! Your KYC information has been submitted for review.');
      setForm({ username: '', password: '', email: '', fullName: '', aadhaarNumber: '', panNumber: '', address: '', phoneNumber: '' });
      setErrors({});
    } catch (err) {
      setMessage(err.response?.data || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-page-3d">
      <div className="register-container-3d">
        <div className="register-card-3d">
          <div className="register-header-3d">
            <div className="logo-3d">
              <div className="logo-icon">🚀</div>
              <h1>Join Secure Bank</h1>
            </div>
            <p className="register-subtitle">Start your secure banking journey today</p>
          </div>

          <form onSubmit={submit} className="register-form-3d">
            <div className="input-group-3d">
              <div className="input-icon-3d">👤</div>
              <input
                type="text"
                name="fullName"
                placeholder="Full Name"
                value={form.fullName}
                onChange={handleChange}
                required
                className="input-3d"
              />
            </div>

            <div className="input-group-3d">
              <div className="input-icon-3d">📧</div>
              <input
                type="email"
                name="email"
                placeholder="Email Address (Only Gmail)"
                value={form.email}
                onChange={handleChange}
                required
                className={`input-3d ${errors.email ? 'error' : ''}`}
              />
              {errors.email && <div className="error-message">{errors.email}</div>}
            </div>

            <div className="input-group-3d">
              <div className="input-icon-3d">🔐</div>
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
                minLength="6"
              />
            </div>

            <div className="input-group-3d">
              <div className="input-icon-3d">🆔</div>
              <input
                type="text"
                name="aadhaarNumber"
                placeholder="Aadhaar Number (12 digits)"
                value={form.aadhaarNumber}
                onChange={handleChange}
                required
                className={`input-3d ${errors.aadhaarNumber ? 'error' : ''}`}
                maxLength="12"
                pattern="\d{12}"
              />
              {errors.aadhaarNumber && <div className="error-message">{errors.aadhaarNumber}</div>}
            </div>

            <div className="input-group-3d">
              <div className="input-icon-3d">📋</div>
              <input
                type="text"
                name="panNumber"
                placeholder="PAN Number"
                value={form.panNumber}
                onChange={handleChange}
                required
                className="input-3d"
                maxLength="10"
              />
            </div>

            <div className="input-group-3d">
              <div className="input-icon-3d">📍</div>
              <textarea
                name="address"
                placeholder="Full Address"
                value={form.address}
                onChange={handleChange}
                required
                className="textarea-3d"
                rows="3"
              />
            </div>

            <div className="input-group-3d">
              <div className="input-icon-3d">📞</div>
              <input
                type="tel"
                name="phoneNumber"
                placeholder="Phone Number (10 digits, starts with 6,7,8,9)"
                value={form.phoneNumber}
                onChange={handleChange}
                required
                className={`input-3d ${errors.phoneNumber ? 'error' : ''}`}
                maxLength="10"
                pattern="[6-9]\d{9}"
              />
              {errors.phoneNumber && <div className="error-message">{errors.phoneNumber}</div>}
            </div>

            <button type="submit" className="register-btn-3d" disabled={isLoading}>
              {isLoading ? (
                <div className="loading-spinner-3d"></div>
              ) : (
                <span>Create Account</span>
              )}
            </button>
          </form>

          {message && (
            <div className={`message-3d ${message.includes('successful') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}

          <div className="register-footer-3d">
            <div className="divider-3d">or</div>
            <p className="login-prompt-3d">
              Already have an account? <a href="#" className="login-link-3d">Login here</a>
            </p>
          </div>

          <div className="security-features-3d">
            <div className="security-item">
              <span className="security-icon">🔒</span>
              <span>Bank-Level Security</span>
            </div>
            <div className="security-item">
              <span className="security-icon">🛡️</span>
              <span>256-bit Encryption</span>
            </div>
            <div className="security-item">
              <span className="security-icon">✅</span>
              <span>Instant Verification</span>
            </div>
          </div>
        </div>

        <div className="floating-elements-3d">
          <div className="float-element element-1">🏦</div>
          <div className="float-element element-2">💳</div>
          <div className="float-element element-3">🔐</div>
          <div className="float-element element-4">💰</div>
          <div className="float-element element-5">📱</div>
        </div>
      </div>
    </div>
  );
}
