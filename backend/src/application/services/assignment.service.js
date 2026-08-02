const assignmentRepository = require('../../infrastructure/repositories/assignment.repository');
const courseRepository = require('../../infrastructure/repositories/course.repository');
const { assertCourseAccess, assertCanManageCourse } = require('./access.util');

class AssignmentService {
    constructor(repository, courseRepo) {
        this.repository = repository;
        this.courseRepository = courseRepo;
    }

    // Admin-only route (see assignment.routes.js) — full cross-course list.
    async getAllAssignments() {
        return this.repository.findAll();
    }

    async getCourseAssignments(courseId, user) {
        await assertCourseAccess(courseId, user);
        return this.repository.findByCourseId(courseId);
    }

    async getAssignmentById(id) {
        const assignment = await this.repository.findById(id);
        if (!assignment) throw new Error('Assignment not found');
        return assignment;
    }

    async createAssignment(data, user) {
        const course = await this.courseRepository.findById(data.course_id);
        if (!course) throw new Error('Course not found');
        if (user.role === 'teacher') await assertCanManageCourse(data.course_id, user);
        return this.repository.create({ ...data, created_by: user.id });
    }

    async updateAssignment(id, data, user) {
        const assignment = await this.getAssignmentById(id);
        if (user.role === 'teacher') await assertCanManageCourse(assignment.course_id, user);
        return this.repository.update(id, data);
    }

    async deleteAssignment(id, user) {
        const assignment = await this.getAssignmentById(id);
        if (user.role === 'teacher') await assertCanManageCourse(assignment.course_id, user);
        return this.repository.delete(id);
    }
}

module.exports = new AssignmentService(assignmentRepository, courseRepository);
