const { pool } = require('../database/connection');
const IRepository = require('../../domain/repositories/IRepository');
const Submission = require('../../domain/entities/Submission');

class SubmissionRepository extends IRepository {
    async findByAssignmentId(assignmentId) {
        const [rows] = await pool.query(`
            SELECT s.*, u.name AS student_name
            FROM submissions s JOIN users u ON u.id = s.student_id
            WHERE s.assignment_id = ?
            ORDER BY s.submitted_at DESC
        `, [assignmentId]);
        return rows;
    }

    async findByStudentId(studentId) {
        const [rows] = await pool.query(`
            SELECT s.*, a.title AS assignment_title, a.max_marks, a.course_id
            FROM submissions s JOIN assignments a ON a.id = s.assignment_id
            WHERE s.student_id = ?
            ORDER BY s.submitted_at DESC
        `, [studentId]);
        return rows;
    }

    async findById(id) {
        const [rows] = await pool.query('SELECT * FROM submissions WHERE id = ?', [id]);
        if (rows.length === 0) return null;
        return new Submission(rows[0]);
    }

    async findByAssignmentAndStudent(assignmentId, studentId) {
        const [rows] = await pool.query(
            'SELECT * FROM submissions WHERE assignment_id = ? AND student_id = ?',
            [assignmentId, studentId]
        );
        if (rows.length === 0) return null;
        return new Submission(rows[0]);
    }

    async create(entity) {
        const { assignment_id, student_id, content } = entity;
        const [result] = await pool.query(
            'INSERT INTO submissions (assignment_id, student_id, content) VALUES (?, ?, ?)',
            [assignment_id, student_id, content]
        );
        return this.findById(result.insertId);
    }

    async grade(id, marksObtained, feedback) {
        await pool.query(
            'UPDATE submissions SET marks_obtained = ?, feedback = ?, graded_at = NOW() WHERE id = ?',
            [marksObtained, feedback || null, id]
        );
        return this.findById(id);
    }
}

module.exports = new SubmissionRepository();
