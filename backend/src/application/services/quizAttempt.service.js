const attemptRepository = require('../../infrastructure/repositories/quizAttempt.repository');
const questionRepository = require('../../infrastructure/repositories/quizQuestion.repository');
const quizRepository = require('../../infrastructure/repositories/quiz.repository');
const enrollmentRepository = require('../../infrastructure/repositories/enrollment.repository');

class QuizAttemptService {
    constructor(attemptRepo, questionRepo, quizRepo, enrollmentRepo) {
        this.repository = attemptRepo;
        this.questionRepository = questionRepo;
        this.quizRepository = quizRepo;
        this.enrollmentRepository = enrollmentRepo;
    }

    async getQuizAttempts(quizId) {
        return this.repository.findByQuizId(quizId);
    }

    async getStudentAttempts(studentId) {
        return this.repository.findByStudentId(studentId);
    }

    /**
     * Grades an MCQ quiz attempt server-side: takes the student's chosen
     * answers, compares each against the stored correct_option, and computes
     * a total score. The student never receives the answer key beforehand
     * (see QuizService.getQuizForAttempt).
     *
     * answers: [{ question_id, selected_option }, ...]
     */
    async submitAttempt(studentId, quizId, answers) {
        const quiz = await this.quizRepository.findById(quizId);
        if (!quiz) throw new Error('Quiz not found');

        const isEnrolled = await this.enrollmentRepository.exists(studentId, quiz.course_id);
        if (!isEnrolled) throw new Error('You must be enrolled in this course to attempt this quiz');

        const existing = await this.repository.findByQuizAndStudent(quizId, studentId);
        if (existing) throw new Error('You have already attempted this quiz');

        const questions = await this.questionRepository.findByQuizId(quizId);
        const questionMap = new Map(questions.map(q => [q.id, q]));

        let score = 0;
        let totalMarks = 0;
        const gradedAnswers = [];

        for (const question of questions) {
            totalMarks += Number(question.marks);
        }

        for (const answer of answers) {
            const question = questionMap.get(answer.question_id);
            if (!question) continue; // ignore answers for questions not in this quiz

            const isCorrect = question.isAnsweredCorrectly(answer.selected_option);
            if (isCorrect) score += Number(question.marks);

            gradedAnswers.push({
                question_id: question.id,
                selected_option: answer.selected_option,
                is_correct: isCorrect
            });
        }

        const attempt = await this.repository.create({ quiz_id: quizId, student_id: studentId, score, total_marks: totalMarks });

        for (const ga of gradedAnswers) {
            await this.repository.saveAnswer({ attempt_id: attempt.id, ...ga });
        }

        return { ...attempt, answers: gradedAnswers };
    }
}

module.exports = new QuizAttemptService(attemptRepository, questionRepository, quizRepository, enrollmentRepository);
