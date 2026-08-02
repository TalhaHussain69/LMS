const analyticsService = require('../../application/services/analytics.service');
const asyncHandler = require('../middlewares/asyncHandler');

class AnalyticsController {
    getDashboard = asyncHandler(async (req, res) => {
        const data = await analyticsService.getDashboard(req.user);
        res.json({ success: true, data });
    });
}

module.exports = new AnalyticsController();
