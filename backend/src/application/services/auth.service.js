const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userRepository = require('../../infrastructure/repositories/user.repository');
const User = require('../../domain/entities/User');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const JWT_EXPIRES_IN = '7d';

class AuthService {
    constructor(repository) {
        this.repository = repository;
    }

    async register({ name, email, password, role }) {
        if (!password || password.length < 6) {
            throw new Error('Password must be at least 6 characters long');
        }

        const existing = await this.repository.findByEmail(email);
        if (existing) throw new Error('An account with this email already exists');

        new User({ id: null, name, email, password_hash: 'placeholder', role });

        const password_hash = await bcrypt.hash(password, 10);
        const user = await this.repository.create({ name, email, password_hash, role: role || 'student' });

        return this._buildAuthResponse(user);
    }

    async login({ email, password }) {
        const user = await this.repository.findByEmail(email);
        if (!user) throw new Error('Invalid email or password');

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) throw new Error('Invalid email or password');

        return this._buildAuthResponse(user);
    }

    _buildAuthResponse(user) {
        const token = jwt.sign(
            { id: user.id, role: user.role, name: user.name, email: user.email },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );
        return { token, user: user.toSafeObject() };
    }
}

module.exports = new AuthService(userRepository);
module.exports.JWT_SECRET = JWT_SECRET;