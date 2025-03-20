// Not Found Error
class NotFoundError extends AppError {
    constructor(message) {
        super(message, 404);
        this.name = "NOT_FOUND_ERROR";
    }
}