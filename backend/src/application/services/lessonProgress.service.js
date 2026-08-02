const progressRepository = require('../../infrastructure/repositories/lessonProgress.repository');
const lessonRepository = require('../../infrastructure/repositories/lesson.repository');

class LessonProgressService {
    constructor(progressRepo, lessonRepo) {
        this.repository = progressRepo;
        this.lessonRepository = lessonRepo;
    }

    async markComplete(studentId, lessonId, completed = true) {
        const lesson = await this.lessonRepository.findById(lessonId);
        if (!lesson) throw new Error('Lesson not found');
        return this.repository.upsert(studentId, lessonId, completed);
    }

    /**
     * Derives a course-level completion percentage from individual
     * lesson_progress rows — the business rule lives here, not in SQL
     * and not in the controller.
     */
    async getCourseProgress(studentId, courseId) {
        const totalLessons = await this.lessonRepository.countByCourseId(courseId);
        if (totalLessons === 0) {
            return { student_id: studentId, course_id: courseId, total_lessons: 0, completed_lessons: 0, percentage: 0 };
        }

        const completedLessons = await this.repository.countCompletedByStudentAndCourse(studentId, courseId);
        const percentage = Math.round((completedLessons / totalLessons) * 100);

        return {
            student_id: studentId,
            course_id: courseId,
            total_lessons: totalLessons,
            completed_lessons: completedLessons,
            percentage
        };
    }
}

module.exports = new LessonProgressService(progressRepository, lessonRepository);
