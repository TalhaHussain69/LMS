const quizService = require('../../application/services/quiz.service');
const asyncHandler = require('../middlewares/asyncHandler');

class QuizController {
    getAll = asyncHandler(async (req, res) => {
        const quizzes = await quizService.getAllQuizzes();
        res.json({ success: true, data: quizzes });
    });

    getByCourse = asyncHandler(async (req, res) => {
        const quizzes = await quizService.getCourseQuizzes(req.params.courseId);
        res.json({ success: true, data: quizzes });
    });

    // Instructor/Admin view — includes correct answers
    getWithAnswers = asyncHandler(async (req, res) => {
        const quiz = await quizService.getQuizWithAnswers(req.params.id);
        res.json({ success: true, data: quiz });
    });

    // Student view — about to attempt, no correct answers included
    getForAttempt = asyncHandler(async (req, res) => {
        const quiz = await quizService.getQuizForAttempt(req.params.id);
        res.json({ success: true, data: quiz });
    });

    create = asyncHandler(async (req, res) => {
        const quiz = await quizService.createQuiz(req.body, req.user.id);
        res.status(201).json({ success: true, data: quiz });
    });

    addQuestion = asyncHandler(async (req, res) => {
        const question = await quizService.addQuestion(req.params.id, req.body);
        res.status(201).json({ success: true, data: question });
    });

    remove = asyncHandler(async (req, res) => {
        await quizService.deleteQuiz(req.params.id);
        res.json({ success: true, message: 'Quiz deleted successfully' });
    });
}

module.exports = new QuizController();
