const { pool } = require('../database/connection');
const IRepository = require('../../domain/repositories/IRepository');
const QuizQuestion = require('../../domain/entities/QuizQuestion');

class QuizQuestionRepository extends IRepository {
    async findByQuizId(quizId) {
        const [rows] = await pool.query('SELECT * FROM quiz_questions WHERE quiz_id = ?', [quizId]);
        return rows.map(row => new QuizQuestion(row));
    }

    async findById(id) {
        const [rows] = await pool.query('SELECT * FROM quiz_questions WHERE id = ?', [id]);
        if (rows.length === 0) return null;
        return new QuizQuestion(rows[0]);
    }

    async create(entity) {
        const { quiz_id, question_text, option_a, option_b, option_c, option_d, correct_option, marks } = entity;
        const [result] = await pool.query(
            `INSERT INTO quiz_questions
             (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_option, marks)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [quiz_id, question_text, option_a, option_b, option_c, option_d, correct_option, marks]
        );
        return this.findById(result.insertId);
    }

    async delete(id) {
        const [result] = await pool.query('DELETE FROM quiz_questions WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }

    async totalMarksForQuiz(quizId) {
        const [rows] = await pool.query(
            'SELECT COALESCE(SUM(marks), 0) AS total FROM quiz_questions WHERE quiz_id = ?',
            [quizId]
        );
        return Number(rows[0].total);
    }
}

module.exports = new QuizQuestionRepository();
