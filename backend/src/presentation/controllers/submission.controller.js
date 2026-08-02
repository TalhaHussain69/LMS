const submissionService = require('../../application/services/submission.service');
const asyncHandler = require('../middlewares/asyncHandler');

class SubmissionController {
    getByAssignment = asyncHandler(async (req, res) => {
        const submissions = await submissionService.getAssignmentSubmissions(req.params.assignmentId);
        res.json({ success: true, data: submissions });
    });

    getMine = asyncHandler(async (req, res) => {
        const submissions = await submissionService.getStudentSubmissions(req.user.id);
        res.json({ success: true, data: submissions });
    });

    submit = asyncHandler(async (req, res) => {
        const { assignment_id, content } = req.body;
        const submission = await submissionService.submit(req.user.id, assignment_id, content);
        res.status(201).json({ success: true, data: submission });
    });

    grade = asyncHandler(async (req, res) => {
        const { marks_obtained, feedback } = req.body;
        const submission = await submissionService.gradeSubmission(req.params.id, marks_obtained, feedback);
        res.json({ success: true, data: submission });
    });
}

module.exports = new SubmissionController();
