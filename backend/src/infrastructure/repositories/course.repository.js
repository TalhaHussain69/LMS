const { pool } = require('../database/connection');
const IRepository = require('../../domain/repositories/IRepository');
const Course = require('../../domain/entities/Course');

class CourseRepository extends IRepository {
    async findAll() {
        const [rows] = await pool.query('SELECT * FROM courses ORDER BY id DESC');
        return rows.map(row => new Course(row));
    }

    async findById(id) {
        const [rows] = await pool.query('SELECT * FROM courses WHERE id = ?', [id]);
        if (rows.length === 0) return null;
        return new Course(rows[0]);
    }

    async findByInstructorId(instructorId) {
        const [rows] = await pool.query('SELECT * FROM courses WHERE instructor_id = ? ORDER BY id DESC', [instructorId]);
        return rows.map(row => new Course(row));
    }

    async findByIds(ids) {
        if (!ids.length) return [];
        const [rows] = await pool.query('SELECT * FROM courses WHERE id IN (?) ORDER BY id DESC', [ids]);
        return rows.map(row => new Course(row));
    }

    async create(courseEntity) {
        const { name, code, credit_hours, instructor_id } = courseEntity;
        const [result] = await pool.query(
            'INSERT INTO courses (name, code, credit_hours, instructor_id) VALUES (?, ?, ?, ?)',
            [name, code, credit_hours, instructor_id || null]
        );
        return this.findById(result.insertId);
    }

    async update(id, data) {
        const existing = await this.findById(id);
        if (!existing) return null;

        const merged = new Course({ ...existing, ...data, id });
        await pool.query(
            'UPDATE courses SET name = ?, code = ?, credit_hours = ?, instructor_id = ? WHERE id = ?',
            [merged.name, merged.code, merged.credit_hours, merged.instructor_id, id]
        );
        return this.findById(id);
    }

    async delete(id) {
        const [result] = await pool.query('DELETE FROM courses WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }
}

module.exports = new CourseRepository();
