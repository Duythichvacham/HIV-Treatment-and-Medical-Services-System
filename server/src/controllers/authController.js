const jwt = require('jsonwebtoken');
const authService = require('../services/authService');
const bcrypt = require('bcryptjs');
const { verifiedEmails, otpStore } = require('../utils/otpStore');


exports.login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await authService.authenticateUser(username, password);
    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const token = jwt.sign(
      {
        userId: user.account_id,
        username: user.username,
        role: user.role,
        ...(user.doctor_id && { doctor_id: user.doctor_id }),
        ...(user.patient_id && { patient_id: user.patient_id })
      },
      process.env.JWT_SECRET || 'default-secret-key-change-in-production',
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );

    // Tạo refresh token
    const refreshToken = jwt.sign(
      { userId: user.account_id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN }
    );

    res.json({ token, refreshToken });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
  // bcrypt.hash('@1', 10).then(hash => console.log(hash));
};

exports.refreshToken = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).json({ message: 'No refresh token provided' });

  try {
    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    // Có thể kiểm tra refreshToken trong DB ở đây nếu muốn bảo mật hơn

    // Tạo access token mới
    const accessToken = jwt.sign(
      {
        userId: payload.userId,
        // Có thể thêm các thông tin khác nếu cần
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    res.json({ accessToken });
  } catch (err) {
    return res.status(403).json({ message: 'Invalid or expired refresh token' });
  }
};

exports.registerPatient = async (req, res) => {
  const { username, password, fullName, dob, gender, email, phone, address } = req.body;

  // --- BẮT BUỘC: Kiểm tra email đã xác thực OTP chưa ---
  console.log('Check verifiedEmails (register):', email, verifiedEmails[email]);
  if (!verifiedEmails[email] || Date.now() > verifiedEmails[email]) {
    return res.status(400).json({ message: 'Bạn cần xác thực email trước.' });
  }
  // Xóa trạng thái xác thực sau khi dùng (tránh đăng ký lặp)
  delete verifiedEmails[email];
  console.log('Delete verifiedEmails (register):', email);

  try {
    // Validate required fields
    if (!username || !password || !fullName || !dob || !gender || !email || !phone) {
      return res.status(400).json({
        message: 'Vui lòng điền đầy đủ thông tin bắt buộc'
      });
    }

    // Validate password length
    if (password.length < 8) {
      return res.status(400).json({
        message: 'Mật khẩu phải có ít nhất 8 ký tự'
      });
    }

    // Validate strong password requirements
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message: 'Mật khẩu phải chứa ít nhất 1 chữ thường, 1 chữ hoa, 1 số và 1 ký tự đặc biệt (@$!%*?&)'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: 'Email không hợp lệ'
      });
    }

    // Validate phone format
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        message: 'Số điện thoại không hợp lệ (10-11 số)'
      });
    }

    // Validate gender
    if (!['male', 'female'].includes(gender)) {
      return res.status(400).json({
        message: 'Giới tính không hợp lệ'
      });
    }

    const result = await authService.registerPatient({
      username,
      password,
      fullName,
      dob,
      gender,
      email,
      phone,
      address
    });

    res.status(201).json({
      message: 'Đăng ký thành công',
      patientId: result.patientId
    });

  } catch (err) {
    // Check for SQL Server unique constraint violation
    if (
      err.message.includes('duplicate') ||
      err.message.includes('already exists') ||
      err.message.includes('UNIQUE KEY constraint') ||
      err.message.includes('Cannot insert duplicate key')
    ) {
      if (err.message.toLowerCase().includes('username')) {
        return res.status(400).json({ message: 'Tên đăng nhập đã tồn tại' });
      }
      if (err.message.toLowerCase().includes('email')) {
        return res.status(400).json({ message: 'Email đã được sử dụng' });
      }
      if (err.message.toLowerCase().includes('phone')) {
        return res.status(400).json({ message: 'Số điện thoại đã được sử dụng' });
      }
      // Nếu không xác định được trường, trả về lỗi chung
      return res.status(400).json({ message: 'Thông tin đã tồn tại' });
    }
    res.status(500).json({ message: 'Lỗi server khi đăng ký' });
  }
};

// change password
exports.changePassword = async (req, res, next) => {
  try {
    const { email, oldPassword, newPassword } = req.body;

    // 1. Kiểm tra xác thực OTP
    console.log('Check verifiedEmails (changePassword):', email, verifiedEmails[email]);
    if (!verifiedEmails[email] || Date.now() > verifiedEmails[email]) {
      return res.status(400).json({ message: 'Bạn cần xác thực email trước.' });
    }
    delete verifiedEmails[email];
    console.log('Delete verifiedEmails (changePassword):', email);

    // 2. Validate input
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: 'Thiếu thông tin.' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 8 ký tự.' });
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({ message: 'Mật khẩu phải chứa ít nhất 1 chữ thường, 1 chữ hoa, 1 số và 1 ký tự đặc biệt (@$!%*?&)' });
    }

    // 3. Lấy account_id từ email
    const accountId = await authService.getAccountIdByEmail(email);
    if (!accountId) {
      return res.status(404).json({ message: 'Không tìm thấy tài khoản với email này.' });
    }

    // 4. Đổi mật khẩu
    await authService.changePassword(accountId, oldPassword, newPassword);
    res.json({ message: 'Đổi mật khẩu thành công.' });
  } catch (err) {
    res.status(400).json({ message: err.message || 'Lỗi server khi đổi mật khẩu.' });
  }
};


exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    // 1. Kiểm tra xác thực OTP
    console.log('Check verifiedEmails (resetPassword):', email, verifiedEmails[email]);
    if (!verifiedEmails[email] || Date.now() > verifiedEmails[email]) {
      return res.status(400).json({ message: 'Bạn cần xác thực email trước.' });
    }
    delete verifiedEmails[email];
    console.log('Delete verifiedEmails (resetPassword):', email);

    // 2. Validate mật khẩu mới
    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 8 ký tự.' });
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({ message: 'Mật khẩu phải chứa ít nhất 1 chữ thường, 1 chữ hoa, 1 số và 1 ký tự đặc biệt (@$!%*?&)' });
    }

    // 3. Lấy account_id từ email
    const accountId = await authService.getAccountIdByEmail(email);
    if (!accountId) {
      return res.status(404).json({ message: 'Không tìm thấy tài khoản với email này.' });
    }

    // 4. Đặt lại mật khẩu (không cần mật khẩu cũ)
    await authService.resetPassword(accountId, newPassword);
    res.json({ message: 'Đặt lại mật khẩu thành công.' });
  } catch (err) {
    res.status(400).json({ message: err.message || 'Lỗi server khi đặt lại mật khẩu.' });
  }
};

exports.checkEmailExists = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Thiếu email' });
    const pool = await require('../config/db').poolPromise;
    const result = await pool.request()
      .input('email', require('mssql').VarChar, email)
      .query('SELECT patient_id FROM Patients WHERE email = @email');
    if (result.recordset.length > 0) {
      return res.json({ exists: true });
    }
    return res.json({ exists: false });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server khi kiểm tra email' });
  }
};
