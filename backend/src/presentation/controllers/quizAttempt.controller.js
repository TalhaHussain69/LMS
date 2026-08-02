const attemptService = require('../../application/services/quizAttempt.service');
const asyncHandler = require('../middlewares/asyncHandler');

class QuizAttemptController {
    getByQuiz = asyncHandler(async (req, res) => {
        const attempts = await attemptService.getQuizAttempts(req.params.quizId);
        res.json({ success: true, data: attempts });
    });

    getMine = asyncHandler(async (req, res) => {
        const attempts = await attemptService.getStudentAttempts(req.user.id);
        res.json({ success: true, data: attempts });
    });

    submit = asyncHandler(async (req, res) => {
        const { quiz_id, answers } = req.body;
        const result = await attemptService.submitAttempt(req.user.id, quiz_id, answers || []);
        res.status(201).json({ success: true, data: result });
    });
}

module.exports = new QuizAttemptController();
