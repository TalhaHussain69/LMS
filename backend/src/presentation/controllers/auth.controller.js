const authService = require('../../application/services/auth.service');
const userRepository = require('../../infrastructure/repositories/user.repository');
const asyncHandler = require('../middlewares/asyncHandler');

class AuthController {
    register = asyncHandler(async (req, res) => {
        const result = await authService.register(req.body);
        res.status(201).json({ success: true, data: result });
    });

    login = asyncHandler(async (req, res) => {
        const result = await authService.login(req.body);
        res.json({ success: true, data: result });
    });

    me = asyncHandler(async (req, res) => {
        const user = await userRepository.findById(req.user.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        res.json({ success: true, data: user.toSafeObject() });
    });
}

module.exports = new AuthController();