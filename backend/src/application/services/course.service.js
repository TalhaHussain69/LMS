const courseRepository = require('../../infrastructure/repositories/course.repository');
const enrollmentRepository = require('../../infrastructure/repositories/enrollment.repository');
const { resolveOwnStudentId, assertCanManageCourse } = require('./access.util');

class CourseService {
    constructor(repository) {
        this.repository = repository;
    }

    async getAllCourses(user) {
        if (user.role === 'admin') return this.repository.findAll();
        if (user.role === 'teacher') return this.repository.findByInstructorId(user.id);

        // student — only the courses they're enrolled in
        const ownId = await resolveOwnStudentId(user);
        if (!ownId) return [];
        const enrollments = await enrollmentRepository.findByStudentId(ownId);
        const courseIds = enrollments.map(e => e.course_id);
        return this.repository.findByIds(courseIds);
    }

    async getCourseById(id) {
        const course = await this.repository.findById(id);
        if (!course) throw new Error('Course not found');
        return course;
    }

    async createCourse(data, user) {
        if (user.role === 'teacher') data.instructor_id = user.id;
        return this.repository.create(data);
    }

    async updateCourse(id, data, user) {
        await assertCanManageCourse(id, user);
        return this.repository.update(id, data);
    }

    async deleteCourse(id, user) {
        await assertCanManageCourse(id, user);
        return this.repository.delete(id);
    }
}

module.exports = new CourseService(courseRepository);
