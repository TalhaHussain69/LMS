const studentRepository = require('../../infrastructure/repositories/student.repository');
const courseRepository = require('../../infrastructure/repositories/course.repository');
const enrollmentRepository = require('../../infrastructure/repositories/enrollment.repository');

/**
 * AccessControl (Application Layer helper)
 * Centralizes every "may this user touch this data?" check so the rule is
 * written once and every service (Students, Courses, Enrollments,
 * Attendance, Grades, Lessons, Assignments, Quizzes, Announcements) applies
 * it consistently instead of re-implementing role logic per module.
 *
 * Role model:
 *  - admin   : unrestricted.
 *  - teacher : only their own courses (courses.instructor_id) and the
 *              students enrolled in them.
 *  - student : only their own linked student record (matched by email —
 *              see the note in analytics.service.js) and only data tied to
 *              courses they are enrolled in.
 */

function forbidden(message) {
    return new Error(message || 'You do not have permission to access this resource');
}

/** Resolves a logged-in student user to their row in the legacy `students` table. */
async function resolveOwnStudentId(user) {
    if (!user || user.role !== 'student') return null;
    const record = await studentRepository.findByEmail(user.email);
    return record ? record.id : null;
}

/** Throws unless the user may manage (edit/delete) the given course. Admin always passes. */
async function assertCanManageCourse(courseId, user) {
    if (user.role === 'admin') return;
    const course = await courseRepository.findById(courseId);
    if (!course) throw new Error('Course not found');
    if (user.role !== 'teacher' || course.instructor_id !== user.id) {
        throw forbidden('You can only manage your own courses');
    }
}

/**
 * Throws unless the user may READ content belonging to the given course
 * (lessons, assignments, quizzes, attendance, grades, announcements).
 * Admin: always. Teacher: only their own course. Student: only if enrolled.
 */
async function assertCourseAccess(courseId, user) {
    if (user.role === 'admin') return;

    const course = await courseRepository.findById(courseId);
    if (!course) throw new Error('Course not found');

    if (user.role === 'teacher') {
        if (course.instructor_id !== user.id) throw forbidden('You can only access your own course content');
        return;
    }

    // student
    const ownId = await resolveOwnStudentId(user);
    if (!ownId) throw forbidden('No student record is linked to your account yet');
    const enrolled = await enrollmentRepository.exists(ownId, courseId);
    if (!enrolled) throw forbidden('You are not enrolled in this course');
}

/**
 * Throws unless the user may view the given student's personal records
 * (profile, attendance, grades, enrollments).
 * Admin: always. Teacher: only if the student is enrolled in one of their
 * courses. Student: only their own record.
 */
async function assertCanViewStudent(studentId, user) {
    if (user.role === 'admin') return;

    if (user.role === 'teacher') {
        const allowed = await studentRepository.isEnrolledUnderInstructor(studentId, user.id);
        if (!allowed) throw forbidden('This student is not enrolled in any of your courses');
        return;
    }

    // student
    const ownId = await resolveOwnStudentId(user);
    if (!ownId || ownId !== Number(studentId)) throw forbidden('You can only view your own information');
}

module.exports = {
    forbidden,
    resolveOwnStudentId,
    assertCanManageCourse,
    assertCourseAccess,
    assertCanViewStudent
};
