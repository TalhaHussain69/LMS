const bcrypt = require('bcryptjs');
const userRepository = require('../../infrastructure/repositories/user.repository');
const studentRepository = require('../../infrastructure/repositories/student.repository');

/**
 * UserService (Application Layer)
 * Admin-facing user management — separate from AuthService, which handles
 * self-registration/login. This service is only reachable by an Admin
 * (enforced by requireRole('admin') in the route).
 */
class UserService {
    constructor(repository, studentRepo) {
        this.repository = repository;
        this.studentRepository = studentRepo;
    }

    async getAllUsers() {
        const users = await this.repository.findAll();
        return users.map(u => u.toSafeObject());
    }

    async createUser({ name, email, password, role }) {
        if (!password || password.length < 6) {
            throw new Error('Password must be at least 6 characters long');
        }
        const existing = await this.repository.findByEmail(email);
        if (existing) throw new Error('A user with this email already exists');

        const password_hash = await bcrypt.hash(password, 10);
        const user = await this.repository.create({ name, email, password_hash, role: role || 'student' });

        // Keep the legacy "students" table (used by Enrollments/Attendance/Grades)
        // in sync by email so this new account's personal analytics work right away.
        if (user.role === 'student') {
            const linkedRecord = await this.studentRepository.findByEmail(email);
            if (!linkedRecord) {
                await this.studentRepository.create({ name, email, phone: null });
            }
        }

        return user.toSafeObject();
    }

    async updateUser(id, data) {
        const user = await this.repository.findById(id);
        if (!user) throw new Error('User not found');

        if (data.email && data.email !== user.email) {
            const existing = await this.repository.findByEmail(data.email);
            if (existing) throw new Error('Another user already uses this email');
        }

        const updated = await this.repository.update(id, data);
        return updated.toSafeObject();
    }

    async resetPassword(id, newPassword) {
        if (!newPassword || newPassword.length < 6) {
            throw new Error('Password must be at least 6 characters long');
        }
        const user = await this.repository.findById(id);
        if (!user) throw new Error('User not found');

        const password_hash = await bcrypt.hash(newPassword, 10);
        const updated = await this.repository.updatePasswordHash(id, password_hash);
        return updated.toSafeObject();
    }

    async deleteUser(id, requestingUserId) {
        const user = await this.repository.findById(id);
        if (!user) throw new Error('User not found');

        if (Number(id) === Number(requestingUserId)) {
            throw new Error('You cannot delete your own account while logged in');
        }
        if (user.role === 'admin') {
            const adminCount = await this.repository.countByRole('admin');
            if (adminCount <= 1) throw new Error('Cannot delete the last remaining admin');
        }

        return this.repository.delete(id);
    }
}

module.exports = new UserService(userRepository, studentRepository);
