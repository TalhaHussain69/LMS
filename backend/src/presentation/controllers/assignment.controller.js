const assignmentService = require('../../application/services/assignment.service');
const asyncHandler = require('../middlewares/asyncHandler');

class AssignmentController {
    getAll = asyncHandler(async (req, res) => {
        const assignments = await assignmentService.getAllAssignments();
        res.json({ success: true, data: assignments });
    });

    getByCourse = asyncHandler(async (req, res) => {
        const assignments = await assignmentService.getCourseAssignments(req.params.courseId);
        res.json({ success: true, data: assignments });
    });

    create = asyncHandler(async (req, res) => {
        const assignment = await assignmentService.createAssignment(req.body, req.user.id);
        res.status(201).json({ success: true, data: assignment });
    });

    update = asyncHandler(async (req, res) => {
        const assignment = await assignmentService.updateAssignment(req.params.id, req.body);
        res.json({ success: true, data: assignment });
    });

    remove = asyncHandler(async (req, res) => {
        await assignmentService.deleteAssignment(req.params.id);
        res.json({ success: true, message: 'Assignment deleted successfully' });
    });
}

module.exports = new AssignmentController();
