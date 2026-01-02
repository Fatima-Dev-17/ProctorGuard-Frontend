import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { API_BASE_URL, API_ENDPOINTS } from '../utils/config';
import './TeacherCourse.css';

interface Evaluation {
  evaluationId: string;
  name: string;
  startTime: number;
  durationMinutes: number;
  weightage: number;
  maxScore: number;
  status: string;
  isActive: boolean;
  privateKey?: string;
  exitPassword?: string;
}

interface Course {
  courseId: string;
  courseCode: string;
  courseName: string;
  description?: string;
  accessCode: string;
  enrolledCount: number;
}

const TeacherCourse: React.FC = () => {
  const navigate = useNavigate();
  const { courseId } = useParams<{ courseId: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateEval, setShowCreateEval] = useState(false);
  const [userId, setUserId] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [createdPrivateKey, setCreatedPrivateKey] = useState('');
  const [createdExitPassword, setCreatedExitPassword] = useState('');

  // Form state
  const [evalName, setEvalName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [duration, setDuration] = useState('60');
  const [weightage, setWeightage] = useState('20');
  const [maxScore, setMaxScore] = useState('100');
  const [allowedUrls, setAllowedUrls] = useState('');

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
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.GET_TEACHER_COURSES}/${userId}`);
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

  const handleCreateEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const startDateTime = new Date(`${startDate}T${startTime}`);
      const startTimeUnix = Math.floor(startDateTime.getTime() / 1000);

      const requestBody = {
        teacherId: userId,
        courseId: courseId,
        name: evalName,
        startTime: startTimeUnix,
        durationMinutes: parseInt(duration),
        weightage: parseInt(weightage),
        maxScore: parseInt(maxScore),
      };

      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.CREATE_EVALUATION}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      
      if (data.success) {
        setCreatedPrivateKey(data.data.privateKey);
        setCreatedExitPassword(data.data.exitPassword);
        setModalMessage('Evaluation created successfully!');
        setShowSuccessModal(true);
        setShowCreateEval(false);
        
        // Reset form
        setEvalName('');
        setStartDate('');
        setStartTime('');
        setDuration('60');
        setWeightage('20');
        setMaxScore('100');
        setAllowedUrls('');
        
        // Refresh evaluations list
        fetchEvaluations();
      } else {
        alert('Error: ' + data.message);
      }
    } catch (error) {
      console.error('Error creating evaluation:', error);
      alert('Failed to create evaluation');
    }
  };

  // ✅ DELETE EVALUATION
  const handleDeleteEvaluation = async (evaluationId: string, evalName: string) => {
    if (!window.confirm(`Are you sure you want to delete "${evalName}"?\n\nThis action cannot be undone.`)) {
      return;
    }

    try {
      console.log('Deleting evaluation:', evaluationId);
      
      const response = await fetch(`${API_BASE_URL}/api/evaluations/${evaluationId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teacherId: userId })
      });

      const data = await response.json();
      
      if (data.success) {
        alert('✅ Evaluation deleted successfully!');
        // Refresh evaluations list
        fetchEvaluations();
      } else {
        alert('❌ Error: ' + data.message);
      }
    } catch (error) {
      console.error('Error deleting evaluation:', error);
      alert('❌ Failed to delete evaluation. Please try again.');
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ONGOING': return 'status-active';
      case 'UPCOMING': return 'status-upcoming';
      case 'ENDED': return 'status-ended';
      default: return '';
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="teacher-course-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  return (
    <div className="teacher-course-container">
      <header className="course-header">
        <div className="header-left">
          <button className="btn-back" onClick={() => navigate('/teacher/dashboard')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M19 12H5M12 19l-7-7 7-7" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
          <h1 className="header-title">Course Details</h1>
        </div>
        <div className="header-right">
          <button className="btn-icon" title="Course Settings">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="3" strokeWidth="2"/>
              <path d="M12 1v6m0 6v6m0-6h6m-6 0H6" strokeWidth="2"/>
            </svg>
          </button>
        </div>
      </header>

      <div className="course-content">
        {/* Course Info Card */}
        <div className="course-info-card">
          <div className="course-info-main">
            <div className="course-badge">
              {course?.courseCode?.substring(0, 2).toUpperCase() || 'CS'}
            </div>
            <div className="course-details">
              <h1 className="course-name">{course?.courseName || 'Course Name'}</h1>
              <p className="course-code-text">{course?.courseCode || 'COURSE101'}</p>
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
            <div className="stat-item access-code-display">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" strokeWidth="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4" strokeWidth="2"/>
              </svg>
              <span className="access-label">Access Code:</span>
              <span className="access-code-value">{course?.accessCode || '000000'}</span>
              <button className="btn-copy-code" onClick={() => copyToClipboard(course?.accessCode || '')}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" strokeWidth="2"/>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" strokeWidth="2"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Evaluations Section */}
        <div className="section-header">
          <h2 className="section-title">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" strokeWidth="2"/>
              <polyline points="14 2 14 8 20 8" strokeWidth="2"/>
              <line x1="16" y1="13" x2="8" y2="13" strokeWidth="2"/>
              <line x1="16" y1="17" x2="8" y2="17" strokeWidth="2"/>
              <polyline points="10 9 9 9 8 9" strokeWidth="2"/>
            </svg>
            Evaluations
          </h2>
          <button className="btn-primary" onClick={() => setShowCreateEval(true)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="12" y1="5" x2="12" y2="19" strokeWidth="2"/>
              <line x1="5" y1="12" x2="19" y2="12" strokeWidth="2"/>
            </svg>
            Create Evaluation
          </button>
        </div>

        {evaluations.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeOpacity="0.3">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" strokeWidth="2"/>
                <polyline points="14 2 14 8 20 8" strokeWidth="2"/>
              </svg>
            </div>
            <h3>No Evaluations Yet</h3>
            <p>Create your first evaluation to get started with online proctoring</p>
            <button className="btn-primary" onClick={() => setShowCreateEval(true)}>
              Create First Evaluation
            </button>
          </div>
        ) : (
          <div className="evaluations-grid">
            {evaluations.map((evaluation) => (
              <div key={evaluation.evaluationId} className="evaluation-card">
                <div className="evaluation-status-header">
                  <span className={`status-badge ${getStatusColor(evaluation.status)}`}>
                    {evaluation.status}
                  </span>
                  {/* ✅ DELETE BUTTON */}
                  <button 
                    className="btn-delete-eval" 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteEvaluation(evaluation.evaluationId, evaluation.name);
                    }}
                    title="Delete Evaluation"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <polyline points="3 6 5 6 21 6" strokeWidth="2"/>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" strokeWidth="2"/>
                      <line x1="10" y1="11" x2="10" y2="17" strokeWidth="2"/>
                      <line x1="14" y1="11" x2="14" y2="17" strokeWidth="2"/>
                    </svg>
                  </button>
                </div>

                <h3 className="eval-name">{evaluation.name}</h3>

                <div className="evaluation-details">
                  <div className="detail-row">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                      <polyline points="12 6 12 12 16 14" strokeWidth="2"/>
                    </svg>
                    <span>{formatDate(evaluation.startTime)}</span>
                  </div>
                  <div className="detail-row">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M12 2v20M2 12h20" strokeWidth="2"/>
                    </svg>
                    <span>{evaluation.durationMinutes} minutes</span>
                  </div>
                </div>

                <div className="evaluation-meta">
                  <span>Weight: {evaluation.weightage}%</span>
                  <span>Max: {evaluation.maxScore}</span>
                </div>

                <button 
                  className="btn-details" 
                  onClick={() => navigate(`/teacher/evaluation/${evaluation.evaluationId}`)}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                    <circle cx="12" cy="12" r="3" fill="currentColor"/>
                  </svg>
                  Details
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Evaluation Modal */}
      {showCreateEval && (
        <div className="modal-overlay" onClick={() => setShowCreateEval(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New Evaluation</h2>
              <button className="btn-close" onClick={() => setShowCreateEval(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <line x1="18" y1="6" x2="6" y2="18" strokeWidth="2"/>
                  <line x1="6" y1="6" x2="18" y2="18" strokeWidth="2"/>
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreateEvaluation} className="modal-form">
              <div className="form-group">
                <label>Evaluation Name *</label>
                <input
                  type="text"
                  value={evalName}
                  onChange={(e) => setEvalName(e.target.value)}
                  placeholder="e.g., Midterm Exam"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Start Date *</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Start Time *</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Duration (minutes) *</label>
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    min="1"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Weightage (%) *</label>
                  <input
                    type="number"
                    value={weightage}
                    onChange={(e) => setWeightage(e.target.value)}
                    min="0"
                    max="100"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Max Score *</label>
                  <input
                    type="number"
                    value={maxScore}
                    onChange={(e) => setMaxScore(e.target.value)}
                    min="1"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Allowed URLs (one per line)</label>
                <textarea
                  value={allowedUrls}
                  onChange={(e) => setAllowedUrls(e.target.value)}
                  placeholder="https://example.com&#10;https://another-site.com"
                  rows={4}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowCreateEval(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create Evaluation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="modal-overlay" onClick={() => setShowSuccessModal(false)}>
          <div className="modal-content modal-success" onClick={(e) => e.stopPropagation()}>
            <div className="success-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeWidth="2"/>
                <polyline points="22 4 12 14.01 9 11.01" strokeWidth="2"/>
              </svg>
            </div>
            <h2>{modalMessage}</h2>
            <div className="credentials-display">
              <div className="credential-item">
                <label>Private Key:</label>
                <div className="credential-value">
                  <code>{createdPrivateKey}</code>
                  <button onClick={() => copyToClipboard(createdPrivateKey)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" strokeWidth="2"/>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" strokeWidth="2"/>
                    </svg>
                  </button>
                </div>
              </div>
              <div className="credential-item">
                <label>Exit Password:</label>
                <div className="credential-value">
                  <code>{createdExitPassword}</code>
                  <button onClick={() => copyToClipboard(createdExitPassword)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" strokeWidth="2"/>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" strokeWidth="2"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            <button className="btn-primary" onClick={() => setShowSuccessModal(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherCourse;