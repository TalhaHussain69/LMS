const { pool } = require('../database/connection');
const IRepository = require('../../domain/repositories/IRepository');
const Enrollment = require('../../domain/entities/Enrollment');

class EnrollmentRepository extends IRepository {
    async findAll() {
        const [rows] = await pool.query(`
            SELECT e.*, s.name AS student_name, c.name AS course_name, c.code AS course_code
            FROM enrollments e
            JOIN students s ON s.id = e.student_id
            JOIN courses c ON c.id = e.course_id
            ORDER BY e.id DESC
        `);
        return rows;
    }

    async findById(id) {
        const [rows] = await pool.query('SELECT * FROM enrollments WHERE id = ?', [id]);
        if (rows.length === 0) return null;
        return new Enrollment(rows[0]);
    }

    async findByStudentId(studentId) {
        const [rows] = await pool.query(`
            SELECT e.*, c.name AS course_name, c.code AS course_code, c.credit_hours, c.instructor_id
            FROM enrollments e
            JOIN courses c ON c.id = e.course_id
            WHERE e.student_id = ?
        `, [studentId]);
        return rows;
    }

    /** Enrollments across every course this instructor teaches. */
    async findByInstructorId(instructorId) {
        const [rows] = await pool.query(`
            SELECT e.*, s.name AS student_name, c.name AS course_name, c.code AS course_code
            FROM enrollments e
            JOIN students s ON s.id = e.student_id
            JOIN courses c ON c.id = e.course_id
            WHERE c.instructor_id = ?
            ORDER BY e.id DESC
        `, [instructorId]);
        return rows;
    }

    async exists(studentId, courseId) {
        const [rows] = await pool.query(
            'SELECT id FROM enrollments WHERE student_id = ? AND course_id = ?',
            [studentId, courseId]
        );
        return rows.length > 0;
    }

    async create(enrollmentEntity) {
        const { student_id, course_id } = enrollmentEntity;
        const [result] = await pool.query(
            'INSERT INTO enrollments (student_id, course_id) VALUES (?, ?)',
            [student_id, course_id]
        );
        return this.findById(result.insertId);
    }

    async delete(id) {
        const [result] = await pool.query('DELETE FROM enrollments WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }
}

module.exports = new EnrollmentRepository();
