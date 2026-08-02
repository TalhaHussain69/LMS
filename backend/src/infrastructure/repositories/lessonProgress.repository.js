const { pool } = require('../database/connection');
const IRepository = require('../../domain/repositories/IRepository');
const LessonProgress = require('../../domain/entities/LessonProgress');

class LessonProgressRepository extends IRepository {
    async findByStudentAndCourse(studentId, courseId) {
        const [rows] = await pool.query(`
            SELECT lp.* FROM lesson_progress lp
            JOIN lessons l ON l.id = lp.lesson_id
            WHERE lp.student_id = ? AND l.course_id = ?
        `, [studentId, courseId]);
        return rows.map(row => new LessonProgress(row));
    }

    async countCompletedByStudentAndCourse(studentId, courseId) {
        const [rows] = await pool.query(`
            SELECT COUNT(*) AS total FROM lesson_progress lp
            JOIN lessons l ON l.id = lp.lesson_id
            WHERE lp.student_id = ? AND l.course_id = ? AND lp.completed = TRUE
        `, [studentId, courseId]);
        return rows[0].total;
    }

    async upsert(studentId, lessonId, completed) {
        await pool.query(`
            INSERT INTO lesson_progress (student_id, lesson_id, completed, completed_at)
            VALUES (?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE completed = VALUES(completed), completed_at = VALUES(completed_at)
        `, [studentId, lessonId, completed, completed ? new Date() : null]);

        const [rows] = await pool.query(
            'SELECT * FROM lesson_progress WHERE student_id = ? AND lesson_id = ?',
            [studentId, lessonId]
        );
        return new LessonProgress(rows[0]);
    }
}

module.exports = new LessonProgressRepository();
