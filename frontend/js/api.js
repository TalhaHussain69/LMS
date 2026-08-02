/**
 * Thin fetch wrapper around the backend REST API.
 * Keeps app.js free of repetitive fetch/error-handling boilerplate.
 */
const API_BASE = '/api';

async function apiRequest(path, options = {}) {
  const token = localStorage.getItem('sms-token');
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    ...options
  });

  const body = await res.json().catch(() => ({}));

  if (!res.ok || body.success === false) {
    throw new Error(body.message || `Request failed (${res.status})`);
  }
  return body.data;
}

const api = {
  health: () => apiRequest('/health'),

  auth: {
    login: (data) => apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
    register: (data) => apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
    me: () => apiRequest('/auth/me')
  },

  students: {
    list: () => apiRequest('/students'),
    me: () => apiRequest('/students/me'),
    create: (data) => apiRequest('/students', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => apiRequest(`/students/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    remove: (id) => apiRequest(`/students/${id}`, { method: 'DELETE' })
  },
  courses: {
    list: () => apiRequest('/courses'),
    create: (data) => apiRequest('/courses', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => apiRequest(`/courses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    remove: (id) => apiRequest(`/courses/${id}`, { method: 'DELETE' })
  },
  enrollments: {
    list: () => apiRequest('/enrollments'),
    byStudent: (studentId) => apiRequest(`/enrollments/student/${studentId}`),
    create: (data) => apiRequest('/enrollments', { method: 'POST', body: JSON.stringify(data) }),
    remove: (id) => apiRequest(`/enrollments/${id}`, { method: 'DELETE' })
  },
  attendance: {
    list: () => apiRequest('/attendance'),
    byStudent: (studentId) => apiRequest(`/attendance/student/${studentId}`),
    create: (data) => apiRequest('/attendance', { method: 'POST', body: JSON.stringify(data) }),
    remove: (id) => apiRequest(`/attendance/${id}`, { method: 'DELETE' })
  },
  grades: {
    list: () => apiRequest('/grades'),
    byStudent: (studentId) => apiRequest(`/grades/student/${studentId}`),
    create: (data) => apiRequest('/grades', { method: 'POST', body: JSON.stringify(data) }),
    remove: (id) => apiRequest(`/grades/${id}`, { method: 'DELETE' })
  },

  lessons: {
    byCourse: (courseId) => apiRequest(`/lessons/course/${courseId}`),
    create: (data) => apiRequest('/lessons', { method: 'POST', body: JSON.stringify(data) }),
    remove: (id) => apiRequest(`/lessons/${id}`, { method: 'DELETE' })
  },
  progress: {
    markComplete: (lessonId, completed) => apiRequest('/lesson-progress/complete', { method: 'POST', body: JSON.stringify({ lesson_id: lessonId, completed }) }),
    forCourse: (courseId) => apiRequest(`/lesson-progress/course/${courseId}`)
  },
  assignments: {
    byCourse: (courseId) => apiRequest(`/assignments/course/${courseId}`),
    create: (data) => apiRequest('/assignments', { method: 'POST', body: JSON.stringify(data) }),
    remove: (id) => apiRequest(`/assignments/${id}`, { method: 'DELETE' })
  },
  submissions: {
    byAssignment: (assignmentId) => apiRequest(`/submissions/assignment/${assignmentId}`),
    mine: () => apiRequest('/submissions/mine'),
    submit: (data) => apiRequest('/submissions', { method: 'POST', body: JSON.stringify(data) }),
    grade: (id, data) => apiRequest(`/submissions/${id}/grade`, { method: 'PUT', body: JSON.stringify(data) })
  },
  quizzes: {
    byCourse: (courseId) => apiRequest(`/quizzes/course/${courseId}`),
    forAttempt: (id) => apiRequest(`/quizzes/${id}/attempt`),
    withAnswers: (id) => apiRequest(`/quizzes/${id}/full`),
    create: (data) => apiRequest('/quizzes', { method: 'POST', body: JSON.stringify(data) }),
    addQuestion: (quizId, data) => apiRequest(`/quizzes/${quizId}/questions`, { method: 'POST', body: JSON.stringify(data) }),
    remove: (id) => apiRequest(`/quizzes/${id}`, { method: 'DELETE' })
  },
  quizAttempts: {
    byQuiz: (quizId) => apiRequest(`/quiz-attempts/quiz/${quizId}`),
    mine: () => apiRequest('/quiz-attempts/mine'),
    submit: (data) => apiRequest('/quiz-attempts', { method: 'POST', body: JSON.stringify(data) })
  },
  announcements: {
    list: () => apiRequest('/announcements'),
    byCourse: (courseId) => apiRequest(`/announcements/course/${courseId}`),
    create: (data) => apiRequest('/announcements', { method: 'POST', body: JSON.stringify(data) }),
    remove: (id) => apiRequest(`/announcements/${id}`, { method: 'DELETE' })
  },
  analytics: {
    dashboard: () => apiRequest('/analytics/dashboard')
  },
  users: {
    list: () => apiRequest('/users'),
    create: (data) => apiRequest('/users', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => apiRequest(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    resetPassword: (id, password) => apiRequest(`/users/${id}/password`, { method: 'PUT', body: JSON.stringify({ password }) }),
    remove: (id) => apiRequest(`/users/${id}`, { method: 'DELETE' })
  }
};
