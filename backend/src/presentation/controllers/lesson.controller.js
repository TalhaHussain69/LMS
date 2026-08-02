const lessonService = require('../../application/services/lesson.service');
const asyncHandler = require('../middlewares/asyncHandler');

class LessonController {
    getByCourse = asyncHandler(async (req, res) => {
        const lessons = await lessonService.getCourseLessons(req.params.courseId, req.user);
        res.json({ success: true, data: lessons });
    });

    create = asyncHandler(async (req, res) => {
        const lesson = await lessonService.createLesson(req.body, req.user);
        res.status(201).json({ success: true, data: lesson });
    });

    update = asyncHandler(async (req, res) => {
        const lesson = await lessonService.updateLesson(req.params.id, req.body, req.user);
        res.json({ success: true, data: lesson });
    });

    remove = asyncHandler(async (req, res) => {
        await lessonService.deleteLesson(req.params.id, req.user);
        res.json({ success: true, message: 'Lesson deleted successfully' });
    });
}

module.exports = new LessonController();
