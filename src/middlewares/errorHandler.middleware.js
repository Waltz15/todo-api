function errorHandler(err, req, res, next) {
    console.error(err); // <--- NYALAIN INI BIAR KELIHATAN DI TERMINAL!

    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";

    // Handle Mongoose Validation Error
    if (err.name === "ValidationError") {
        statusCode = 400;
        message = Object.values(err.errors)
        .map((item) => item.message)
        .join(", ");
    }

    // Handle Mongoose Duplicate Key Error
    if (err.code === 11000) {
        statusCode = 409;
        const field = Object.keys(err.keyValue).join(", ");
        message = `Duplicate Value for field: ${field}`;
    }

    // Return response bersih tanpa stack trace
    res.status(statusCode).json({
        success: false,
        message, 
    });
}

module.exports = errorHandler;