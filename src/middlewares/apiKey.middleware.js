const AppError = require("../utils/AppError");

function checkApiKey(req, res, next) {
  const apiKey = req.headers["x-api-key"];

  if (!apiKey) {
    return next(new AppError("API key is missing. Provide it via 'x-api-key' header", 401));
  }

  if (apiKey !== process.env.EXTERNAL_API_KEY) {
    return next(new AppError("Invalid API key", 401));
  }

  next();
}

module.exports = checkApiKey;