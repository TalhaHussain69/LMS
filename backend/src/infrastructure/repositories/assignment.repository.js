const { pool } = require('../database/connection');
const IRepository = require('../../domain/repositories/IRepository');
const Assignment = require('../../domain/entities/Assignment');

class AssignmentRepository extends IRepository {
    async findAll() {
        const [rows] = await pool.query(`
            SELECT a.*, c.name AS course_name
            FROM assignments a JOIN courses c ON c.id = a.course_id
            ORDER BY a.due_date ASC
        `);
        return rows;
    }

    async findById(id) {
        const [rows] = await pool.query('SELECT * FROM assignments WHERE id = ?', [id]);
        if (rows.length === 0) return null;
        return new Assignment(rows[0]);
    }

    async findByCourseId(courseId) {
        const [rows] = await pool.query(
            'SELECT * FROM assignments WHERE course_id = ? ORDER BY due_date ASC',
            [courseId]
        );
        return rows.map(row => new Assignment(row));
    }

    async create(entity) {
        const { course_id, title, description, due_date, max_marks, created_by } = entity;
        const [result] = await pool.query(
            'INSERT INTO assignments (course_id, title, description, due_date, max_marks, created_by) VALUES (?, ?, ?, ?, ?, ?)',
            [course_id, title, description, due_date, max_marks, created_by]
        );
        return this.findById(result.insertId);
    }

    async update(id, data) {
        const existing = await this.findById(id);
        if (!existing) return null;

        const merged = new Assignment({ ...existing, ...data, id });
        await pool.query(
            'UPDATE assignments SET title = ?, description = ?, due_date = ?, max_marks = ? WHERE id = ?',
            [merged.title, merged.description, merged.due_date, merged.max_marks, id]
        );
        return this.findById(id);
    }

    async delete(id) {
        const [result] = await pool.query('DELETE FROM assignments WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }
}

module.exports = new AssignmentRepository();
