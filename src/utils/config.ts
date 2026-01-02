// API Configuration
export const API_BASE_URL = 'http://100.24.124.0:8080';

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  SIGNUP: '/api/auth/signup',
  LOGIN: '/api/auth/login',
  PROFILE: '/api/profile',
  SEND_VERIFICATION: '/api/auth/send-verification',
  
  // Courses
  CREATE_COURSE: '/api/courses',
  GET_TEACHER_COURSES: '/api/courses/teacher',
  GET_STUDENT_COURSES: '/api/courses/student',
  JOIN_COURSE: '/api/courses/join',
  
  // Evaluations
  CREATE_EVALUATION: '/api/evaluations',
  GET_COURSE_EVALUATIONS: '/api/evaluations/course',
  ENTER_EVALUATION: '/api/evaluations/enter',
  SUBMIT_EVALUATION: '/api/evaluations/submit',
  GET_LEADERBOARD: '/api/evaluations/leaderboard',
  
  // ✅ NEW: Evaluation Management (Teacher)
  GET_EVALUATION_DETAILS: '/api/evaluation',        // GET /api/evaluation/{evalId}
  UPDATE_EVALUATION: '/api/evaluation',             // PUT /api/evaluation/{evalId}
  DELETE_EVALUATION: '/api/evaluation',             // DELETE /api/evaluation/{evalId}
  GET_EVALUATION_SUBMISSIONS: '/api/evaluation',    // GET /api/evaluation/{evalId}/submissions/{teacherId}
  GET_EVALUATION_LEADERBOARD: '/api/evaluation',    // GET /api/evaluation/{evalId}/leaderboard/{teacherId}
  GRADE_SUBMISSION: '/api/evaluation/grade',        // POST
  GET_WHITELIST: '/api/whitelist',                  // GET /api/whitelist/{evalId}
  REMOVE_FROM_WHITELIST: '/api/monitoring/whitelist/remove', // POST (if needed)
  EXIT_EVALUATION: '/api/evaluation/exit',          // POST
  UPDATE_EXIT_PASSWORD: '/api/evaluation',          // PUT /api/evaluation/{evalId}/exit-password
  GET_EXIT_PASSWORD: '/api/evaluation',             // GET /api/evaluation/{evalId}/exit-password/{teacherId}
  
  // Web Monitoring
  ADD_TO_WHITELIST: '/api/monitoring/whitelist',
  LOG_ACTIVITY: '/api/monitoring/activity',
  GET_VIOLATIONS: '/api/monitoring/violations',
  
  // Location Tracking
  RECORD_LOCATION: '/api/location/record',
  GET_PROXIMITY_ALERTS: '/api/location/proximity',
  
  // Health Check
  HEALTH: '/api/health',
};

// Helper function to build URLs with parameters
export const buildUrl = (endpoint: string, ...params: string[]): string => {
  let url = endpoint;
  params.forEach(param => {
    url += `/${param}`;
  });
  return url;
};

// Usage examples:
// buildUrl(API_ENDPOINTS.GET_EVALUATION_DETAILS, evaluationId)
// buildUrl(API_ENDPOINTS.GET_EVALUATION_SUBMISSIONS, evaluationId, 'submissions', teacherId)
// buildUrl(API_ENDPOINTS.GET_EVALUATION_LEADERBOARD, evaluationId, 'leaderboard', teacherId)