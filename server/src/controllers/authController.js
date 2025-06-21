const jwt = require('jsonwebtoken');
const authService = require('../services/authService');
const bcrypt = require('bcryptjs');

exports.login = async (req, res) => {
  const { username, password } = req.body;
  console.log('Login body:', req.body);
  try {
    const user = await authService.authenticateUser(username, password);
    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }    const tokenPayload = {
      userId: user.account_id,
      username: user.username,
      role: user.role
    };

    // Thêm doctor_id vào token nếu user là Doctor
    if (user.role === 'Doctor' && user.doctor_id) {
      tokenPayload.doctor_id = user.doctor_id;
    }

    const token = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );

    res.json({ token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
  bcrypt.hash('@1', 10).then(hash => console.log(hash));
};