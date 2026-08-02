const courseRepository = require('../../infrastructure/repositories/course.repository');

class CourseService {
    constructor(repository) {
        this.repository = repository;
    }

    async getAllCourses() {
        return this.repository.findAll();
    }

    async getCourseById(id) {
        const course = await this.repository.findById(id);
        if (!course) throw new Error('Course not found');
        return course;
    }

    async createCourse(data) {
        return this.repository.create(data);
    }

    async updateCourse(id, data) {
        await this.getCourseById(id);
        return this.repository.update(id, data);
    }

    async deleteCourse(id) {
        await this.getCourseById(id);
        return this.repository.delete(id);
    }
}

module.exports = new CourseService(courseRepository);