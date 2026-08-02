function errorMiddleware(err, req, res, next) {
    console.error('❌ Error:', err.message);

    let statusCode = 500;
    const message = err.message || 'Internal Server Error';

    if (message.toLowerCase().includes('not found')) {
        statusCode = 404;
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