import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL, API_ENDPOINTS } from '../utils/config';
import './StudentDashboard.css';

interface Course {
  courseId: string;
  courseCode: string;
  courseName: string;
  enrolledCount: number;
  isActive: boolean;
  hasUpcomingEvaluation?: boolean;
  upcomingEvaluationTime?: number;
}

interface UserProfile {
  userId: string;
  email: string;
  fullName: string;
  role: string;
  statistics: {
    enrolledCourses: number;
    activeCourses: number;
    availableEvaluations: number;
  };
}

const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState('');

  useEffect(() => {
    // Get userId from localStorage or session
    const storedUserId = localStorage.getItem('userId');
    if (!storedUserId) {
      navigate('/login');
      return;
    }
    setUserId(storedUserId);
    
    // Fetch profile and courses
    fetchProfile(storedUserId);
    fetchCourses(storedUserId);
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
    }
  };

  const fetchCourses = async (uid: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.GET_STUDENT_COURSES}/${uid}`);
      const data = await response.json();
      if (data.success) {
        setCourses(data.data);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinCourse = async (accessCode: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.JOIN_COURSE}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: userId, accessCode })
      });
      const data = await response.json();
      if (data.success) {
        fetchCourses(userId);
        alert('Successfully joined course!');
        return true;
      } else {
        alert(data.message || 'Failed to join course');
      }
      return false;
    } catch (error) {
      console.error('Error joining course:', error);
      alert('Error joining course. Please try again.');
      return false;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('userRole');
    navigate('/');
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <div className="logo-small">
            <svg viewBox="0 0 100 100" fill="none">
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
          <h1 className="dashboard-title">ProctorGuard</h1>
        </div>
        <div className="header-right">
          <button 
            className="btn-icon"
            onClick={() => navigate('/student/profile')}
            title="Profile"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="12" cy="7" r="4" strokeWidth="2"/>
            </svg>
          </button>
          <button 
            className="btn-icon"
            onClick={handleLogout}
            title="Logout"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" strokeWidth="2" strokeLinecap="round"/>
              <polyline points="16 17 21 12 16 7" strokeWidth="2" strokeLinecap="round"/>
              <line x1="21" y1="12" x2="9" y2="12" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </header>

      <div className="dashboard-content">
        {/* Stats Overview */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" strokeWidth="2" strokeLinecap="round"/>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" strokeWidth="2"/>
              </svg>
            </div>
            <div className="stat-info">
              <span className="stat-label">Enrolled Courses</span>
              <span className="stat-value">{profile?.statistics.enrolledCourses || 0}</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'}}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white">
                <rect x="3" y="4" width="18" height="18" rx="2" strokeWidth="2"/>
                <line x1="16" y1="2" x2="16" y2="6" strokeWidth="2" strokeLinecap="round"/>
                <line x1="8" y1="2" x2="8" y2="6" strokeWidth="2" strokeLinecap="round"/>
                <line x1="3" y1="10" x2="21" y2="10" strokeWidth="2"/>
              </svg>
            </div>
            <div className="stat-info">
              <span className="stat-label">Active Courses</span>
              <span className="stat-value">{profile?.statistics.activeCourses || 0}</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'}}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" strokeWidth="2"/>
                <polyline points="14 2 14 8 20 8" strokeWidth="2"/>
                <line x1="16" y1="13" x2="8" y2="13" strokeWidth="2" strokeLinecap="round"/>
                <line x1="16" y1="17" x2="8" y2="17" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="stat-info">
              <span className="stat-label">Available Evaluations</span>
              <span className="stat-value">{profile?.statistics.availableEvaluations || 0}</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <button 
            className="btn btn-primary"
            onClick={() => {
              const code = prompt('Enter Course Access Code:');
              if (code) handleJoinCourse(code);
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="12" y1="5" x2="12" y2="19" strokeWidth="2" strokeLinecap="round"/>
              <line x1="5" y1="12" x2="19" y2="12" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Join Course
          </button>
        </div>

        {/* Courses Grid */}
        <div className="section-header">
          <h2>My Courses</h2>
        </div>

        {courses.length === 0 ? (
          <div className="empty-state">
            <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" strokeWidth="2" strokeLinecap="round"/>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" strokeWidth="2"/>
            </svg>
            <h3>No Courses Yet</h3>
            <p>Join your first course using an access code from your teacher</p>
            <button 
              className="btn btn-primary"
              onClick={() => {
                const code = prompt('Enter Course Access Code:');
                if (code) handleJoinCourse(code);
              }}
            >
              Join Course
            </button>
          </div>
        ) : (
          <div className="courses-grid">
            {courses.map(course => (
              <div 
                key={course.courseId} 
                className={`course-card ${course.hasUpcomingEvaluation ? 'has-evaluation' : ''}`}
                onClick={() => navigate(`/student/course/${course.courseId}`)}
              >
                {course.hasUpcomingEvaluation && (
                  <div className="evaluation-badge">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                      <polyline points="12 6 12 12 16 14" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    Upcoming Evaluation
                  </div>
                )}
                
                <div className="course-icon">
                  {course.courseCode.substring(0, 2).toUpperCase()}
                </div>
                
                <h3 className="course-title">{course.courseName}</h3>
                <p className="course-code">{course.courseCode}</p>
                
                <div className="course-footer">
                  <span className="course-students">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" strokeWidth="2"/>
                      <circle cx="9" cy="7" r="4" strokeWidth="2"/>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" strokeWidth="2"/>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" strokeWidth="2"/>
                    </svg>
                    {course.enrolledCount} students
                  </span>
                  <span className={`course-status ${course.isActive ? 'active' : 'inactive'}`}>
                    {course.isActive ? 'Active' : 'Archived'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;