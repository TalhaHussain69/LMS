const analyticsRepository = require('../../infrastructure/repositories/analytics.repository');

/**
 * AnalyticsService (Application Layer)
 * One entry point — getDashboard(user) — that returns a different shape
 * depending on the caller's role. The controller/routes stay identical for
 * every role; only this service decides what data comes back.
 *
 * KNOWN LIMITATION: the original SMS "students" table (used by
 * Enrollments/Attendance/Grades) and the newer "users" table (used by
 * Auth/Lessons/Assignments/Quizzes) are two separate identities that were
 * never merged. For a student's personal dashboard we match them by email.
 * If a student's login email differs from their student-record email, their
 * attendance/grade numbers will show as empty until an admin aligns the two
 * records. A proper fix is a shared user_id column — left as a future
 * improvement so as not to disturb the already-working SMS modules.
 */
class AnalyticsService {
    async getDashboard(user) {
        if (user.role === 'admin') return this._adminDashboard();
        if (user.role === 'teacher') return this._teacherDashboard(user.id);
        return this._studentDashboard(user);
    }

    async _adminDashboard() {
        const [totals, enrollmentsByCourse, gradeDistribution, attendance] = await Promise.all([
            analyticsRepository.getTotals(),
            analyticsRepository.enrollmentsByCourse(),
            analyticsRepository.gradeDistribution(),
            analyticsRepository.attendanceSummary()
        ]);
        return { role: 'admin', totals, enrollmentsByCourse, gradeDistribution, attendance };
    }

    async _teacherDashboard(instructorId) {
        const [myCourses, enrollmentsByCourse, gradeDistribution, attendance] = await Promise.all([
            analyticsRepository.coursesForInstructor(instructorId),
            analyticsRepository.enrollmentsByCourse(instructorId),
            analyticsRepository.gradeDistribution(instructorId),
            analyticsRepository.attendanceSummary(instructorId)
        ]);
        const totalEnrollments = enrollmentsByCourse.reduce((sum, c) => sum + Number(c.count), 0);
        return {
            role: 'teacher',
            totals: { myCourses, totalEnrollments },
            enrollmentsByCourse,
            gradeDistribution,
            attendance
        };
    }

    async _studentDashboard(user) {
        const studentRecord = await analyticsRepository.findStudentByEmail(user.email);

        const [attendance, grades, enrolledCourses, quizScores, assignmentsSubmitted] = await Promise.all([
            studentRecord ? analyticsRepository.studentAttendanceSummary(studentRecord.id) : [],
            studentRecord ? analyticsRepository.studentGrades(studentRecord.id) : [],
            studentRecord ? analyticsRepository.studentEnrollmentCount(studentRecord.id) : 0,
            analyticsRepository.studentQuizScores(user.id),
            analyticsRepository.studentAssignmentSubmittedCount(user.id)
        ]);

        return {
            role: 'student',
            linkedToStudentRecord: Boolean(studentRecord),
            totals: { enrolledCourses, quizzesTaken: quizScores.length, assignmentsSubmitted },
            attendance,
            grades,
            quizScores
        };
    }
}

module.exports = new AnalyticsService();
