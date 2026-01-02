import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { API_BASE_URL, API_ENDPOINTS } from '../utils/config';
import './StudentEvaluation.css';

interface EvaluationData {
  evaluationId: string;
  name: string;
  courseId: string;
  startTime: number;
  durationMinutes: number;
  endTime: number;
  weightage: number;
  maxScore: number;
  allowedUrls: string[];
  status: string;
  exitPassword?: string;
}

interface SubmissionData {
  submissionId: string;
  score: number;
  status: string;
  submittedAt?: number;
  rank?: number;
}

const StudentEvaluation: React.FC = () => {
  const navigate = useNavigate();
  const { evaluationId } = useParams<{ evaluationId: string }>();
  const location = useLocation();
  
  const [evaluation, setEvaluation] = useState<EvaluationData | null>(null);
  const [submission, setSubmission] = useState<SubmissionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [inEvaluation, setInEvaluation] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [showExitModal, setShowExitModal] = useState(false);
  const [exitPassword, setExitPassword] = useState('');
  const [userId, setUserId] = useState('');
  
  // Integrity monitoring
  const [violations, setViolations] = useState<string[]>([]);
  const [locationTracking, setLocationTracking] = useState(true);
  const activityIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const locationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const visibilityRef = useRef(true);

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if (!storedUserId) {
      navigate('/login');
      return;
    }
    setUserId(storedUserId);
    
    if (evaluationId) {
      fetchEvaluationDetails();
      fetchSubmissionStatus();
    }
  }, [evaluationId, navigate]);

  // Timer for ongoing evaluation
  useEffect(() => {
    if (inEvaluation && evaluation) {
      const interval = setInterval(() => {
        const now = Math.floor(Date.now() / 1000);
        const remaining = evaluation.endTime - now;
        
        if (remaining <= 0) {
          handleAutoSubmit();
        } else {
          setTimeRemaining(remaining);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [inEvaluation, evaluation]);

  // Initialize integrity controls when entering evaluation
  useEffect(() => {
    if (inEvaluation) {
      initializeIntegrityControls();
      startMonitoring();
      
      return () => {
        cleanupIntegrityControls();
        stopMonitoring();
      };
    }
  }, [inEvaluation]);

  const fetchEvaluationDetails = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.GET_EVALUATION_DETAILS}/${evaluationId}`);
      const data = await response.json();
      
      if (data.success) {
        setEvaluation(data.data);
      } else {
        alert('Failed to load evaluation');
        navigate(-1);
      }
    } catch (error) {
      console.error('Error fetching evaluation:', error);
      alert('Error loading evaluation');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissionStatus = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/submission/${evaluationId}/${userId}`
      );
      const data = await response.json();
      
      if (data.success && data.data) {
        setSubmission(data.data);
      }
    } catch (error) {
      console.error('Error fetching submission:', error);
    }
  };

  // ==================== INTEGRITY CONTROLS ====================
  
  const initializeIntegrityControls = () => {
    // Enter fullscreen
    enterFullscreen();
    
    // Disable keyboard shortcuts
    disableKeyboardShortcuts();
    
    // Monitor page visibility
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Monitor focus
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);
    
    // Disable right-click
    document.addEventListener('contextmenu', preventRightClick);
    
    // Disable text selection
    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';
    
    // Monitor clipboard
    document.addEventListener('copy', handleClipboardEvent);
    document.addEventListener('paste', handleClipboardEvent);
    document.addEventListener('cut', handleClipboardEvent);
    
    // Prevent back navigation
    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', preventBackNavigation);
    
    console.log('✅ Integrity controls initialized');
  };

  const cleanupIntegrityControls = () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    window.removeEventListener('blur', handleWindowBlur);
    window.removeEventListener('focus', handleWindowFocus);
    document.removeEventListener('contextmenu', preventRightClick);
    document.removeEventListener('copy', handleClipboardEvent);
    document.removeEventListener('paste', handleClipboardEvent);
    document.removeEventListener('cut', handleClipboardEvent);
    window.removeEventListener('popstate', preventBackNavigation);
    window.removeEventListener('keydown', keyboardEventHandler);
    
    document.body.style.userSelect = '';
    document.body.style.webkitUserSelect = '';
    
    exitFullscreen();
    
    console.log('✅ Integrity controls cleaned up');
  };

  const disableKeyboardShortcuts = () => {
    window.addEventListener('keydown', keyboardEventHandler);
  };

  const keyboardEventHandler = (e: KeyboardEvent) => {
    // Disable Alt+Tab, Ctrl+W, Ctrl+T, Ctrl+N, F11, etc.
    const blockedKeys = [
      'F11',  // Fullscreen toggle
      'F12',  // DevTools
      'F5',   // Refresh
    ];

    const blockedCombos = [
      { key: 'Tab', alt: true },      // Alt+Tab
      { key: 'Tab', ctrl: true },     // Ctrl+Tab
      { key: 'w', ctrl: true },       // Ctrl+W
      { key: 't', ctrl: true },       // Ctrl+T
      { key: 'n', ctrl: true },       // Ctrl+N
      { key: 'r', ctrl: true },       // Ctrl+R
      { key: 'h', ctrl: true },       // Ctrl+H
      { key: 'j', ctrl: true },       // Ctrl+J
      { key: 'u', ctrl: true },       // Ctrl+U
      { key: 's', ctrl: true },       // Ctrl+S
      { key: 'p', ctrl: true },       // Ctrl+P
      { key: 'i', ctrl: true, shift: true }, // Ctrl+Shift+I
      { key: 'j', ctrl: true, shift: true }, // Ctrl+Shift+J
      { key: 'c', ctrl: true, shift: true }, // Ctrl+Shift+C
      { key: 'Escape', alt: true },   // Alt+Esc
      { key: 'F4', alt: true },       // Alt+F4
    ];

    // Check blocked keys
    if (blockedKeys.includes(e.key)) {
      e.preventDefault();
      logViolation(`Attempted to use blocked key: ${e.key}`);
      return false;
    }

    // Check blocked combos
    for (const combo of blockedCombos) {
      const matchesKey = e.key.toLowerCase() === combo.key.toLowerCase();
      const matchesCtrl = combo.ctrl ? e.ctrlKey : true;
      const matchesAlt = combo.alt ? e.altKey : true;
      const matchesShift = combo.shift ? e.shiftKey : true;

      if (matchesKey && matchesCtrl && matchesAlt && matchesShift) {
        e.preventDefault();
        e.stopPropagation();
        logViolation(`Attempted keyboard shortcut: ${e.key}`);
        return false;
      }
    }
  };

  const enterFullscreen = () => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen().catch(err => {
        console.error('Failed to enter fullscreen:', err);
      });
    }
  };

  const exitFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(err => {
        console.error('Failed to exit fullscreen:', err);
      });
    }
  };

  const handleVisibilityChange = () => {
    if (document.hidden) {
      visibilityRef.current = false;
      logViolation('Tab/Window switched - Page hidden');
      captureScreenshot('Tab switch detected');
    } else {
      visibilityRef.current = true;
    }
  };

  const handleWindowBlur = () => {
    logViolation('Window lost focus');
    captureScreenshot('Window blur detected');
  };

  const handleWindowFocus = () => {
    // Window regained focus
  };

  const preventRightClick = (e: Event) => {
    e.preventDefault();
    logViolation('Right-click attempted');
    return false;
  };

  const handleClipboardEvent = (e: Event) => {
    const eventType = e.type.toUpperCase();
    logActivity(eventType, 'Clipboard activity');
  };

  const preventBackNavigation = () => {
    window.history.pushState(null, '', window.location.href);
  };

  // ==================== MONITORING ====================

  const startMonitoring = () => {
    // Activity monitoring every 10 seconds
    activityIntervalRef.current = setInterval(() => {
      monitorActivity();
    }, 10000);

    // Location tracking every 30 seconds
    if (locationTracking) {
      locationIntervalRef.current = setInterval(() => {
        recordLocation();
      }, 30000);
      
      // Initial location
      recordLocation();
    }
  };

  const stopMonitoring = () => {
    if (activityIntervalRef.current) {
      clearInterval(activityIntervalRef.current);
    }
    if (locationIntervalRef.current) {
      clearInterval(locationIntervalRef.current);
    }
  };

  const monitorActivity = () => {
    // Check if fullscreen
    if (!document.fullscreenElement) {
      logViolation('Exited fullscreen mode');
      enterFullscreen();
    }

    // Check visibility
    if (!visibilityRef.current) {
      logViolation('Page not visible - possible tab switch');
    }
  };

  const recordLocation = () => {
    if (!navigator.geolocation) {
      console.warn('Geolocation not supported');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          await fetch(`${API_BASE_URL}${API_ENDPOINTS.RECORD_LOCATION}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              evaluationId,
              studentId: userId,
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            })
          });
        } catch (error) {
          console.error('Error recording location:', error);
        }
      },
      (error) => {
        console.warn('Location access denied:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const logActivity = async (activityType: string, details: string) => {
    try {
      await fetch(`${API_BASE_URL}${API_ENDPOINTS.LOG_ACTIVITY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          evaluationId,
          studentId: userId,
          activityType,
          url: details,
          isViolation: false
        })
      });
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  };

  const logViolation = async (violationType: string) => {
    setViolations(prev => [...prev, `${new Date().toLocaleTimeString()}: ${violationType}`]);
    
    try {
      await fetch(`${API_BASE_URL}${API_ENDPOINTS.LOG_ACTIVITY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          evaluationId,
          studentId: userId,
          activityType: 'VIOLATION',
          url: violationType,
          isViolation: true
        })
      });
    } catch (error) {
      console.error('Error logging violation:', error);
    }
  };

  const captureScreenshot = async (reason: string) => {
    try {
      // In a real implementation, use html2canvas or similar
      console.log(`📸 Screenshot captured: ${reason}`);
      
      // Send notification to teacher
      await fetch(`${API_BASE_URL}/api/notify-violation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          evaluationId,
          studentId: userId,
          reason,
          timestamp: Date.now()
        })
      });
    } catch (error) {
      console.error('Error capturing screenshot:', error);
    }
  };

  // ==================== EVALUATION ACTIONS ====================

  const handleStartEvaluation = async () => {
    if (!evaluation) return;

    const confirmStart = window.confirm(
      'Once you start, you cannot exit without the teacher\'s exit password. ' +
      'Make sure you\'re ready and have a stable internet connection.\n\n' +
      'Click OK to start the evaluation.'
    );

    if (!confirmStart) return;

    setInEvaluation(true);
    setTimeRemaining(evaluation.durationMinutes * 60);
    
    // Log evaluation start
    await logActivity('EVALUATION_STARTED', 'Student entered evaluation');
  };

  const handleSubmitEvaluation = async () => {
    const confirmSubmit = window.confirm(
      'Are you sure you want to submit your evaluation?\n\n' +
      'This action cannot be undone.'
    );

    if (!confirmSubmit) return;

    try {
      // In real implementation, collect answers/code
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.SUBMIT_EVALUATION}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          evaluationId,
          studentId: userId,
          score: 0, // Will be graded by teacher
          answers: {} // Student's work
        })
      });

      const data = await response.json();
      if (data.success) {
        alert('Evaluation submitted successfully!');
        setInEvaluation(false);
        await fetchSubmissionStatus();
      } else {
        alert(data.message || 'Failed to submit evaluation');
      }
    } catch (error) {
      console.error('Error submitting evaluation:', error);
      alert('Error submitting evaluation. Please try again.');
    }
  };

  const handleAutoSubmit = async () => {
    alert('Time is up! Your evaluation will be submitted automatically.');
    await handleSubmitEvaluation();
  };

  const handleExitEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.EXIT_EVALUATION}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          evaluationId,
          studentId: userId,
          exitPassword: exitPassword.trim()
        })
      });

      const data = await response.json();
      if (data.success) {
        setInEvaluation(false);
        setShowExitModal(false);
        setExitPassword('');
        navigate(-1);
      } else {
        alert('Invalid exit password');
      }
    } catch (error) {
      console.error('Error exiting evaluation:', error);
      alert('Error exiting evaluation');
    }
  };

  // ==================== ALLOWED CONTENT ====================

  const openAllowedLink = (url: string) => {
    // Validate URL is in whitelist
    if (!evaluation?.allowedUrls.includes(url)) {
      logViolation(`Attempted to access non-whitelisted URL: ${url}`);
      alert('This URL is not allowed during the evaluation!');
      return;
    }

    // Open in controlled iframe or new window with restrictions
    window.open(url, '_blank', 'noopener,noreferrer');
    logActivity('URL_ACCESS', url);
  };

  // ==================== RENDER ====================

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeColor = () => {
    if (timeRemaining < 300) return '#f44336'; // Red - less than 5 min
    if (timeRemaining < 600) return '#ff9800'; // Orange - less than 10 min
    return '#4caf50'; // Green
  };

  if (loading) {
    return (
      <div className="eval-screen-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading evaluation...</p>
        </div>
      </div>
    );
  }

  if (!evaluation) {
    return (
      <div className="eval-screen-container">
        <div className="error-state">
          <h2>Evaluation not found</h2>
          <button className="btn btn-primary" onClick={() => navigate(-1)}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // If not in evaluation - show preview/info screen
  if (!inEvaluation) {
    return (
      <div className="eval-screen-container">
        <header className="eval-screen-header">
          <button className="btn-back" onClick={() => navigate(-1)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M19 12H5M12 19l-7-7 7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back
          </button>
        </header>

        <div className="eval-info-container">
          <div className="eval-info-card">
            <div className="eval-header-section">
              <h1>{evaluation.name}</h1>
              <span className={`status-badge status-${evaluation.status.toLowerCase()}`}>
                {evaluation.status}
              </span>
            </div>

            <div className="eval-details-grid">
              <div className="detail-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                  <polyline points="12 6 12 12 16 14" strokeWidth="2"/>
                </svg>
                <div>
                  <span className="detail-label">Duration</span>
                  <span className="detail-value">{evaluation.durationMinutes} minutes</span>
                </div>
              </div>

              <div className="detail-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" strokeWidth="2"/>
                </svg>
                <div>
                  <span className="detail-label">Max Score</span>
                  <span className="detail-value">{evaluation.maxScore} points</span>
                </div>
              </div>

              <div className="detail-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeWidth="2"/>
                  <polyline points="22 4 12 14.01 9 11.01" strokeWidth="2"/>
                </svg>
                <div>
                  <span className="detail-label">Weightage</span>
                  <span className="detail-value">{evaluation.weightage}%</span>
                </div>
              </div>
            </div>

            {/* Show results if evaluation ended and submitted */}
            {evaluation.status === 'ENDED' && submission && submission.status === 'SUBMITTED' && (
              <div className="results-section">
                <h3>Your Results</h3>
                <div className="score-display">
                  <div className="score-circle">
                    <span className="score-value">{submission.score}</span>
                    <span className="score-max">/ {evaluation.maxScore}</span>
                  </div>
                  <div className="score-details">
                    <p className="percentage">
                      {((submission.score / evaluation.maxScore) * 100).toFixed(1)}%
                    </p>
                    {submission.rank && (
                      <p className="rank">Rank: #{submission.rank}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Allowed Resources */}
            {evaluation.allowedUrls && evaluation.allowedUrls.length > 0 && (
              <div className="allowed-section">
                <h3>Allowed Resources</h3>
                <div className="allowed-list">
                  {evaluation.allowedUrls.map((url, index) => (
                    <div key={index} className="allowed-item">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" strokeWidth="2"/>
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" strokeWidth="2"/>
                      </svg>
                      <span>{url}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Important Rules */}
            <div className="rules-section">
              <h3>⚠️ Important Rules</h3>
              <ul className="rules-list">
                <li>Once started, you cannot exit without the teacher's exit password</li>
                <li>The evaluation will run in fullscreen mode</li>
                <li>Only allowed URLs and applications can be accessed</li>
                <li>Your location may be tracked during the evaluation</li>
                <li>All activities are monitored and logged</li>
                <li>Tab switching and window switching are disabled</li>
                <li>Right-click and keyboard shortcuts are disabled</li>
                <li>Screenshots will be taken for any suspicious activity</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="eval-actions">
              {evaluation.status === 'ONGOING' && (
                <button 
                  className="btn btn-primary btn-large"
                  onClick={handleStartEvaluation}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <polygon points="5 3 19 12 5 21 5 3" strokeWidth="2" strokeLinejoin="round"/>
                  </svg>
                  Start Evaluation
                </button>
              )}
              
              {evaluation.status === 'UPCOMING' && (
                <button className="btn btn-outline btn-large" disabled>
                  Evaluation Not Started Yet
                </button>
              )}
              
              {evaluation.status === 'ENDED' && (
                <button className="btn btn-outline btn-large" disabled>
                  Evaluation Ended
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Active evaluation screen
  return (
    <div className="eval-active-container">
      {/* Fixed header with timer */}
      <header className="eval-active-header">
        <div className="eval-active-title">
          <h2>{evaluation.name}</h2>
          <span className="live-indicator">
            <span className="pulse-dot"></span>
            LIVE
          </span>
        </div>
        
        <div className="eval-timer" style={{ color: getTimeColor() }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10" strokeWidth="2"/>
            <polyline points="12 6 12 12 16 14" strokeWidth="2"/>
          </svg>
          <span className="timer-text">{formatTime(timeRemaining)}</span>
        </div>

        <div className="eval-header-actions">
          <button 
            className="btn btn-outline btn-small"
            onClick={() => setShowExitModal(true)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" strokeWidth="2"/>
              <polyline points="16 17 21 12 16 7" strokeWidth="2"/>
              <line x1="21" y1="12" x2="9" y2="12" strokeWidth="2"/>
            </svg>
            Exit (Password Required)
          </button>
          
          <button 
            className="btn btn-primary btn-small"
            onClick={handleSubmitEvaluation}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polyline points="20 6 9 17 4 12" strokeWidth="2"/>
            </svg>
            Submit Evaluation
          </button>
        </div>
      </header>

      {/* Main evaluation workspace */}
      <div className="eval-workspace">
        <div className="workspace-sidebar">
          <h3>Allowed Resources</h3>
          
          {evaluation.allowedUrls.map((url, index) => (
            <button
              key={index}
              className="resource-button"
              onClick={() => openAllowedLink(url)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" strokeWidth="2"/>
                <polyline points="15 3 21 3 21 9" strokeWidth="2"/>
                <line x1="10" y1="14" x2="21" y2="3" strokeWidth="2"/>
              </svg>
              {new URL(url).hostname}
            </button>
          ))}

          <div className="sidebar-section">
            <h4>Allowed Applications</h4>
            <div className="app-list">
              <div className="app-item">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <polyline points="16 18 22 12 16 6" strokeWidth="2"/>
                  <polyline points="8 6 2 12 8 18" strokeWidth="2"/>
                </svg>
                <span>VS Code</span>
              </div>
              <div className="app-item">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <rect x="2" y="3" width="20" height="14" rx="2" strokeWidth="2"/>
                  <line x1="8" y1="21" x2="16" y2="21" strokeWidth="2"/>
                  <line x1="12" y1="17" x2="12" y2="21" strokeWidth="2"/>
                </svg>
                <span>Visual Studio</span>
              </div>
            </div>
            <p className="app-note">
              You can only open these applications. No other apps or windows are allowed.
            </p>
          </div>

          {violations.length > 0 && (
            <div className="violations-alert">
              <h4>⚠️ Violations ({violations.length})</h4>
              <div className="violations-list">
                {violations.slice(-5).map((v, i) => (
                  <div key={i} className="violation-item">{v}</div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="workspace-main">
          <div className="workspace-content">
            <div className="instructions-panel">
              <h2>Evaluation Instructions</h2>
              <p>
                Work on your assignment using the allowed resources on the left.
                You can access HackerRank and other permitted websites.
              </p>
              <p>
                <strong>Remember:</strong> All your activities are being monitored.
                Do not attempt to switch tabs, access unauthorized websites, or use disallowed applications.
              </p>
              
              <div className="work-area">
                <h3>Your Work</h3>
                <p>Complete your evaluation using the allowed resources.</p>
                {/* In real implementation, this could be an embedded IDE, 
                    code editor, or workspace for the student */}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Exit Modal */}
      {showExitModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Exit Evaluation</h2>
              <button 
                className="btn-close"
                onClick={() => setShowExitModal(false)}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <line x1="18" y1="6" x2="6" y2="18" strokeWidth="2"/>
                  <line x1="6" y1="6" x2="18" y2="18" strokeWidth="2"/>
                </svg>
              </button>
            </div>

            <form onSubmit={handleExitEvaluation} className="modal-form">
              <div className="warning-box">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" strokeWidth="2"/>
                  <line x1="12" y1="9" x2="12" y2="13" strokeWidth="2"/>
                  <line x1="12" y1="17" x2="12.01" y2="17" strokeWidth="2"/>
                </svg>
                <p>
                  You need the teacher's exit password to leave this evaluation.
                  Exiting without submitting will be recorded.
                </p>
              </div>

              <div className="form-group">
                <label>Exit Password *</label>
                <input
                  type="password"
                  value={exitPassword}
                  onChange={(e) => setExitPassword(e.target.value)}
                  placeholder="Enter exit password from teacher"
                  required
                  autoFocus
                />
              </div>

              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn btn-outline"
                  onClick={() => setShowExitModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Exit Evaluation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentEvaluation;