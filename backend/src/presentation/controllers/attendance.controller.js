const attendanceService = require('../../application/services/attendance.service');
const asyncHandler = require('../middlewares/asyncHandler');

class AttendanceController {
    getAll = asyncHandler(async (req, res) => {
        const records = await attendanceService.getAllAttendance();
        res.json({ success: true, data: records });
    });

    getByStudent = asyncHandler(async (req, res) => {
        const records = await attendanceService.getStudentAttendance(req.params.studentId);
        res.json({ success: true, data: records });
    });

    create = asyncHandler(async (req, res) => {
        const record = await attendanceService.markAttendance(req.body);
        res.status(201).json({ success: true, data: record });
    });

    update = asyncHandler(async (req, res) => {
        const record = await attendanceService.updateAttendance(req.params.id, req.body);
        res.json({ success: true, data: record });
    });

    remove = asyncHandler(async (req, res) => {
        await attendanceService.deleteAttendance(req.params.id);
        res.json({ success: true, message: 'Attendance record deleted successfully' });
    });
}

module.exports = new AttendanceController();