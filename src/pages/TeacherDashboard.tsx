import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL, API_ENDPOINTS } from '../utils/config';
import './TeacherDashboard.css';

interface Course {
  courseId: string;
  courseCode: string;
  courseName: string;
  accessCode: string;
  enrolledCount: number;
  isActive: boolean;
}

interface UserProfile {
  userId: string;
  email: string;
  fullName: string;
  role: string;
  statistics: {
    totalCourses: number;
    activeCourses: number;
    totalEvaluations: number;
  };
}

const TeacherDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showArchived, setShowArchived] = useState(false);
  const [showCreateCourse, setShowCreateCourse] = useState(false);
  const [userId, setUserId] = useState('');

  // Form states
  const [courseCode, setCourseCode] = useState('');
  const [courseName, setCourseName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if (!storedUserId) {
      navigate('/login');
      return;
    }
    setUserId(storedUserId);
    
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
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.GET_TEACHER_COURSES}/${uid}`);
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

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.CREATE_COURSE}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacherId: userId,
          courseCode,
          courseName,
          description
        })
      });
      const data = await response.json();
      if (data.success) {
        fetchCourses(userId);
        setShowCreateCourse(false);
        setCourseCode('');
        setCourseName('');
        setDescription('');
        alert('Course created successfully!');
      } else {
        alert(data.message || 'Failed to create course');
      }
    } catch (error) {
      console.error('Error creating course:', error);
      alert('Error creating course. Please try again.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('userRole');
    navigate('/');
  };

  const activeCourses = courses.filter(c => c.isActive);
  const archivedCourses = courses.filter(c => !c.isActive);
  const displayedCourses = showArchived ? archivedCourses : activeCourses;

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
          <span className="role-badge">Teacher</span>
        </div>
        <div className="header-right">
          <button 
            className="btn-icon"
            onClick={() => navigate('/teacher/profile')}
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
              <span className="stat-label">Total Courses</span>
              <span className="stat-value">{profile?.statistics.totalCourses || 0}</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)'}}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white">
                <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                <polyline points="12 6 12 12 16 14" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="stat-info">
              <span className="stat-label">Active Courses</span>
              <span className="stat-value">{profile?.statistics.activeCourses || 0}</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'}}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" strokeWidth="2"/>
                <polyline points="14 2 14 8 20 8" strokeWidth="2"/>
              </svg>
            </div>
            <div className="stat-info">
              <span className="stat-label">Total Evaluations</span>
              <span className="stat-value">{profile?.statistics.totalEvaluations || 0}</span>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="action-bar">
          <div className="action-left">
            <button 
              className={`btn ${!showArchived ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setShowArchived(false)}
            >
              Active Courses ({activeCourses.length})
            </button>
            <button 
              className={`btn ${showArchived ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setShowArchived(true)}
            >
              Archived ({archivedCourses.length})
            </button>
          </div>
          <button 
            className="btn btn-primary"
            onClick={() => setShowCreateCourse(true)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="12" y1="5" x2="12" y2="19" strokeWidth="2" strokeLinecap="round"/>
              <line x1="5" y1="12" x2="19" y2="12" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Create Course
          </button>
        </div>

        {/* Create Course Modal */}
        {showCreateCourse && (
          <div className="modal-overlay" onClick={() => setShowCreateCourse(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Create New Course</h2>
                <button 
                  className="btn-close"
                  onClick={() => setShowCreateCourse(false)}
                >
                  ×
                </button>
              </div>
              <form onSubmit={handleCreateCourse} className="modal-form">
                <div className="form-group">
                  <label>Course Code</label>
                  <input
                    type="text"
                    value={courseCode}
                    onChange={(e) => setCourseCode(e.target.value)}
                    placeholder="e.g., CS101"
                    required
                  />
                  <span className="form-hint">Must contain letters and numbers</span>
                </div>
                <div className="form-group">
                  <label>Course Name</label>
                  <input
                    type="text"
                    value={courseName}
                    onChange={(e) => setCourseName(e.target.value)}
                    placeholder="e.g., Data Structures"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Course description..."
                    rows={4}
                  />
                </div>
                <div className="modal-actions">
                  <button 
                    type="button" 
                    className="btn btn-outline"
                    onClick={() => setShowCreateCourse(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Create Course
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Courses Grid */}
        {displayedCourses.length === 0 ? (
          <div className="empty-state">
            <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" strokeWidth="2" strokeLinecap="round"/>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" strokeWidth="2"/>
            </svg>
            <h3>{showArchived ? 'No Archived Courses' : 'No Active Courses'}</h3>
            <p>{showArchived ? 'Your archived courses will appear here' : 'Create your first course to get started'}</p>
            {!showArchived && (
              <button 
                className="btn btn-primary"
                onClick={() => setShowCreateCourse(true)}
              >
                Create Course
              </button>
            )}
          </div>
        ) : (
          <div className="courses-grid">
            {displayedCourses.map(course => (
              <div 
                key={course.courseId} 
                className="course-card"
                onClick={() => navigate(`/teacher/course/${course.courseId}`)}
              >
                <div className="course-header">
                  <div className="course-icon">
                    {course.courseCode.substring(0, 2).toUpperCase()}
                  </div>
                  <span className={`course-status ${course.isActive ? 'active' : 'inactive'}`}>
                    {course.isActive ? 'Active' : 'Archived'}
                  </span>
                </div>
                
                <h3 className="course-title">{course.courseName}</h3>
                <p className="course-code">{course.courseCode}</p>
                
                <div className="access-code-section">
                  <span className="access-label">Access Code:</span>
                  <code className="access-code">{course.accessCode}</code>
                </div>
                
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
                  <button 
                    className="btn-secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/teacher/course/${course.courseId}`);
                    }}
                  >
                    Manage →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;