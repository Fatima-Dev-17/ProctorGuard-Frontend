import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { API_BASE_URL, API_ENDPOINTS } from '../utils/config';
import './TeacherEvaluation.css';

interface Evaluation {
  evaluationId: string;
  courseId: string;
  name: string;
  startTime: number;
  durationMinutes: number;
  weightage: number;
  maxScore: number;
  status: string;
  isActive: boolean;
  privateKey: string;
  exitPassword: string;
}

interface Submission {
  submissionId: string;
  studentId: string;
  score: number;
  submittedAt: number;
  attendanceTime: number;
  isSubmitted: boolean;
  isLate: boolean;
  status: string;
  remarks: string;
}

interface LeaderboardEntry {
  rank: number;
  studentId: string;
  score: number;
  percentage: number;
  submittedAt: number;
  isLate: boolean;
}

type TabType = 'details' | 'edit' | 'submissions' | 'leaderboard';

const TeacherEvaluation: React.FC = () => {
  const navigate = useNavigate();
  const { evaluationId } = useParams<{ evaluationId: string }>();
  const [activeTab, setActiveTab] = useState<TabType>('details');
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [allowedUrls, setAllowedUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState('');
  
  // Edit form state
  const [editName, setEditName] = useState('');
  const [editStartDate, setEditStartDate] = useState('');
  const [editStartTime, setEditStartTime] = useState('');
  const [editDuration, setEditDuration] = useState('');
  const [editWeightage, setEditWeightage] = useState('');
  const [editMaxScore, setEditMaxScore] = useState('');
  const [editExitPassword, setEditExitPassword] = useState('');
  const [editUrls, setEditUrls] = useState('');

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if (!storedUserId) {
      navigate('/login');
      return;
    }
    setUserId(storedUserId);
    
    if (evaluationId) {
      fetchEvaluationDetails();
      fetchAllowedUrls();
    }
  }, [evaluationId, navigate]);

  useEffect(() => {
    if (activeTab === 'submissions') {
      fetchSubmissions();
    } else if (activeTab === 'leaderboard') {
      fetchLeaderboard();
    }
  }, [activeTab]);

  const fetchEvaluationDetails = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.GET_EVALUATION_DETAILS}/${evaluationId}`);
      const data = await response.json();
      if (data.success) {
        setEvaluation(data.data);
        
        // Initialize edit form
        const evals = data.data;
        setEditName(evals.name);
        setEditDuration(evals.durationMinutes.toString());
        setEditWeightage(evals.weightage.toString());
        setEditMaxScore(evals.maxScore.toString());
        setEditExitPassword(evals.exitPassword);
        
        const startDate = new Date(evals.startTime * 1000);
        setEditStartDate(startDate.toISOString().split('T')[0]);
        setEditStartTime(startDate.toTimeString().slice(0, 5));
      }
    } catch (error) {
      console.error('Error fetching evaluation:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllowedUrls = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.GET_WHITELIST}/${evaluationId}`);
      const data = await response.json();
      if (data.success) {
        setAllowedUrls(data.data);
        setEditUrls(data.data.join('\n'));
      }
    } catch (error) {
      console.error('Error fetching URLs:', error);
    }
  };

  const fetchSubmissions = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/evaluation/${evaluationId}/submissions`
      );
      const data = await response.json();
      console.log('Submissions response:', data); 
      if (data.success) {
        setSubmissions(data.data);
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.GET_LEADERBOARD}/${evaluationId}/${userId}`
      );
      const data = await response.json();
      if (data.success) {
        setLeaderboard(data.data);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  };

  const handleUpdateEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!evaluation) return;

    try {
      const startDateTime = new Date(`${editStartDate}T${editStartTime}`);
      const startTimestamp = Math.floor(startDateTime.getTime() / 1000);

      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.UPDATE_EVALUATION}/${evaluationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacherId: userId,
          name: editName,
          startTime: startTimestamp,
          durationMinutes: parseInt(editDuration),
          weightage: parseInt(editWeightage),
          maxScore: parseInt(editMaxScore),
          exitPassword: editExitPassword
        })
      });

      const data = await response.json();
      if (data.success) {
        // Update URLs if changed
        const newUrls = editUrls.split('\n').filter(url => url.trim());
        const oldUrls = allowedUrls;
        
        // Remove old URLs
        for (const url of oldUrls) {
          if (!newUrls.includes(url)) {
            await fetch(`${API_BASE_URL}${API_ENDPOINTS.REMOVE_FROM_WHITELIST}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                teacherId: userId,
                evaluationId: evaluationId,
                url: url
              })
            });
          }
        }
        
        // Add new URLs
        for (const url of newUrls) {
          if (!oldUrls.includes(url.trim())) {
            await fetch(`${API_BASE_URL}${API_ENDPOINTS.ADD_TO_WHITELIST}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                teacherId: userId,
                evaluationId: evaluationId,
                url: url.trim()
              })
            });
          }
        }

        alert('✅ Evaluation updated successfully!');
        fetchEvaluationDetails();
        fetchAllowedUrls();
        setActiveTab('details');
      } else {
        alert(data.message || 'Failed to update evaluation');
      }
    } catch (error) {
      console.error('Error updating evaluation:', error);
      alert('Error updating evaluation');
    }
  };

  const handleGradeSubmission = async (studentId: string, score: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.GRADE_SUBMISSION}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacherId: userId,
          evaluationId: evaluationId,
          studentId: studentId,
          score: score
        })
      });

      const data = await response.json();
      if (data.success) {
        alert('✅ Submission graded successfully!');
        fetchSubmissions();
        if (activeTab === 'leaderboard') {
          fetchLeaderboard();
        }
      } else {
        alert(data.message || 'Failed to grade submission');
      }
    } catch (error) {
      console.error('Error grading submission:', error);
      alert('Error grading submission');
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

  const formatTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    alert(`${label} copied to clipboard!`);
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'ONGOING': return 'status-ongoing';
      case 'UPCOMING': return 'status-upcoming';
      case 'ENDED': return 'status-ended';
      default: return 'status-upcoming';
    }
  };

  const getSubmissionStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'SUBMITTED': return 'sub-submitted';
      case 'SUBMITTED (LATE)': return 'sub-late';
      case 'ATTENDING': return 'sub-attending';
      case 'ABSENT': return 'sub-absent';
      default: return 'sub-attending';
    }
  };

  if (loading) {
    return (
      <div className="eval-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading evaluation...</p>
        </div>
      </div>
    );
  }

  if (!evaluation) {
    return (
      <div className="eval-container">
        <div className="error-message">
          <h3>Evaluation not found</h3>
          <button className="btn btn-primary" onClick={() => navigate(-1)}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="eval-container">
      {/* Header */}
      <header className="eval-header">
        <div className="header-left">
          <button className="btn-back" onClick={() => navigate(-1)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M19 12H5M12 19l-7-7 7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back
          </button>
          <div className="header-info">
            <h1>{evaluation.name}</h1>
            <span className={`status-badge ${getStatusColor(evaluation.status)}`}>
              {evaluation.status}
            </span>
          </div>
        </div>
        <button className="btn-icon" onClick={() => navigate('/teacher/profile')}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="12" cy="7" r="4" strokeWidth="2"/>
          </svg>
        </button>
      </header>

      {/* Tabs */}
      <div className="eval-tabs">
        <button 
          className={`tab ${activeTab === 'details' ? 'active' : ''}`}
          onClick={() => setActiveTab('details')}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10" strokeWidth="2"/>
            <line x1="12" y1="16" x2="12" y2="12" strokeWidth="2" strokeLinecap="round"/>
            <line x1="12" y1="8" x2="12.01" y2="8" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Details
        </button>
        <button 
          className={`tab ${activeTab === 'edit' ? 'active' : ''}`}
          onClick={() => setActiveTab('edit')}
          disabled={evaluation.status === 'ENDED'}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" strokeWidth="2" strokeLinecap="round"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Edit
        </button>
        <button 
          className={`tab ${activeTab === 'submissions' ? 'active' : ''}`}
          onClick={() => setActiveTab('submissions')}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" strokeWidth="2"/>
            <polyline points="14 2 14 8 20 8" strokeWidth="2"/>
            <line x1="16" y1="13" x2="8" y2="13" strokeWidth="2" strokeLinecap="round"/>
            <line x1="16" y1="17" x2="8" y2="17" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Submissions
        </button>
        <button 
          className={`tab ${activeTab === 'leaderboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('leaderboard')}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Leaderboard
        </button>
      </div>

      {/* Tab Content */}
      <div className="eval-content">
        {/* DETAILS TAB */}
        {activeTab === 'details' && (
          <div className="details-container">
            <div className="details-grid">
              {/* Main Info Card */}
              <div className="info-card">
                <h3>Evaluation Information</h3>
                <div className="info-list">
                  <div className="info-item">
                    <span className="info-label">Evaluation Name</span>
                    <span className="info-value">{evaluation.name}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Status</span>
                    <span className={`info-value ${getStatusColor(evaluation.status)}`}>
                      {evaluation.status}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Start Time</span>
                    <span className="info-value">{formatDate(evaluation.startTime)}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Duration</span>
                    <span className="info-value">{evaluation.durationMinutes} minutes</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Weightage</span>
                    <span className="info-value">{evaluation.weightage}%</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Max Score</span>
                    <span className="info-value">{evaluation.maxScore} points</span>
                  </div>
                </div>
              </div>

              {/* Credentials Card */}
              <div className="info-card">
                <h3>Access Credentials</h3>
                <div className="credential-item">
                  <div className="credential-info">
                    <span className="credential-label">Private Key</span>
                    <span className="credential-value">{evaluation.privateKey}</span>
                  </div>
                  <button 
                    className="btn-copy-small"
                    onClick={() => copyToClipboard(evaluation.privateKey, 'Private Key')}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" strokeWidth="2"/>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" strokeWidth="2"/>
                    </svg>
                  </button>
                </div>
                <div className="credential-item">
                  <div className="credential-info">
                    <span className="credential-label">Exit Password</span>
                    <span className="credential-value">{evaluation.exitPassword}</span>
                  </div>
                  <button 
                    className="btn-copy-small"
                    onClick={() => copyToClipboard(evaluation.exitPassword, 'Exit Password')}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" strokeWidth="2"/>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" strokeWidth="2"/>
                    </svg>
                  </button>
                </div>
                <div className="info-note">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                    <line x1="12" y1="16" x2="12" y2="12" strokeWidth="2" strokeLinecap="round"/>
                    <line x1="12" y1="8" x2="12.01" y2="8" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  <span>Students need the Private Key to enter the evaluation</span>
                </div>
              </div>

              {/* Allowed URLs Card */}
              <div className="info-card full-width">
                <h3>Allowed URLs</h3>
                {allowedUrls.length === 0 ? (
                  <p className="empty-text">No URL restrictions configured</p>
                ) : (
                  <div className="urls-list">
                    {allowedUrls.map((url, index) => (
                      <div key={index} className="url-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" strokeWidth="2" strokeLinecap="round"/>
                          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                        <span>{url}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Statistics Card */}
              <div className="info-card full-width">
                <h3>Statistics</h3>
                <div className="stats-grid">
                  <div className="stat-box">
                    <div className="stat-value">{submissions.length}</div>
                    <div className="stat-label">Total Entries</div>
                  </div>
                  <div className="stat-box">
                    <div className="stat-value">
                      {submissions.filter(s => s.isSubmitted).length}
                    </div>
                    <div className="stat-label">Submitted</div>
                  </div>
                  <div className="stat-box">
                    <div className="stat-value">
                      {submissions.filter(s => !s.isSubmitted && s.attendanceTime > 0).length}
                    </div>
                    <div className="stat-label">In Progress</div>
                  </div>
                  <div className="stat-box">
                    <div className="stat-value">
                      {submissions.length > 0 
                        ? Math.round(submissions.reduce((sum, s) => sum + s.score, 0) / submissions.filter(s => s.isSubmitted).length || 0)
                        : 0}
                    </div>
                    <div className="stat-label">Avg Score</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* EDIT TAB */}
        {activeTab === 'edit' && (
          <div className="edit-container">
            <form onSubmit={handleUpdateEvaluation} className="edit-form">
              <div className="form-section">
                <h3>Basic Information</h3>
                <div className="form-group">
                  <label>Evaluation Name *</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Start Date *</label>
                    <input
                      type="date"
                      value={editStartDate}
                      onChange={(e) => setEditStartDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Start Time *</label>
                    <input
                      type="time"
                      value={editStartTime}
                      onChange={(e) => setEditStartTime(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Duration (minutes) *</label>
                    <input
                      type="number"
                      value={editDuration}
                      onChange={(e) => setEditDuration(e.target.value)}
                      min="1"
                      max="720"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Weightage (%) *</label>
                    <input
                      type="number"
                      value={editWeightage}
                      onChange={(e) => setEditWeightage(e.target.value)}
                      min="0"
                      max="100"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Max Score *</label>
                    <input
                      type="number"
                      value={editMaxScore}
                      onChange={(e) => setEditMaxScore(e.target.value)}
                      min="1"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Security</h3>
                <div className="form-group">
                  <label>Exit Password *</label>
                  <input
                    type="text"
                    value={editExitPassword}
                    onChange={(e) => setEditExitPassword(e.target.value)}
                    minLength={4}
                    required
                  />
                  <span className="form-hint">Minimum 4 characters</span>
                </div>
              </div>

              <div className="form-section">
                <h3>Allowed URLs</h3>
                <div className="form-group">
                  <label>URLs (one per line)</label>
                  <textarea
                    value={editUrls}
                    onChange={(e) => setEditUrls(e.target.value)}
                    placeholder="https://leetcode.com&#10;https://hackerrank.com"
                    rows={6}
                  />
                </div>
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn btn-outline"
                  onClick={() => setActiveTab('details')}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        )}

        {/* SUBMISSIONS TAB */}
        {activeTab === 'submissions' && (
          <div className="submissions-container">
            <div className="submissions-header">
              <h3>All Submissions ({submissions.length})</h3>
              <button className="btn btn-outline" onClick={fetchSubmissions}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <polyline points="23 4 23 10 17 10" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Refresh
              </button>
            </div>

            {submissions.length === 0 ? (
              <div className="empty-state">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" strokeWidth="2"/>
                  <polyline points="14 2 14 8 20 8" strokeWidth="2"/>
                </svg>
                <h4>No Submissions Yet</h4>
                <p>Students haven't started this evaluation</p>
              </div>
            ) : (
              <div className="submissions-table">
                <table>
                  <thead>
                    <tr>
                      <th>Student ID</th>
                      <th>Status</th>
                      <th>Score</th>
                      <th>Attended At</th>
                      <th>Submitted At</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.map((submission) => (
                      <tr key={submission.submissionId}>
                        <td>
                          <div className="student-cell">
                            <div className="student-avatar">
                              {submission.studentId.substring(0, 2).toUpperCase()}
                            </div>
                            <span>{submission.studentId}</span>
                          </div>
                        </td>
                        <td>
                          <span className={`status-pill ${getSubmissionStatusColor(submission.status)}`}>
                            {submission.status}
                          </span>
                        </td>
                        <td>
                          <strong>{submission.score}</strong> / {evaluation.maxScore}
                        </td>
                        <td>{formatTime(submission.attendanceTime)}</td>
                        <td>
                          {submission.isSubmitted 
                            ? formatTime(submission.submittedAt)
                            : '-'}
                        </td>
                        <td>
                          {submission.isSubmitted && (
                            <button 
                              className="btn-action"
                              onClick={() => {
                                const newScore = prompt('Enter score:', submission.score.toString());
                                if (newScore !== null) {
                                  handleGradeSubmission(submission.studentId, parseInt(newScore));
                                }
                              }}
                            >
                              Grade
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* LEADERBOARD TAB */}
        {activeTab === 'leaderboard' && (
          <div className="leaderboard-container">
            <div className="leaderboard-header">
              <h3>Top Performers</h3>
              <button className="btn btn-outline" onClick={fetchLeaderboard}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <polyline points="23 4 23 10 17 10" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Refresh
              </button>
            </div>

            {leaderboard.length === 0 ? (
              <div className="empty-state">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <h4>No Rankings Available</h4>
                <p>Students need to submit their work first</p>
              </div>
            ) : (
              <div className="leaderboard-grid">
                {leaderboard.map((entry, index) => (
                  <div 
                    key={entry.studentId} 
                    className={`leaderboard-card rank-${entry.rank <= 3 ? entry.rank : 'other'}`}
                  >
                    <div className="rank-badge">
                      {entry.rank === 1 && '🥇'}
                      {entry.rank === 2 && '🥈'}
                      {entry.rank === 3 && '🥉'}
                      {entry.rank > 3 && `#${entry.rank}`}
                    </div>
                    <div className="leaderboard-info">
                      <div className="student-name">{entry.studentId}</div>
                      <div className="score-info">
                        <span className="score">{entry.score}</span>
                        <span className="percentage">({entry.percentage.toFixed(1)}%)</span>
                      </div>
                      <div className="submission-time">
                        {formatDate(entry.submittedAt)}
                        {entry.isLate && <span className="late-badge">Late</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherEvaluation;