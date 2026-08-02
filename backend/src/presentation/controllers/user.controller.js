const userService = require('../../application/services/user.service');
const asyncHandler = require('../middlewares/asyncHandler');

class UserController {
    getAll = asyncHandler(async (req, res) => {
        const users = await userService.getAllUsers();
        res.json({ success: true, data: users });
    });

    create = asyncHandler(async (req, res) => {
        const user = await userService.createUser(req.body);
        res.status(201).json({ success: true, data: user });
    });

    update = asyncHandler(async (req, res) => {
        const user = await userService.updateUser(req.params.id, req.body);
        res.json({ success: true, data: user });
    });

    resetPassword = asyncHandler(async (req, res) => {
        const user = await userService.resetPassword(req.params.id, req.body.password);
        res.json({ success: true, data: user });
    });

    remove = asyncHandler(async (req, res) => {
        await userService.deleteUser(req.params.id, req.user.id);
        res.json({ success: true, message: 'User deleted successfully' });
    });
}

module.exports = new UserController();
