const enrollmentRepository = require('../../infrastructure/repositories/enrollment.repository');
const studentRepository = require('../../infrastructure/repositories/student.repository');
const courseRepository = require('../../infrastructure/repositories/course.repository');

class EnrollmentService {
    constructor(enrollmentRepo, studentRepo, courseRepo) {
        this.repository = enrollmentRepo;
        this.studentRepository = studentRepo;
        this.courseRepository = courseRepo;
    }

    async getAllEnrollments() {
        return this.repository.findAll();
    }

    async getStudentEnrollments(studentId) {
        return this.repository.findByStudentId(studentId);
    }

    async enrollStudent(studentId, courseId) {
        const student = await this.studentRepository.findById(studentId);
        if (!student) throw new Error('Student not found');

        const course = await this.courseRepository.findById(courseId);
        if (!course) throw new Error('Course not found');

        const alreadyEnrolled = await this.repository.exists(studentId, courseId);
        if (alreadyEnrolled) throw new Error('Student is already enrolled in this course');

        return this.repository.create({ student_id: studentId, course_id: courseId });
    }

    async unenrollStudent(enrollmentId) {
        const deleted = await this.repository.delete(enrollmentId);
        if (!deleted) throw new Error('Enrollment not found');
        return deleted;
    }
}

module.exports = new EnrollmentService(enrollmentRepository, studentRepository, courseRepository);