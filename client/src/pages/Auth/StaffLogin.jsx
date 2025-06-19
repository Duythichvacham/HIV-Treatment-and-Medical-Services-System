import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const STAFF_ACCOUNTS = [
  { username: 'lab1', password: 'lab123', role: 'Lab-Staff', name: 'Nguyễn Văn Lab', avatar: 'https://randomuser.me/api/portraits/men/12.jpg' },
  { username: 'reg1', password: 'reg123', role: 'Registration-staff', name: 'Trần Thị Thu Ngân', avatar: 'https://randomuser.me/api/portraits/women/22.jpg' },
  { username: 'manager1', password: 'manager123', role: 'Manager', name: 'Lê Quang Quản Lý', avatar: 'https://randomuser.me/api/portraits/men/33.jpg' },
  { username: 'doctor1', password: 'doc123', role: 'Doctor', name: 'BS. Lê Văn C', avatar: 'https://randomuser.me/api/portraits/men/45.jpg' },
];

const StaffLogin = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = (e) => {
    e.preventDefault();
    const found = STAFF_ACCOUNTS.find(
      (acc) => acc.username === username && acc.password === password
    );    if (found) {
      setError('');
      onLogin && onLogin(found);
      // Determine redirect path based on role
      let defaultPath = '/';
      if (found.role === 'Lab-Staff') {
        defaultPath = '/lab-staff';
      } else if (found.role === 'Registration-staff') {
        defaultPath = '/registration-staff';
      }
      const from = location.state?.from || defaultPath;
      navigate(from, { replace: true });
    } else {
      setError('Sai tài khoản hoặc mật khẩu!');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-green-700 mb-6 text-center">Đăng nhập Nhân viên</h2>
        <div className="mb-4">
          <label className="block text-gray-700 mb-1">Tên đăng nhập</label>
          <input
            type="text"
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-1">Mật khẩu</label>
          <input
            type="password"
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </div>
        {error && <div className="text-red-600 mb-3 text-sm">{error}</div>}
        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded-md font-semibold hover:bg-green-700 transition"
        >
          Đăng nhập
        </button>
        <div className="mt-4 text-xs text-gray-500">
          <div><b>Lab-Staff</b>: lab1 / lab123</div>
          <div><b>Registration-staff</b>: reg1 / reg123</div>
          <div><b>Manager</b>: manager1 / manager123</div>
          <div><b>Doctor</b>: doctor1 / doc123</div>
        </div>
      </form>
    </div>
  );
};

export default StaffLogin;
