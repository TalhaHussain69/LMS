const assignmentRepository = require('../../infrastructure/repositories/assignment.repository');
const courseRepository = require('../../infrastructure/repositories/course.repository');

class AssignmentService {
    constructor(repository, courseRepo) {
        this.repository = repository;
        this.courseRepository = courseRepo;
    }

    async getAllAssignments() {
        return this.repository.findAll();
    }

    async getCourseAssignments(courseId) {
        return this.repository.findByCourseId(courseId);
    }

    async getAssignmentById(id) {
        const assignment = await this.repository.findById(id);
        if (!assignment) throw new Error('Assignment not found');
        return assignment;
    }

    async createAssignment(data, instructorId) {
        const course = await this.courseRepository.findById(data.course_id);
        if (!course) throw new Error('Course not found');
        return this.repository.create({ ...data, created_by: instructorId });
    }

    async updateAssignment(id, data) {
        await this.getAssignmentById(id);
        return this.repository.update(id, data);
    }

    async deleteAssignment(id) {
        await this.getAssignmentById(id);
        return this.repository.delete(id);
    }
}

module.exports = new AssignmentService(assignmentRepository, courseRepository);
