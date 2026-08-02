const { pool } = require('../database/connection');
const IRepository = require('../../domain/repositories/IRepository');
const Student = require('../../domain/entities/Student');

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