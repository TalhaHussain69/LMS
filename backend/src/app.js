const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./presentation/routes/auth.routes');
const studentRoutes = require('./presentation/routes/student.routes');
const courseRoutes = require('./presentation/routes/course.routes');
const enrollmentRoutes = require('./presentation/routes/enrollment.routes');
const attendanceRoutes = require('./presentation/routes/attendance.routes');
const gradeRoutes = require('./presentation/routes/grade.routes');
const lessonRoutes = require('./presentation/routes/lesson.routes');
const lessonProgressRoutes = require('./presentation/routes/lessonProgress.routes');
const assignmentRoutes = require('./presentation/routes/assignment.routes');
const submissionRoutes = require('./presentation/routes/submission.routes');
const quizRoutes = require('./presentation/routes/quiz.routes');
const quizAttemptRoutes = require('./presentation/routes/quizAttempt.routes');
const announcementRoutes = require('./presentation/routes/announcement.routes');
const analyticsRoutes = require('./presentation/routes/analytics.routes');
const userRoutes = require('./presentation/routes/user.routes');
const errorMiddleware = require('./presentation/middlewares/error.middleware');

const app = express();

// ---------- Global Middlewares ----------
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---------- Serve the frontend (light UI) ----------
app.use(express.static(path.join(__dirname, '../../frontend')));

// ---------- API Routes ----------
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/grades', gradeRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/lesson-progress', lessonProgressRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/quiz-attempts', quizAttemptRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/users', userRoutes);

// ---------- Health check ----------
app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'Student Management System API is running' });
});

// ---------- 404 handler ----------
app.use('/api', (req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
});

// ---------- Global error handler (must be last) ----------
app.use(errorMiddleware);

module.exports = app;
