const { pool } = require('../database/connection');

/**
 * AnalyticsRepository (Infrastructure Layer)
 * Read-only aggregate queries powering the dashboard. Kept separate from the
 * CRUD repositories since these are cross-table reporting queries, not
 * single-entity persistence.
 */
class AnalyticsRepository {
    // ---------- Site-wide (Admin) / instructor-scoped (Teacher) ----------
    async getTotals() {
        const [[{ totalStudents }]] = await pool.query('SELECT COUNT(*) AS totalStudents FROM students');
        const [[{ totalTeachers }]] = await pool.query("SELECT COUNT(*) AS totalTeachers FROM users WHERE role = 'teacher'");
        const [[{ totalCourses }]] = await pool.query('SELECT COUNT(*) AS totalCourses FROM courses');
        const [[{ totalEnrollments }]] = await pool.query('SELECT COUNT(*) AS totalEnrollments FROM enrollments');
        const [[{ totalAssignments }]] = await pool.query('SELECT COUNT(*) AS totalAssignments FROM assignments');
        const [[{ totalQuizzes }]] = await pool.query('SELECT COUNT(*) AS totalQuizzes FROM quizzes');
        return { totalStudents, totalTeachers, totalCourses, totalEnrollments, totalAssignments, totalQuizzes };
    }

    async coursesForInstructor(instructorId) {
        const [[{ count }]] = await pool.query('SELECT COUNT(*) AS count FROM courses WHERE instructor_id = ?', [instructorId]);
        return count;
    }

    async enrollmentsByCourse(instructorId = null) {
        const params = [];
        let where = '';
        if (instructorId) { where = 'WHERE c.instructor_id = ?'; params.push(instructorId); }
        const [rows] = await pool.query(`
            SELECT c.name AS course_name, COUNT(e.id) AS count
            FROM courses c LEFT JOIN enrollments e ON e.course_id = c.id
            ${where}
            GROUP BY c.id ORDER BY count DESC
        `, params);
        return rows;
    }

    async gradeDistribution(instructorId = null) {
        const params = [];
        let where = '';
        if (instructorId) { where = 'WHERE c.instructor_id = ?'; params.push(instructorId); }
        const [rows] = await pool.query(`
            SELECT g.grade, COUNT(*) AS count
            FROM grades g JOIN courses c ON c.id = g.course_id
            ${where}
            GROUP BY g.grade
        `, params);
        return rows;
    }

    async attendanceSummary(instructorId = null) {
        const params = [];
        let where = '';
        if (instructorId) { where = 'WHERE c.instructor_id = ?'; params.push(instructorId); }
        const [rows] = await pool.query(`
            SELECT a.status, COUNT(*) AS count
            FROM attendance a JOIN courses c ON c.id = a.course_id
            ${where}
            GROUP BY a.status
        `, params);
        return rows;
    }

    // ---------- Personal (Student) ----------
    // Student login accounts (users) and student records (students) are matched
    // by email — see note in analytics.service.js about this current limitation.
    async findStudentByEmail(email) {
        const [rows] = await pool.query('SELECT * FROM students WHERE email = ?', [email]);
        return rows[0] || null;
    }

    async studentAttendanceSummary(studentId) {
        const [rows] = await pool.query(
            'SELECT status, COUNT(*) AS count FROM attendance WHERE student_id = ? GROUP BY status',
            [studentId]
        );
        return rows;
    }

    async studentGrades(studentId) {
        const [rows] = await pool.query(`
            SELECT g.marks, g.grade, c.name AS course_name
            FROM grades g JOIN courses c ON c.id = g.course_id
            WHERE g.student_id = ?
        `, [studentId]);
        return rows;
    }

    async studentEnrollmentCount(studentId) {
        const [[{ count }]] = await pool.query('SELECT COUNT(*) AS count FROM enrollments WHERE student_id = ?', [studentId]);
        return count;
    }

    async studentQuizScores(userId) {
        const [rows] = await pool.query(`
            SELECT qa.score, qa.total_marks, q.title AS quiz_title
            FROM quiz_attempts qa JOIN quizzes q ON q.id = qa.quiz_id
            WHERE qa.student_id = ?
        `, [userId]);
        return rows;
    }

    async studentAssignmentSubmittedCount(userId) {
        const [[{ count }]] = await pool.query('SELECT COUNT(*) AS count FROM submissions WHERE student_id = ?', [userId]);
        return count;
    }
}

module.exports = new AnalyticsRepository();
