const { pool } = require('../database/connection');
const IRepository = require('../../domain/repositories/IRepository');
const Lesson = require('../../domain/entities/Lesson');

class LessonRepository extends IRepository {
    async findAll() {
        const [rows] = await pool.query('SELECT * FROM lessons ORDER BY course_id, order_index ASC');
        return rows.map(row => new Lesson(row));
    }

    async findById(id) {
        const [rows] = await pool.query('SELECT * FROM lessons WHERE id = ?', [id]);
        if (rows.length === 0) return null;
        return new Lesson(rows[0]);
    }

    async findByCourseId(courseId) {
        const [rows] = await pool.query(
            'SELECT * FROM lessons WHERE course_id = ? ORDER BY order_index ASC',
            [courseId]
        );
        return rows.map(row => new Lesson(row));
    }

    async countByCourseId(courseId) {
        const [rows] = await pool.query('SELECT COUNT(*) AS total FROM lessons WHERE course_id = ?', [courseId]);
        return rows[0].total;
    }

    async create(entity) {
        const { course_id, title, content_type, content, order_index } = entity;
        const [result] = await pool.query(
            'INSERT INTO lessons (course_id, title, content_type, content, order_index) VALUES (?, ?, ?, ?, ?)',
            [course_id, title, content_type, content, order_index]
        );
        return this.findById(result.insertId);
    }

    async update(id, data) {
        const existing = await this.findById(id);
        if (!existing) return null;

        const merged = new Lesson({ ...existing, ...data, id });
        await pool.query(
            'UPDATE lessons SET title = ?, content_type = ?, content = ?, order_index = ? WHERE id = ?',
            [merged.title, merged.content_type, merged.content, merged.order_index, id]
        );
        return this.findById(id);
    }

    async delete(id) {
        const [result] = await pool.query('DELETE FROM lessons WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }
}

module.exports = new LessonRepository();
