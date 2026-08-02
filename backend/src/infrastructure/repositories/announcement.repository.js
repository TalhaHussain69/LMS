const { pool } = require('../database/connection');
const IRepository = require('../../domain/repositories/IRepository');
const Announcement = require('../../domain/entities/Announcement');

class AnnouncementRepository extends IRepository {
    async findAll() {
        const [rows] = await pool.query(`
            SELECT a.*, u.name AS posted_by_name, c.name AS course_name
            FROM announcements a
            JOIN users u ON u.id = a.posted_by
            LEFT JOIN courses c ON c.id = a.course_id
            ORDER BY a.created_at DESC
        `);
        return rows;
    }

    async findByCourseId(courseId) {
        const [rows] = await pool.query(`
            SELECT a.*, u.name AS posted_by_name
            FROM announcements a JOIN users u ON u.id = a.posted_by
            WHERE a.course_id = ? OR a.course_id IS NULL
            ORDER BY a.created_at DESC
        `, [courseId]);
        return rows;
    }

    async findById(id) {
        const [rows] = await pool.query('SELECT * FROM announcements WHERE id = ?', [id]);
        if (rows.length === 0) return null;
        return new Announcement(rows[0]);
    }

    async create(entity) {
        const { course_id, title, message, posted_by } = entity;
        const [result] = await pool.query(
            'INSERT INTO announcements (course_id, title, message, posted_by) VALUES (?, ?, ?, ?)',
            [course_id, title, message, posted_by]
        );
        return this.findById(result.insertId);
    }

    async delete(id) {
        const [result] = await pool.query('DELETE FROM announcements WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }
}

module.exports = new AnnouncementRepository();
