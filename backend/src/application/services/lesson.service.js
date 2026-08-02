const lessonRepository = require('../../infrastructure/repositories/lesson.repository');
const courseRepository = require('../../infrastructure/repositories/course.repository');
const { assertCourseAccess, assertCanManageCourse } = require('./access.util');

class LessonService {
    constructor(repository, courseRepo) {
        this.repository = repository;
        this.courseRepository = courseRepo;
    }

    async getCourseLessons(courseId, user) {
        await assertCourseAccess(courseId, user);
        return this.repository.findByCourseId(courseId);
    }

    async getLessonById(id) {
        const lesson = await this.repository.findById(id);
        if (!lesson) throw new Error('Lesson not found');
        return lesson;
    }

    async createLesson(data, user) {
        const course = await this.courseRepository.findById(data.course_id);
        if (!course) throw new Error('Course not found');
        if (user.role === 'teacher') await assertCanManageCourse(data.course_id, user);
        return this.repository.create(data);
    }

    async updateLesson(id, data, user) {
        const lesson = await this.getLessonById(id);
        if (user.role === 'teacher') await assertCanManageCourse(lesson.course_id, user);
        return this.repository.update(id, data);
    }

    async deleteLesson(id, user) {
        const lesson = await this.getLessonById(id);
        if (user.role === 'teacher') await assertCanManageCourse(lesson.course_id, user);
        return this.repository.delete(id);
    }
}

module.exports = new LessonService(lessonRepository, courseRepository);
