const { pool } = require('../database/connection');
const IRepository = require('../../domain/repositories/IRepository');
const Quiz = require('../../domain/entities/Quiz');

class QuizRepository extends IRepository {
    async findAll() {
        const [rows] = await pool.query(`
            SELECT q.*, c.name AS course_name
            FROM quizzes q JOIN courses c ON c.id = q.course_id
            ORDER BY q.created_at DESC
        `);
        return rows;
    }

    async findById(id) {
        const [rows] = await pool.query('SELECT * FROM quizzes WHERE id = ?', [id]);
        if (rows.length === 0) return null;
        return new Quiz(rows[0]);
    }

    async findByCourseId(courseId) {
        const [rows] = await pool.query('SELECT * FROM quizzes WHERE course_id = ?', [courseId]);
        return rows.map(row => new Quiz(row));
    }

    async create(entity) {
        const { course_id, title, description, time_limit_minutes, created_by } = entity;
        const [result] = await pool.query(
            'INSERT INTO quizzes (course_id, title, description, time_limit_minutes, created_by) VALUES (?, ?, ?, ?, ?)',
            [course_id, title, description, time_limit_minutes, created_by]
        );
        return this.findById(result.insertId);
    }

    async delete(id) {
        const [result] = await pool.query('DELETE FROM quizzes WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }
}

module.exports = new QuizRepository();
