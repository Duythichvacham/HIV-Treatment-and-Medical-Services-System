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
    }

    const token = jwt.sign(
      {
        userId: user.account_id,
        username: user.username,
        role: user.role,
        ...(user.doctor_id && { doctor_id: user.doctor_id }),
        ...(user.lab_staff_id && { lab_staff_id: user.lab_staff_id }),
        ...(user.registration_staff_id && { registration_staff_id: user.registration_staff_id }),
        ...(user.manager_id && { manager_id: user.manager_id }),
        ...(user.patient_id && { patient_id: user.patient_id })
      },
      process.env.JWT_SECRET || 'default-secret-key-change-in-production',
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );

    res.json({ token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
  // bcrypt.hash('@1', 10).then(hash => console.log(hash));
};

exports.registerPatient = async (req, res) => {
  const { username, password, fullName, dob, gender, email, phone, address } = req.body;
  
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
    console.error('Registration error:', err);
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
    const userId = req.user?.userId;
    console.log('userId in req.user:', req.user);
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) throw new Error('Thiếu thông tin.');
    await authService.changePassword(userId, oldPassword, newPassword);
    res.json({ message: 'Đổi mật khẩu thành công.' });
  } catch (err) {
    next(err);
  }
};

