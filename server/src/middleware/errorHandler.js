module.exports = function errorHandler(err, req, res, next) {
  const status = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  consolo.error(`[${req.method}] ${req.originalUrl} - ${mesage}`);
  res.status(status).json({
    success: false,
    message: message,
  });
};
