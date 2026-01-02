import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL, API_ENDPOINTS } from '../utils/config';
import './Profile.css';

interface UserProfile {
  userId: string;
  email: string;
  fullName: string;
  role: string;
  statistics: {
    enrolledCourses: number;
    activeCourses: number;
    availableEvaluations: number;
    completedEvaluations?: number;
  };
}

const StudentProfile: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState('');

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    const storedRole = localStorage.getItem('userRole');
    
    if (!storedUserId || storedRole !== 'student') {
      navigate('/login');
      return;
    }
    
    setUserId(storedUserId);
    fetchProfile(storedUserId);
  }, [navigate]);

  const fetchProfile = async (uid: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.PROFILE}/${uid}`);
      const data = await response.json();
      if (data.success) {
        setProfile(data.data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/student/dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('userRole');
    navigate('/');
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      {/* Header */}
      <header className="profile-header">
        <button className="btn-back" onClick={handleBack}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <line x1="19" y1="12" x2="5" y2="12" strokeWidth="2" strokeLinecap="round"/>
            <polyline points="12 19 5 12 12 5" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Back to Dashboard
        </button>
      </header>

      <div className="profile-content">
        {/* Profile Card */}
        <div className="profile-card">
          <div className="profile-avatar">
            <div className="avatar-circle student">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="12" cy="7" r="4" strokeWidth="2"/>
              </svg>
            </div>
          </div>

          <div className="profile-info">
            <h1 className="profile-name">{profile?.fullName}</h1>
            <p className="profile-email">{profile?.email}</p>
            <span className="role-badge student">
              🎓 Student
            </span>
          </div>

          <div className="profile-divider"></div>

          {/* Statistics Section */}
          <div className="statistics-section">
            <h2 className="section-title">Academic Statistics</h2>
            
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-icon student">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" strokeWidth="2"/>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" strokeWidth="2"/>
                  </svg>
                </div>
                <div className="stat-details">
                  <span className="stat-label">Enrolled Courses</span>
                  <span className="stat-number">{profile?.statistics?.enrolledCourses || 0}</span>
                </div>
              </div>

              <div className="stat-item">
                <div className="stat-icon student">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                    <polyline points="12 6 12 12 16 14" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <div className="stat-details">
                  <span className="stat-label">Active Courses</span>
                  <span className="stat-number">{profile?.statistics?.activeCourses || 0}</span>
                </div>
              </div>

              <div className="stat-item">
                <div className="stat-icon student">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" strokeWidth="2"/>
                    <polyline points="14 2 14 8 20 8" strokeWidth="2"/>
                  </svg>
                </div>
                <div className="stat-details">
                  <span className="stat-label">Available Evaluations</span>
                  <span className="stat-number">{profile?.statistics?.availableEvaluations || 0}</span>
                </div>
              </div>

              <div className="stat-item">
                <div className="stat-icon student">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <polyline points="20 6 9 17 4 12" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <div className="stat-details">
                  <span className="stat-label">Completed</span>
                  <span className="stat-number">{profile?.statistics?.completedEvaluations || 0}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="profile-divider"></div>

          {/* Account Settings */}
          <div className="settings-section">
            <h2 className="section-title">Account Settings</h2>
            
            <div className="settings-list">
              <button className="setting-item">
                <div className="setting-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeWidth="2" strokeLinecap="round"/>
                    <circle cx="12" cy="7" r="4" strokeWidth="2"/>
                  </svg>
                </div>
                <span>Edit Profile</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <polyline points="9 18 15 12 9 6" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>

              <button className="setting-item">
                <div className="setting-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <rect x="3" y="11" width="18" height="11" rx="2" strokeWidth="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" strokeWidth="2"/>
                  </svg>
                </div>
                <span>Change Password</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <polyline points="9 18 15 12 9 6" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>

              <button className="setting-item">
                <div className="setting-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="12" cy="12" r="3" strokeWidth="2"/>
                    <path d="M12 1v6m0 6v6M4.22 4.22l4.24 4.25m5.07 5.07l4.24 4.25M1 12h6m6 0h6M4.22 19.78l4.24-4.24m5.07-5.07l4.24-4.24" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <span>Preferences</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <polyline points="9 18 15 12 9 6" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>

              <button className="setting-item danger" onClick={handleLogout}>
                <div className="setting-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" strokeWidth="2" strokeLinecap="round"/>
                    <polyline points="16 17 21 12 16 7" strokeWidth="2" strokeLinecap="round"/>
                    <line x1="21" y1="12" x2="9" y2="12" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <span>Logout</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <polyline points="9 18 15 12 9 6" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;