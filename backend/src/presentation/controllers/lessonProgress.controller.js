const progressService = require('../../application/services/lessonProgress.service');
const asyncHandler = require('../middlewares/asyncHandler');

class LessonProgressController {
    markComplete = asyncHandler(async (req, res) => {
        const { lesson_id, completed } = req.body;
        const result = await progressService.markComplete(req.user.id, lesson_id, completed !== false);
        res.json({ success: true, data: result });
    });

    getCourseProgress = asyncHandler(async (req, res) => {
        const studentId = req.params.studentId || req.user.id;
        const progress = await progressService.getCourseProgress(studentId, req.params.courseId);
        res.json({ success: true, data: progress });
    });
}

module.exports = new LessonProgressController();
