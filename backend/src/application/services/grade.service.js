const gradeRepository = require('../../infrastructure/repositories/grade.repository');
const enrollmentRepository = require('../../infrastructure/repositories/enrollment.repository');
const Grade = require('../../domain/entities/Grade');
const { forbidden, assertCanViewStudent, assertCanManageCourse } = require('./access.util');

class GradeService {
    constructor(gradeRepo, enrollmentRepo) {
        this.repository = gradeRepo;
        this.enrollmentRepository = enrollmentRepo;
    }

    async getAllGrades(user) {
        if (user.role === 'admin') return this.repository.findAll();
        if (user.role === 'teacher') return this.repository.findByInstructorId(user.id);
        throw forbidden('Not allowed to list all grade records');
    }

    async getStudentGrades(studentId, user) {
        await assertCanViewStudent(studentId, user);
        if (user.role === 'teacher') return this.repository.findByStudentIdForInstructor(studentId, user.id);
        return this.repository.findByStudentId(studentId);
    }

    async addGrade(data, user) {
        const isEnrolled = await this.enrollmentRepository.exists(data.student_id, data.course_id);
        if (!isEnrolled) {
            throw new Error('Cannot add grade — student is not enrolled in this course');
        }
        if (user.role === 'teacher') await assertCanManageCourse(data.course_id, user);

        const existing = await this.repository.findByStudentAndCourse(data.student_id, data.course_id);
        if (existing) throw new Error('A grade already exists for this student in this course. Use update instead.');

        const letterGrade = Grade.calculateLetterGrade(data.marks);
        return this.repository.create({ ...data, grade: letterGrade });
    }

    async updateGrade(id, data) {
        const updated = await this.repository.update(id, data);
        if (!updated) throw new Error('Grade record not found');
        return updated;
    }

    async deleteGrade(id) {
        const deleted = await this.repository.delete(id);
        if (!deleted) throw new Error('Grade record not found');
        return deleted;
    }
}

module.exports = new GradeService(gradeRepository, enrollmentRepository);
