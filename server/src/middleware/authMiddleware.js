const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  // Debug logging
  console.log("[AUTH] =================");
  console.log("[AUTH] Request URL:", req.path);
  console.log("[AUTH] Method:", req.method);
  console.log("[AUTH] Headers received:", req.headers);
  console.log("[AUTH] Authorization header:", req.headers["authorization"]);

  // Lấy token từ header
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer <token>

  console.log(
    "[AUTH] Token extracted:",
    token ? `${token.substring(0, 20)}...` : "null"
  );

  if (!token) {
    console.log("[AUTH] No token provided - sending 401");
    return res.status(401).json({ message: "No token provided" });
  }

  console.log("[AUTH] JWT_SECRET exists:", !!process.env.JWT_SECRET);
  console.log("[AUTH] Attempting to verify token...");

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.log("[AUTH] Token verification failed:", err.name, err.message);
      return res
        .status(403)
        .json({ message: "Invalid token", error: err.message });
    }

    console.log("[AUTH] Token verified successfully. User data:", user);
    req.user = user; // Lưu thông tin user vào request
    next();
  });
};

module.exports = authenticateToken;
