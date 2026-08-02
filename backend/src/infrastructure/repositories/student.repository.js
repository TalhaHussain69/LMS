const { pool } = require('../database/connection');
const IRepository = require('../../domain/repositories/IRepository');
const Student = require('../../domain/entities/Student');

/**
 * StudentRepository (Infrastructure Layer)
 * Implements IRepository contract using MySQL.
 * This is the ONLY place raw SQL for students is written.
 */
class StudentRepository extends IRepository {
    async findAll() {
        const [rows] = await pool.query('SELECT * FROM students ORDER BY id DESC');
        return rows.map(row => new Student(row));
    }

    async findById(id) {
        const [rows] = await pool.query('SELECT * FROM students WHERE id = ?', [id]);
        if (rows.length === 0) return null;
        return new Student(rows[0]);
    }

    async findByEmail(email) {
        const [rows] = await pool.query('SELECT * FROM students WHERE email = ?', [email]);
        if (rows.length === 0) return null;
        return new Student(rows[0]);
    }

    /** Distinct students enrolled in any course taught by this instructor. */
    async findByInstructorId(instructorId) {
        const [rows] = await pool.query(`
            SELECT DISTINCT s.* FROM students s
            JOIN enrollments e ON e.student_id = s.id
            JOIN courses c ON c.id = e.course_id
            WHERE c.instructor_id = ?
            ORDER BY s.id DESC
        `, [instructorId]);
        return rows.map(row => new Student(row));
    }

    /** True if this student is enrolled in at least one course taught by this instructor. */
    async isEnrolledUnderInstructor(studentId, instructorId) {
        const [rows] = await pool.query(`
            SELECT 1 FROM enrollments e JOIN courses c ON c.id = e.course_id
            WHERE e.student_id = ? AND c.instructor_id = ? LIMIT 1
        `, [studentId, instructorId]);
        return rows.length > 0;
    }

    async create(studentEntity) {
        const { name, email, phone } = studentEntity;
        const [result] = await pool.query(
            'INSERT INTO students (name, email, phone) VALUES (?, ?, ?)',
            [name, email, phone || null]
        );
        return this.findById(result.insertId);
    }

    async update(id, data) {
        const existing = await this.findById(id);
        if (!existing) return null;

        const merged = new Student({ ...existing, ...data, id });
        await pool.query(
            'UPDATE students SET name = ?, email = ?, phone = ? WHERE id = ?',
            [merged.name, merged.email, merged.phone, id]
        );
        return this.findById(id);
    }

    async delete(id) {
        const [result] = await pool.query('DELETE FROM students WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }
}

module.exports = new StudentRepository();
