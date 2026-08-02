const studentRepository = require('../../infrastructure/repositories/student.repository');
const Student = require('../../domain/entities/Student');

class StudentService {
    constructor(repository) {
        this.repository = repository;
    }

    async getAllStudents() {
        return this.repository.findAll();
    }

    async getStudentById(id) {
        const student = await this.repository.findById(id);
        if (!student) throw new Error('Student not found');
        return student;
    }

    async createStudent(data) {
        const existing = await this.repository.findByEmail(data.email);
        if (existing) throw new Error('A student with this email already exists');

        new Student({ ...data, id: null });
        return this.repository.create(data);
    }

    async updateStudent(id, data) {
        await this.getStudentById(id);
        return this.repository.update(id, data);
    }

    async deleteStudent(id) {
        await this.getStudentById(id);
        return this.repository.delete(id);
    }
}

module.exports = new StudentService(studentRepository);