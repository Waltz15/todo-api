const { validationResult } = require("express-validator");
const AppError = require("../utils/AppError");

function validate(req, res, next) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const message = errors.array().map((err) => err.msg);
        return next(new AppError(message.join(", "), 400));
    }

    next();
}

module.exports = validate;