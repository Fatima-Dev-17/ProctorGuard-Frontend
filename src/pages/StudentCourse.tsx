import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { API_BASE_URL, API_ENDPOINTS } from '../utils/config';
import './StudentCourse.css';

interface Evaluation {
  evaluationId: string;
  name: string;
  startTime: number;
  durationMinutes: number;
  weightage: number;
  maxScore: number;
  status: string;
  isActive: boolean;
}

interface Course {
  courseId: string;
  courseCode: string;
  courseName: string;
  enrolledCount: number;
}

const StudentCourse: React.FC = () => {
  const navigate = useNavigate();
  const { courseId } = useParams<{ courseId: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEnterModal, setShowEnterModal] = useState(false);
  const [selectedEval, setSelectedEval] = useState<Evaluation | null>(null);
  const [privateKey, setPrivateKey] = useState('');
  const [userId, setUserId] = useState('');

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if (!storedUserId) {
      navigate('/login');
      return;
    }
    setUserId(storedUserId);
    
    if (courseId) {
      fetchCourseDetails();
      fetchEvaluations();
    }
  }, [courseId, navigate]);

  const fetchCourseDetails = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.GET_STUDENT_COURSES}/${userId}`);
      const data = await response.json();
      if (data.success) {
        const foundCourse = data.data.find((c: Course) => c.courseId === courseId);
        if (foundCourse) {
          setCourse(foundCourse);
        }
      }
    } catch (error) {
      console.error('Error fetching course:', error);
    }
  };

  const fetchEvaluations = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.GET_COURSE_EVALUATIONS}/${courseId}`);
      const data = await response.json();
      if (data.success) {
        setEvaluations(data.data);
      }
    } catch (error) {
      console.error('Error fetching evaluations:', error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIXED: Properly navigate to StudentEvaluation after entering
  const handleEnterEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!privateKey.trim()) {
      alert('Please enter the private key');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ENTER_EVALUATION}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: userId,
          privateKey: privateKey.trim()
        })
      });

      const data = await response.json();
      if (data.success) {
        // ✅ NAVIGATION IS NOW ENABLED
        console.log('✅ Entered evaluation successfully, navigating to evaluation screen...');
        setShowEnterModal(false);
        setPrivateKey('');
        
        // Navigate to the full StudentEvaluation screen with all integrity controls
        navigate(`/student/evaluation/${selectedEval?.evaluationId}`);
      } else {
        alert(data.message || 'Invalid private key');
      }
    } catch (error) {
      console.error('Error entering evaluation:', error);
      alert('Error entering evaluation. Please try again.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'ONGOING': return 'ongoing';
      case 'UPCOMING': return 'upcoming';
      case 'ENDED': return 'completed';
      default: return 'upcoming';
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeRemaining = (startTime: number, durationMinutes: number) => {
    const endTime = startTime + (durationMinutes * 60);
    const now = Math.floor(Date.now() / 1000);
    const remaining = endTime - now;

    if (remaining <= 0) return 'Ended';
    
    const hours = Math.floor(remaining / 3600);
    const minutes = Math.floor((remaining % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    }
    return `${minutes}m remaining`;
  };

  const canEnterEvaluation = (evaluation: Evaluation) => {
    return evaluation.status === 'ONGOING' || evaluation.status === 'UPCOMING';
  };

  if (loading) {
    return (
      <div className="student-course-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading course...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="student-course-container">
      {/* Header */}
      <header className="student-course-header">
        <button className="btn-back" onClick={() => navigate('/student/dashboard')}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M19 12H5M12 19l-7-7 7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back to Dashboard
        </button>
        <div className="header-actions">
          <button className="btn-icon" onClick={() => navigate('/student/profile')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="12" cy="7" r="4" strokeWidth="2"/>
            </svg>
          </button>
        </div>
      </header>

      <div className="student-course-content">
        {/* Course Info Card */}
        <div className="student-course-info-card">
          <div className="course-info-main">
            <div className="course-badge">
              {course?.courseCode.substring(0, 2).toUpperCase()}
            </div>
            <div className="course-details">
              <h1 className="course-name">{course?.courseName}</h1>
              <p className="course-code-text">{course?.courseCode}</p>
            </div>
          </div>
          
          <div className="course-stats">
            <div className="stat-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" strokeWidth="2"/>
                <circle cx="9" cy="7" r="4" strokeWidth="2"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" strokeWidth="2"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75" strokeWidth="2"/>
              </svg>
              <span>{course?.enrolledCount || 0} Students</span>
            </div>
            <div className="stat-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" strokeWidth="2"/>
                <polyline points="14 2 14 8 20 8" strokeWidth="2"/>
              </svg>
              <span>{evaluations.length} Evaluations</span>
            </div>
          </div>
        </div>

        {/* Evaluations Section */}
        <div className="section-header">
          <h2>Evaluations</h2>
        </div>

        {evaluations.length === 0 ? (
          <div className="empty-state">
            <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" strokeWidth="2"/>
              <polyline points="14 2 14 8 20 8" strokeWidth="2"/>
            </svg>
            <h3>No Evaluations Yet</h3>
            <p>Your teacher hasn't created any evaluations for this course yet</p>
          </div>
        ) : (
          <div className="student-evaluations-grid">
            {evaluations.map((evaluation) => (
              <div key={evaluation.evaluationId} className={`student-evaluation-card ${getStatusColor(evaluation.status)}`}>
                <div className="eval-header">
                  <div className="eval-status-badge">
                    {evaluation.status}
                  </div>
                  {evaluation.status === 'ONGOING' && (
                    <div className="eval-live-indicator">
                      <span className="pulse-dot"></span>
                      LIVE
                    </div>
                  )}
                </div>
                
                <h3 className="eval-name">{evaluation.name}</h3>
                
                <div className="eval-info-grid">
                  <div className="eval-info-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                      <polyline points="12 6 12 12 16 14" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    <div>
                      <span className="info-label">Start Time</span>
                      <span className="info-value">{formatDate(evaluation.startTime)}</span>
                    </div>
                  </div>
                  
                  <div className="eval-info-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    <div>
                      <span className="info-label">Duration</span>
                      <span className="info-value">{evaluation.durationMinutes} minutes</span>
                    </div>
                  </div>

                  <div className="eval-info-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeWidth="2" strokeLinecap="round"/>
                      <polyline points="22 4 12 14.01 9 11.01" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    <div>
                      <span className="info-label">Weightage</span>
                      <span className="info-value">{evaluation.weightage}%</span>
                    </div>
                  </div>

                  <div className="eval-info-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" strokeWidth="2"/>
                    </svg>
                    <div>
                      <span className="info-label">Max Score</span>
                      <span className="info-value">{evaluation.maxScore}</span>
                    </div>
                  </div>
                </div>

                {evaluation.status === 'ONGOING' && (
                  <div className="time-remaining">
                    ⏱️ {getTimeRemaining(evaluation.startTime, evaluation.durationMinutes)}
                  </div>
                )}

                <div className="eval-actions">
                  {canEnterEvaluation(evaluation) ? (
                    <button 
                      className="btn btn-primary btn-full"
                      onClick={() => {
                        setSelectedEval(evaluation);
                        setShowEnterModal(true);
                      }}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M13.8 12H3" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                      Enter Evaluation
                    </button>
                  ) : (
                    <button className="btn btn-outline btn-full" disabled>
                      Evaluation Ended
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Enter Evaluation Modal */}
      {showEnterModal && selectedEval && (
        <div className="modal-overlay" onClick={() => setShowEnterModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Enter Evaluation</h2>
              <button 
                className="btn-close"
                onClick={() => setShowEnterModal(false)}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <line x1="18" y1="6" x2="6" y2="18" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="6" y1="6" x2="18" y2="18" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            <div className="modal-eval-info">
              <h3>{selectedEval.name}</h3>
              <p>Duration: {selectedEval.durationMinutes} minutes • Weightage: {selectedEval.weightage}%</p>
            </div>

            <form onSubmit={handleEnterEvaluation} className="modal-form">
              <div className="form-group">
                <label>Private Key *</label>
                <input
                  type="text"
                  value={privateKey}
                  onChange={(e) => setPrivateKey(e.target.value)}
                  placeholder="Enter the private key from your teacher"
                  required
                  autoFocus
                />
                <small>Ask your teacher for the private key to access this evaluation</small>
              </div>

              <div className="warning-box">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" strokeWidth="2"/>
                  <line x1="12" y1="9" x2="12" y2="13" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="12" y1="17" x2="12.01" y2="17" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <div>
                  <strong>⚠️ Important - Integrity Controls Will Be Activated:</strong>
                  <ul>
                    <li>🔒 Fullscreen mode will be enforced</li>
                    <li>🚫 Tab/Window switching will be disabled</li>
                    <li>📝 Only allowed URLs can be accessed</li>
                    <li>📍 Your location may be tracked</li>
                    <li>📸 Screenshots taken for suspicious activity</li>
                    <li>👁️ All activities are monitored and logged</li>
                    <li>🔑 Teacher's exit password required to leave</li>
                  </ul>
                </div>
              </div>

              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn btn-outline"
                  onClick={() => setShowEnterModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Start Evaluation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentCourse;