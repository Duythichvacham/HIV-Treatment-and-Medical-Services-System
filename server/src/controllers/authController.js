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
      process.env.JWT_SECRET,
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
    if (password.length < 6) {
      return res.status(400).json({ 
        message: 'Mật khẩu phải có ít nhất 6 ký tự' 
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
    
    if (err.message.includes('duplicate') || err.message.includes('already exists')) {
      if (err.message.includes('username')) {
        return res.status(400).json({ message: 'Tên đăng nhập đã tồn tại' });
      }
      if (err.message.includes('email')) {
        return res.status(400).json({ message: 'Email đã được sử dụng' });
      }
      if (err.message.includes('phone')) {
        return res.status(400).json({ message: 'Số điện thoại đã được sử dụng' });
      }
    }

    res.status(500).json({ message: 'Lỗi server khi đăng ký' });
  }
};