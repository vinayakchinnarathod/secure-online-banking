import React, { useState, useEffect } from 'react';
import './HomePage3D.css';

export default function HomePage3D({ onShowLogin }) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
    
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setMousePosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="homepage-3d">
      {/* 3D Background Elements */}
      <div className="bg-3d-container">
        <div className="floating-cards">
          <div className="card-3d card-1" style={{
            transform: `translateX(${mousePosition.x * 20}px) translateY(${mousePosition.y * 20}px) rotateY(${mousePosition.x * 10}deg)`
          }}>
            <div className="card-icon">💳</div>
            <div className="card-title">Credit Cards</div>
          </div>
          <div className="card-3d card-2" style={{
            transform: `translateX(${mousePosition.x * -15}px) translateY(${mousePosition.y * -15}px) rotateY(${mousePosition.x * -8}deg)`
          }}>
            <div className="card-icon">🏦</div>
            <div className="card-title">Banking</div>
          </div>
          <div className="card-3d card-3" style={{
            transform: `translateX(${mousePosition.x * 25}px) translateY(${mousePosition.y * 25}px) rotateY(${mousePosition.x * 12}deg)`
          }}>
            <div className="card-icon">💰</div>
            <div className="card-title">Investments</div>
          </div>
        </div>

        {/* Animated Particles */}
        <div className="particles">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="particle"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${5 + Math.random() * 10}s`
              }}
            />
          ))}
        </div>

        {/* 3D Geometric Shapes */}
        <div className="geometric-shapes">
          <div className="shape cube" style={{
            transform: `rotateX(${mousePosition.y * 45}deg) rotateY(${mousePosition.x * 45}deg)`
          }} />
          <div className="shape pyramid" style={{
            transform: `rotateX(${mousePosition.y * -30}deg) rotateY(${mousePosition.x * 30}deg)`
          }} />
          <div className="shape sphere" />
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className={`hero-section ${isLoaded ? 'loaded' : ''}`}>
          <div className="hero-title">
            <h1 className="title-3d">
              <span className="title-word">Secure</span>
              <span className="title-word">Bank</span>
            </h1>
            <div className="title-underline" />
          </div>
          
          <p className="hero-subtitle">
            Experience the Future of Digital Banking with Cutting-Edge 3D Technology
          </p>

          <div className="hero-features">
            <div className="feature-item">
              <div className="feature-icon">🔐</div>
              <span>Bank-Level Security</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon">⚡</div>
              <span>Lightning Fast</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon">🌍</div>
              <span>Global Access</span>
            </div>
          </div>
        </div>

        {/* Auth Cards */}
        <div className="auth-3d-container">
          <div className="auth-card-3d login-card" style={{
            transform: `perspective(1000px) rotateY(${mousePosition.x * 5}deg) rotateX(${-mousePosition.y * 5}deg)`
          }}>
            <div className="card-header-3d">
              <div className="card-icon-3d">🔑</div>
              <h2>Welcome Back</h2>
              <p>Login to your account</p>
            </div>
            <div className="card-body-3d">
              <p style={{ textAlign: 'center', marginBottom: '20px', color: '#666' }}>
                Click below to access the secure login portal
              </p>
              <button className="btn-3d primary" onClick={onShowLogin}>
                <span className="btn-text">Go to Login</span>
                <div className="btn-glow" />
              </button>
            </div>
            <div className="card-footer-3d">
              <a href="#" onClick={onShowLogin} className="link-3d">Need help logging in?</a>
            </div>
          </div>

          <div className="auth-card-3d register-card" style={{
            transform: `perspective(1000px) rotateY(${mousePosition.x * -5}deg) rotateX(${-mousePosition.y * 5}deg)`
          }}>
            <div className="card-header-3d">
              <div className="card-icon-3d">🚀</div>
              <h2>Join Us</h2>
              <p>Create your account</p>
            </div>
            <div className="card-body-3d">
              <p style={{ textAlign: 'center', marginBottom: '20px', color: '#666' }}>
                Start your secure banking journey today
              </p>
              <button className="btn-3d secondary" onClick={onShowLogin}>
                <span className="btn-text">Create Account</span>
                <div className="btn-glow" />
              </button>
            </div>
            <div className="card-footer-3d">
              <p className="terms-3d">By registering, you agree to our Terms & Conditions</p>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="stats-3d">
          <div className="stat-item">
            <div className="stat-number" data-count="500000">0</div>
            <div className="stat-label">Active Users</div>
          </div>
          <div className="stat-item">
            <div className="stat-number" data-count="1000000">0</div>
            <div className="stat-label">Transactions Daily</div>
          </div>
          <div className="stat-item">
            <div className="stat-number" data-count="99.9">0</div>
            <div className="stat-label">Uptime %</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="footer-3d">
        <div className="footer-content">
          <p>© 2024 Secure Bank. All rights reserved.</p>
          <div className="footer-links">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Security</a>
          </div>
        </div>
      </div>
    </div>
  );
}
