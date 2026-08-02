const { pool } = require('../database/connection');
const IRepository = require('../../domain/repositories/IRepository');
const Grade = require('../../domain/entities/Grade');

class GradeRepository extends IRepository {
    async findAll() {
        const [rows] = await pool.query(`
            SELECT g.*, s.name AS student_name, c.name AS course_name
            FROM grades g
            JOIN students s ON s.id = g.student_id
            JOIN courses c ON c.id = g.course_id
            ORDER BY g.id DESC
        `);
        return rows;
    }

    async findById(id) {
        const [rows] = await pool.query('SELECT * FROM grades WHERE id = ?', [id]);
        if (rows.length === 0) return null;
        return new Grade(rows[0]);
    }

    async findByStudentId(studentId) {
        const [rows] = await pool.query(`
            SELECT g.*, c.name AS course_name, c.credit_hours
            FROM grades g
            JOIN courses c ON c.id = g.course_id
            WHERE g.student_id = ?
        `, [studentId]);
        return rows;
    }

    /** Grades across every course this instructor teaches. */
    async findByInstructorId(instructorId) {
        const [rows] = await pool.query(`
            SELECT g.*, s.name AS student_name, c.name AS course_name
            FROM grades g
            JOIN students s ON s.id = g.student_id
            JOIN courses c ON c.id = g.course_id
            WHERE c.instructor_id = ?
            ORDER BY g.id DESC
        `, [instructorId]);
        return rows;
    }

    /** One student's grades, but only within courses this instructor teaches. */
    async findByStudentIdForInstructor(studentId, instructorId) {
        const [rows] = await pool.query(`
            SELECT g.*, c.name AS course_name
            FROM grades g
            JOIN courses c ON c.id = g.course_id
            WHERE g.student_id = ? AND c.instructor_id = ?
        `, [studentId, instructorId]);
        return rows;
    }

    async findByStudentAndCourse(studentId, courseId) {
        const [rows] = await pool.query(
            'SELECT * FROM grades WHERE student_id = ? AND course_id = ?',
            [studentId, courseId]
        );
        if (rows.length === 0) return null;
        return new Grade(rows[0]);
    }

    async create(gradeEntity) {
        const { student_id, course_id, marks, grade } = gradeEntity;
        const [result] = await pool.query(
            'INSERT INTO grades (student_id, course_id, marks, grade) VALUES (?, ?, ?, ?)',
            [student_id, course_id, marks, grade]
        );
        return this.findById(result.insertId);
    }

    async update(id, data) {
        const existing = await this.findById(id);
        if (!existing) return null;

        const merged = new Grade({ ...existing, ...data, id, grade: null });
        await pool.query(
            'UPDATE grades SET marks = ?, grade = ? WHERE id = ?',
            [merged.marks, merged.grade, id]
        );
        return this.findById(id);
    }

    async delete(id) {
        const [result] = await pool.query('DELETE FROM grades WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }
}

module.exports = new GradeRepository();
