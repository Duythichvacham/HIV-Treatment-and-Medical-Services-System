import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const PATIENT_ACCOUNTS = [
  { username: 'patient1', password: 'patient123', name: 'Nguyễn Văn A', avatar: 'https://randomuser.me/api/portraits/men/15.jpg' },
  { username: 'patient2', password: 'patient456', name: 'Trần Thị B', avatar: 'https://randomuser.me/api/portraits/women/25.jpg' },
];

const PatientLogin = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = (e) => {
    e.preventDefault();
    const found = PATIENT_ACCOUNTS.find(
      (acc) => acc.username === username.trim() && acc.password === password.trim()
    );
    if (found) {
      setError('');
      onLogin && onLogin({ ...found, role: 'Patient' });
      // Redirect back to original location or home
      const from = location.state?.from || '/';
      navigate(from, { replace: true });
    } else {
      setError('Sai tài khoản hoặc mật khẩu!');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-green-700 mb-6 text-center">Đăng nhập Bệnh nhân</h2>
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
          <div><b>Patient</b>: patient1 / patient123</div>
          <div><b>Patient</b>: patient2 / patient456</div>
        </div>
      </form>
    </div>
  );
};

export default PatientLogin;
