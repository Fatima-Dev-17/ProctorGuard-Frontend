import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <div className="home-content fade-in">
        <div className="logo-section">
          <div className="logo-icon">
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="50" cy="50" r="45" stroke="url(#gradient)" strokeWidth="4"/>
              <path d="M50 20 L50 50 L70 70" stroke="url(#gradient)" strokeWidth="4" strokeLinecap="round"/>
              <circle cx="50" cy="50" r="8" fill="url(#gradient)"/>
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#667eea" />
                  <stop offset="100%" stopColor="#764ba2" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h1 className="app-title">ProctorGuard</h1>
          <p className="app-tagline">Secure Online Examination Proctoring</p>
        </div>

        <div className="action-buttons">
          <button 
            className="btn btn-primary btn-large"
            onClick={() => navigate('/login')}
          >
            Login
          </button>
          <button 
            className="btn btn-outline btn-large"
            onClick={() => navigate('/signup')}
          >
            Sign Up
          </button>
        </div>

        <div className="features">
          <div className="feature-item slide-in">
            <div className="feature-icon">🔒</div>
            <h3>Secure Authentication</h3>
            <p>Enterprise-grade security for your evaluations</p>
          </div>
          <div className="feature-item slide-in" style={{animationDelay: '0.1s'}}>
            <div className="feature-icon">📍</div>
            <h3>Location Tracking</h3>
            <p>GPS-based proximity detection</p>
          </div>
          <div className="feature-item slide-in" style={{animationDelay: '0.2s'}}>
            <div className="feature-icon">🌐</div>
            <h3>Web Monitoring</h3>
            <p>Real-time activity tracking</p>
          </div>
        </div>
      </div>

      <div className="home-footer">
        <p>© 2024 ProctorGuard. All rights reserved.</p>
      </div>
    </div>
  );
};

export default Home;
