const quizRepository = require('../../infrastructure/repositories/quiz.repository');
const questionRepository = require('../../infrastructure/repositories/quizQuestion.repository');
const courseRepository = require('../../infrastructure/repositories/course.repository');
const { assertCourseAccess, assertCanManageCourse } = require('./access.util');

class QuizService {
    constructor(repository, questionRepo, courseRepo) {
        this.repository = repository;
        this.questionRepository = questionRepo;
        this.courseRepository = courseRepo;
    }

    // Admin-only route — full cross-course list.
    async getAllQuizzes() {
        return this.repository.findAll();
    }

    async getCourseQuizzes(courseId, user) {
        await assertCourseAccess(courseId, user);
        return this.repository.findByCourseId(courseId);
    }

    async getQuizById(id) {
        const quiz = await this.repository.findById(id);
        if (!quiz) throw new Error('Quiz not found');
        return quiz;
    }

    // Full quiz with questions, correct answers included — instructor-only view
    async getQuizWithAnswers(id, user) {
        const quiz = await this.getQuizById(id);
        if (user.role === 'teacher') await assertCanManageCourse(quiz.course_id, user);
        const questions = await this.questionRepository.findByQuizId(id);
        return { ...quiz, questions };
    }

    // Quiz for a student about to attempt it — correct_option stripped out
    async getQuizForAttempt(id, user) {
        const quiz = await this.getQuizById(id);
        await assertCourseAccess(quiz.course_id, user);
        const questions = await this.questionRepository.findByQuizId(id);
        return { ...quiz, questions: questions.map(q => q.toStudentView()) };
    }

    async createQuiz(data, user) {
        const course = await this.courseRepository.findById(data.course_id);
        if (!course) throw new Error('Course not found');
        if (user.role === 'teacher') await assertCanManageCourse(data.course_id, user);
        return this.repository.create({ ...data, created_by: user.id });
    }

    async addQuestion(quizId, data, user) {
        const quiz = await this.getQuizById(quizId);
        if (user.role === 'teacher') await assertCanManageCourse(quiz.course_id, user);
        return this.questionRepository.create({ ...data, quiz_id: quizId });
    }

    async deleteQuiz(id, user) {
        const quiz = await this.getQuizById(id);
        if (user.role === 'teacher') await assertCanManageCourse(quiz.course_id, user);
        return this.repository.delete(id);
    }
}

module.exports = new QuizService(quizRepository, questionRepository, courseRepository);
