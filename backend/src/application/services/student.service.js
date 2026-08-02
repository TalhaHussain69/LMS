const studentRepository = require('../../infrastructure/repositories/student.repository');
const Student = require('../../domain/entities/Student');
const { forbidden, resolveOwnStudentId, assertCanViewStudent } = require('./access.util');

/**
 * StudentService (Application Layer)
 * Orchestrates business use-cases. Controllers call THIS, never the repository
 * directly (Separation of Concerns).
 *
 * RBAC: admin sees everyone; teacher sees only students enrolled in their own
 * courses; student sees only their own record (never the roster).
 */
class StudentService {
    constructor(repository) {
        this.repository = repository; // Dependency Injection
    }

    async getAllStudents(user) {
        if (user.role === 'admin') return this.repository.findAll();
        if (user.role === 'teacher') return this.repository.findByInstructorId(user.id);
        throw forbidden('Students cannot view the full student roster');
    }

    async getStudentById(id, user) {
        const student = await this.repository.findById(id);
        if (!student) throw new Error('Student not found');
        await assertCanViewStudent(id, user);
        return student;
    }

    async getMyProfile(user) {
        const ownId = await resolveOwnStudentId(user);
        if (!ownId) throw new Error('No student record is linked to your account yet — ask an admin to link it');
        return this.getStudentById(ownId, user);
    }

    async createStudent(data) {
        const existing = await this.repository.findByEmail(data.email);
        if (existing) throw new Error('A student with this email already exists');

        // Throws automatically via entity validation if data is invalid
        new Student({ ...data, id: null });
        return this.repository.create(data);
    }

    async updateStudent(id, data) {
        const existing = await this.repository.findById(id);
        if (!existing) throw new Error('Student not found');
        return this.repository.update(id, data);
    }

    async deleteStudent(id) {
        const existing = await this.repository.findById(id);
        if (!existing) throw new Error('Student not found');
        return this.repository.delete(id);
    }
}

module.exports = new StudentService(studentRepository);
