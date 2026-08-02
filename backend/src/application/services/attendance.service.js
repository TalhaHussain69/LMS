const attendanceRepository = require('../../infrastructure/repositories/attendance.repository');
const enrollmentRepository = require('../../infrastructure/repositories/enrollment.repository');
const courseRepository = require('../../infrastructure/repositories/course.repository');
const { forbidden, assertCanViewStudent, assertCanManageCourse } = require('./access.util');

class AttendanceService {
    constructor(attendanceRepo, enrollmentRepo, courseRepo) {
        this.repository = attendanceRepo;
        this.enrollmentRepository = enrollmentRepo;
        this.courseRepository = courseRepo;
    }

    async getAllAttendance(user) {
        if (user.role === 'admin') return this.repository.findAll();
        if (user.role === 'teacher') return this.repository.findByInstructorId(user.id);
        throw forbidden('Not allowed to list all attendance records');
    }

    async getStudentAttendance(studentId, user) {
        await assertCanViewStudent(studentId, user);
        if (user.role === 'teacher') return this.repository.findByStudentIdForInstructor(studentId, user.id);
        return this.repository.findByStudentId(studentId);
    }

    async markAttendance(data, user) {
        const isEnrolled = await this.enrollmentRepository.exists(data.student_id, data.course_id);
        if (!isEnrolled) {
            throw new Error('Cannot mark attendance — student is not enrolled in this course');
        }
        if (user.role === 'teacher') await assertCanManageCourse(data.course_id, user);
        return this.repository.create(data);
    }

    async updateAttendance(id, data) {
        const updated = await this.repository.update(id, data);
        if (!updated) throw new Error('Attendance record not found');
        return updated;
    }

    async deleteAttendance(id) {
        const deleted = await this.repository.delete(id);
        if (!deleted) throw new Error('Attendance record not found');
        return deleted;
    }
}

module.exports = new AttendanceService(attendanceRepository, enrollmentRepository, courseRepository);
