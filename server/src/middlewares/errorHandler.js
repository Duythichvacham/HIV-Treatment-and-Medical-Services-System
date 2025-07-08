const errorHandler = (err, req, res, next) => {
  const status = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  console.error(`[${req.method}] ${req.originalUrl} - ${message}`);
  res.status(status).json({
    success: false,
    message: message,
  });
};
module.exports = errorHandler;
