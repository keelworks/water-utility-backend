// Forbidden Error
class ForbiddenError extends AppError {
    constructor(message) {
        super(message, 403);
        this.name = "FORBIDDEN_ERROR";
    }
}