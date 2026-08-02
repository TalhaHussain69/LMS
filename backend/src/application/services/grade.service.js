const gradeRepository = require('../../infrastructure/repositories/grade.repository');
const enrollmentRepository = require('../../infrastructure/repositories/enrollment.repository');
const Grade = require('../../domain/entities/Grade');

class GradeService {
    constructor(gradeRepo, enrollmentRepo) {
        this.repository = gradeRepo;
        this.enrollmentRepository = enrollmentRepo;
    }

    async getAllGrades() {
        return this.repository.findAll();
    }

    async getStudentGrades(studentId) {
        return this.repository.findByStudentId(studentId);
    }

    async addGrade(data) {
        const isEnrolled = await this.enrollmentRepository.exists(data.student_id, data.course_id);
        if (!isEnrolled) {
            throw new Error('Cannot add grade — student is not enrolled in this course');
        }

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