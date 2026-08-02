const { pool } = require('../database/connection');
const IRepository = require('../../domain/repositories/IRepository');
const Attendance = require('../../domain/entities/Attendance');

class AttendanceRepository extends IRepository {
    async findAll() {
        const [rows] = await pool.query(`
            SELECT a.*, s.name AS student_name, c.name AS course_name
            FROM attendance a
            JOIN students s ON s.id = a.student_id
            JOIN courses c ON c.id = a.course_id
            ORDER BY a.date DESC
        `);
        return rows;
    }

    async findById(id) {
        const [rows] = await pool.query('SELECT * FROM attendance WHERE id = ?', [id]);
        if (rows.length === 0) return null;
        return new Attendance(rows[0]);
    }

    async findByStudentId(studentId) {
        const [rows] = await pool.query(`
            SELECT a.*, c.name AS course_name
            FROM attendance a
            JOIN courses c ON c.id = a.course_id
            WHERE a.student_id = ?
            ORDER BY a.date DESC
        `, [studentId]);
        return rows;
    }

    /** Attendance across every course this instructor teaches. */
    async findByInstructorId(instructorId) {
        const [rows] = await pool.query(`
            SELECT a.*, s.name AS student_name, c.name AS course_name
            FROM attendance a
            JOIN students s ON s.id = a.student_id
            JOIN courses c ON c.id = a.course_id
            WHERE c.instructor_id = ?
            ORDER BY a.date DESC
        `, [instructorId]);
        return rows;
    }

    /** One student's attendance, but only within courses this instructor teaches. */
    async findByStudentIdForInstructor(studentId, instructorId) {
        const [rows] = await pool.query(`
            SELECT a.*, c.name AS course_name
            FROM attendance a
            JOIN courses c ON c.id = a.course_id
            WHERE a.student_id = ? AND c.instructor_id = ?
            ORDER BY a.date DESC
        `, [studentId, instructorId]);
        return rows;
    }

    async create(attendanceEntity) {
        const { student_id, course_id, date, status } = attendanceEntity;
        const [result] = await pool.query(
            'INSERT INTO attendance (student_id, course_id, date, status) VALUES (?, ?, ?, ?)',
            [student_id, course_id, date, status]
        );
        return this.findById(result.insertId);
    }

    async update(id, data) {
        const existing = await this.findById(id);
        if (!existing) return null;

        const merged = new Attendance({ ...existing, ...data, id });
        await pool.query('UPDATE attendance SET status = ? WHERE id = ?', [merged.status, id]);
        return this.findById(id);
    }

    async delete(id) {
        const [result] = await pool.query('DELETE FROM attendance WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }
}

module.exports = new AttendanceRepository();
