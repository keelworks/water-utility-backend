const { AppError } = require("./AppError");

// Unauthorized Error
class UnauthorizedError extends AppError {
    constructor(message) {
        super(message, 401);
        this.name = "UNAUTHORIZED_ERROR";
        this.location ='/loign'
    }
}

module.exports = UnauthorizedError;