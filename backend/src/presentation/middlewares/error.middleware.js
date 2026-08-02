/**
 * Centralized error handler (Presentation Layer).
 * Services throw plain Error objects with meaningful messages —
 * this middleware turns them into consistent JSON responses,
 * so controllers don't need repetitive try/catch formatting logic.
 */
function errorMiddleware(err, req, res, next) {
    console.error('❌ Error:', err.message);

    let statusCode = 500;
    const message = err.message || 'Internal Server Error';

    if (message.toLowerCase().includes('not found')) {
        statusCode = 404;
    } else if (
        message.toLowerCase().includes('permission') ||
        message.toLowerCase().includes('forbidden') ||
        message.toLowerCase().includes('not enrolled') ||
        message.toLowerCase().includes('not allowed') ||
        message.toLowerCase().includes('only view your own') ||
        message.toLowerCase().includes('only access your own')
    ) {
        statusCode = 403;
    } else if (
        message.toLowerCase().includes('already') ||
        message.toLowerCase().includes('required') ||
        message.toLowerCase().includes('must be') ||
        message.toLowerCase().includes('invalid') ||
        message.toLowerCase().includes('cannot')
    ) {
        statusCode = 400;
    }

    res.status(statusCode).json({
        success: false,
        message
    });
}

module.exports = errorMiddleware;
