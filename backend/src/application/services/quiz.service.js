const quizRepository = require('../../infrastructure/repositories/quiz.repository');
const questionRepository = require('../../infrastructure/repositories/quizQuestion.repository');
const courseRepository = require('../../infrastructure/repositories/course.repository');

class QuizService {
    constructor(repository, questionRepo, courseRepo) {
        this.repository = repository;
        this.questionRepository = questionRepo;
        this.courseRepository = courseRepo;
    }

    async getAllQuizzes() {
        return this.repository.findAll();
    }

    async getCourseQuizzes(courseId) {
        return this.repository.findByCourseId(courseId);
    }

    async getQuizById(id) {
        const quiz = await this.repository.findById(id);
        if (!quiz) throw new Error('Quiz not found');
        return quiz;
    }

    // Full quiz with questions, correct answers included — instructor-only view
    async getQuizWithAnswers(id) {
        const quiz = await this.getQuizById(id);
        const questions = await this.questionRepository.findByQuizId(id);
        return { ...quiz, questions };
    }

    // Quiz for a student about to attempt it — correct_option stripped out
    async getQuizForAttempt(id) {
        const quiz = await this.getQuizById(id);
        const questions = await this.questionRepository.findByQuizId(id);
        return { ...quiz, questions: questions.map(q => q.toStudentView()) };
    }

    async createQuiz(data, instructorId) {
        const course = await this.courseRepository.findById(data.course_id);
        if (!course) throw new Error('Course not found');
        return this.repository.create({ ...data, created_by: instructorId });
    }

    async addQuestion(quizId, data) {
        await this.getQuizById(quizId);
        return this.questionRepository.create({ ...data, quiz_id: quizId });
    }

    async deleteQuiz(id) {
        await this.getQuizById(id);
        return this.repository.delete(id);
    }
}

module.exports = new QuizService(quizRepository, questionRepository, courseRepository);
