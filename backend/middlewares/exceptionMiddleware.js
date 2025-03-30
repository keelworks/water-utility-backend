// Error handling middleware
export const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    
    if (process.env.NODE_ENV === 'development') {
        res.status(err.statusCode).send({
            timestamp: new Date(),
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack,
            location: err.location,
            path: req.originalUrl
        });
    } else {
        // Production error response
        if (err.isOperational) {
            res.status(err.statusCode).send({
                timestamp: new Date(),
                status: err.status,
                message: err.message,
                path: req.originalUrl,
                location: err.location,
            });
        } else {
            // Programming or unknown errors
            console.error('ERROR 💥', err);
            res.status(500).json({
                status: 'error',
                message: 'Something went wrong!',
                path: req.originalUrl
            });
        }
    }
};

// Async error wrapper
export const catchAsync = fn => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
};