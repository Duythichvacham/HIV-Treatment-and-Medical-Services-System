import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const AvatarDropdown = ({ user, onLogout }) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  
  const isStaff = user && ["Lab-Staff", "Registration-staff", "Manager", "Doctor"].includes(user.role);
  
  const handleLogout = () => {
    setOpen(false);
    // Clear all session storage
    sessionStorage.clear();
    onLogout && onLogout();
    
    // Navigate to appropriate login page based on user role
    if (isStaff) {
      navigate("/login/staff");
    } else {
      navigate("/login/patient");
    }
  };
  return (
    <div className="relative ml-4">
      <button
        className="flex items-center focus:outline-none"
        onClick={() => setOpen((v) => !v)}
      >
        <img
          src={user.avatar}
          alt="avatar"
          className="w-9 h-9 rounded-full border-2 border-green-500 shadow"
        />
        <span className="ml-2 font-medium text-gray-700 hidden sm:inline">{user.name}</span>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-44 bg-white rounded-lg shadow-lg py-2 z-50 border">
          <Link
            to="/profile"
            className="block px-4 py-2 text-gray-700 hover:bg-green-50 hover:text-green-700"
            onClick={() => setOpen(false)}
          >
            Hồ Sơ
          </Link>          <button
            className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 hover:text-red-700"
            onClick={handleLogout}
          >
            Đăng Xuất
          </button>
        </div>
      )}
    </div>
  );
};

export default AvatarDropdown;
