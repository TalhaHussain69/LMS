const { pool } = require('../database/connection');
const QuizAttempt = require('../../domain/entities/QuizAttempt');
const QuizAnswer = require('../../domain/entities/QuizAnswer');

class QuizAttemptRepository {
    async findByQuizId(quizId) {
        const [rows] = await pool.query(`
            SELECT qa.*, u.name AS student_name
            FROM quiz_attempts qa JOIN users u ON u.id = qa.student_id
            WHERE qa.quiz_id = ?
            ORDER BY qa.submitted_at DESC
        `, [quizId]);
        return rows;
    }

    async findByStudentId(studentId) {
        const [rows] = await pool.query(`
            SELECT qa.*, q.title AS quiz_title, q.course_id
            FROM quiz_attempts qa JOIN quizzes q ON q.id = qa.quiz_id
            WHERE qa.student_id = ?
            ORDER BY qa.submitted_at DESC
        `, [studentId]);
        return rows;
    }

    async findByQuizAndStudent(quizId, studentId) {
        const [rows] = await pool.query(
            'SELECT * FROM quiz_attempts WHERE quiz_id = ? AND student_id = ?',
            [quizId, studentId]
        );
        if (rows.length === 0) return null;
        return new QuizAttempt(rows[0]);
    }

    async create({ quiz_id, student_id, score, total_marks }) {
        const [result] = await pool.query(
            'INSERT INTO quiz_attempts (quiz_id, student_id, score, total_marks) VALUES (?, ?, ?, ?)',
            [quiz_id, student_id, score, total_marks]
        );
        const [rows] = await pool.query('SELECT * FROM quiz_attempts WHERE id = ?', [result.insertId]);
        return new QuizAttempt(rows[0]);
    }

    async saveAnswer({ attempt_id, question_id, selected_option, is_correct }) {
        await pool.query(
            'INSERT INTO quiz_answers (attempt_id, question_id, selected_option, is_correct) VALUES (?, ?, ?, ?)',
            [attempt_id, question_id, selected_option, is_correct]
        );
    }

    async findAnswersByAttemptId(attemptId) {
        const [rows] = await pool.query('SELECT * FROM quiz_answers WHERE attempt_id = ?', [attemptId]);
        return rows.map(row => new QuizAnswer(row));
    }
}

module.exports = new QuizAttemptRepository();
