const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  // Debug logging
  // console.log("[AUTH] =================");
  // console.log("[AUTH] Request URL:", req.path);
  // console.log("[AUTH] Method:", req.method);
  // console.log("[AUTH] Headers received:", req.headers);
  // console.log("[AUTH] Authorization header:", req.headers["authorization"]);

  // Lấy token từ header
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer <token>

  if (!token) {
    console.log("[AUTH] No token provided - sending 401");
    return res.status(401).json({ message: "No token provided" });
  }

  jwt.verify(
    token,
    process.env.JWT_SECRET || "default-secret-key-change-in-production",
    (err, user) => {
      if (err) return res.status(403).json({ message: "Invalid token" });
      req.user = user; // Lưu thông tin user vào request
      next();
    }
  );
};

module.exports = authenticateToken;
