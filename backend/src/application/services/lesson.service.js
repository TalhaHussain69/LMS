const lessonRepository = require('../../infrastructure/repositories/lesson.repository');
const courseRepository = require('../../infrastructure/repositories/course.repository');

class LessonService {
    constructor(repository, courseRepo) {
        this.repository = repository;
        this.courseRepository = courseRepo;
    }

    async getCourseLessons(courseId) {
        return this.repository.findByCourseId(courseId);
    }

    async getLessonById(id) {
        const lesson = await this.repository.findById(id);
        if (!lesson) throw new Error('Lesson not found');
        return lesson;
    }

    async createLesson(data) {
        const course = await this.courseRepository.findById(data.course_id);
        if (!course) throw new Error('Course not found');
        return this.repository.create(data);
    }

    async updateLesson(id, data) {
        await this.getLessonById(id);
        return this.repository.update(id, data);
    }

    async deleteLesson(id) {
        await this.getLessonById(id);
        return this.repository.delete(id);
    }
}

module.exports = new LessonService(lessonRepository, courseRepository);
