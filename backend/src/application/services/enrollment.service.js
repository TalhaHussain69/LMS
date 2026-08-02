const enrollmentRepository = require('../../infrastructure/repositories/enrollment.repository');
const studentRepository = require('../../infrastructure/repositories/student.repository');
const courseRepository = require('../../infrastructure/repositories/course.repository');
const { forbidden, resolveOwnStudentId, assertCanViewStudent } = require('./access.util');

class EnrollmentService {
    constructor(enrollmentRepo, studentRepo, courseRepo) {
        this.repository = enrollmentRepo;
        this.studentRepository = studentRepo;
        this.courseRepository = courseRepo;
    }

    async getAllEnrollments(user) {
        if (user.role === 'admin') return this.repository.findAll();
        if (user.role === 'teacher') return this.repository.findByInstructorId(user.id);
        throw forbidden('Not allowed to list all enrollments');
    }

    async getStudentEnrollments(studentId, user) {
        await assertCanViewStudent(studentId, user);
        const rows = await this.repository.findByStudentId(studentId);
        // A teacher may only see the slice of this student's enrollments that
        // belong to their own courses — assertCanViewStudent only confirms the
        // student is enrolled in AT LEAST ONE of the teacher's courses.
        if (user.role === 'teacher') return rows.filter(r => r.instructor_id === user.id);
        return rows;
    }

    async enrollStudent(studentId, courseId, user) {
        const student = await this.studentRepository.findById(studentId);
        if (!student) throw new Error('Student not found');

        const course = await this.courseRepository.findById(courseId);
        if (!course) throw new Error('Course not found');

        if (user.role === 'teacher' && course.instructor_id !== user.id) {
            throw forbidden('You can only enroll students in your own courses');
        }

        const alreadyEnrolled = await this.repository.exists(studentId, courseId);
        if (alreadyEnrolled) throw new Error('Student is already enrolled in this course');

        return this.repository.create({ student_id: studentId, course_id: courseId });
    }

    async unenrollStudent(enrollmentId, user) {
        const enrollment = await this.repository.findById(enrollmentId);
        if (!enrollment) throw new Error('Enrollment not found');

        if (user.role === 'teacher') {
            const course = await this.courseRepository.findById(enrollment.course_id);
            if (!course || course.instructor_id !== user.id) {
                throw forbidden('You can only manage enrollments in your own courses');
            }
        }

        const deleted = await this.repository.delete(enrollmentId);
        if (!deleted) throw new Error('Enrollment not found');
        return deleted;
    }
}

module.exports = new EnrollmentService(enrollmentRepository, studentRepository, courseRepository);
