
// Validation Error
class ValidationError extends AppError {
    constructor(message) {
        super(message, 400);
        this.name = "VALIDATION_ERROR";
    }
}