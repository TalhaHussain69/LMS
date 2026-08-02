const { pool } = require('../database/connection');
const IRepository = require('../../domain/repositories/IRepository');
const User = require('../../domain/entities/User');

class UserRepository extends IRepository {
    async findAll() {
        const [rows] = await pool.query('SELECT * FROM users ORDER BY id DESC');
        return rows.map(row => new User(row));
    }

    async findById(id) {
        const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
        if (rows.length === 0) return null;
        return new User(rows[0]);
    }

    async findByEmail(email) {
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length === 0) return null;
        return new User(rows[0]);
    }

    async create(userEntity) {
        const { name, email, password_hash, role } = userEntity;
        const [result] = await pool.query(
            'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
            [name, email, password_hash, role]
        );
        return this.findById(result.insertId);
    }

    async update(id, data) {
        const existing = await this.findById(id);
        if (!existing) return null;

        const merged = new User({ ...existing, ...data, id, password_hash: existing.password_hash });
        await pool.query(
            'UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?',
            [merged.name, merged.email, merged.role, id]
        );
        return this.findById(id);
    }

    async updatePasswordHash(id, password_hash) {
        await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [password_hash, id]);
        return this.findById(id);
    }

    async delete(id) {
        const [result] = await pool.query('DELETE FROM users WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }

    async countByRole(role) {
        const [[{ count }]] = await pool.query('SELECT COUNT(*) AS count FROM users WHERE role = ?', [role]);
        return count;
    }
}

module.exports = new UserRepository();
