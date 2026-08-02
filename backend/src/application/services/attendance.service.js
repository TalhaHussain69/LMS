const attendanceRepository = require('../../infrastructure/repositories/attendance.repository');
const enrollmentRepository = require('../../infrastructure/repositories/enrollment.repository');

class AttendanceService {
    constructor(attendanceRepo, enrollmentRepo) {
        this.repository = attendanceRepo;
        this.enrollmentRepository = enrollmentRepo;
    }

    async getAllAttendance() {
        return this.repository.findAll();
    }

    async getStudentAttendance(studentId) {
        return this.repository.findByStudentId(studentId);
    }

    async markAttendance(data) {
        const isEnrolled = await this.enrollmentRepository.exists(data.student_id, data.course_id);
        if (!isEnrolled) {
            throw new Error('Cannot mark attendance — student is not enrolled in this course');
        }
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

module.exports = new AttendanceService(attendanceRepository, enrollmentRepository);