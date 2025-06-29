const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  // Lấy token từ header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'default-secret-key-change-in-production', (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user; // Lưu thông tin user vào request
    next();
  });
};

module.exports = authenticateToken;