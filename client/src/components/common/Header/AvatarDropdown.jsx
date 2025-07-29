import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  UserCircle,
  Calendar,
  LogOut,
  Stethoscope,
  FlaskConical,
  ClipboardList,
  Settings,
} from "lucide-react";

const AvatarDropdown = ({ user, onLogout }) => {
  const [open, setOpen] = useState(false);

  // const isStaff =
  user &&
    ["Lab-Staff", "Registration-staff", "Manager", "Doctor"].includes(
      user.role
    );

  const handleLogout = () => {
    setOpen(false);
    sessionStorage.clear();
    onLogout && onLogout();
  };

  // Chọn icon dựa trên role
  const getRoleIcon = (role) => {
    const icons = {
      Doctor: Stethoscope,
      "Lab-Staff": FlaskConical,
      "Registration-staff": ClipboardList,
      Manager: Settings,
    };
    const IconComponent = icons[role] || UserCircle;
    return <IconComponent size={20} />;
  };

  // Style cho icon avatar
  const getIconAvatarStyle = (role) => {
    const styles = {
      Doctor: "border-blue-500 bg-blue-50 text-blue-600",
      "Lab-Staff": "border-green-500 bg-green-50 text-green-600",
      "Registration-staff": "border-purple-500 bg-purple-50 text-purple-600",
      Manager: "border-red-500 bg-red-50 text-red-600",
      default: "border-gray-500 bg-gray-50 text-gray-600",
    };
    return styles[role] || styles.default;
  };

  return (
    <div className="relative ml-4">
      <button
        className="flex items-center focus:outline-none group"
        onClick={() => setOpen((v) => !v)}
      >
        {/* Icon Avatar */}
        <div
          className={`w-9 h-9 rounded-full flex items-center justify-center border-2 shadow-md transition-all duration-200 group-hover:shadow-lg group-hover:scale-105 ${getIconAvatarStyle(
            user?.role
          )}`}
        >
          {getRoleIcon(user?.role)}
        </div>
        <span className="ml-2 font-medium text-gray-700 hidden sm:inline">
          {user?.name}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-44 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-100">
          <Link
            to="/profile"
            className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-green-600 transition-colors duration-150"
            onClick={() => setOpen(false)}
          >
            <UserCircle size={16} className="mr-2" />
            Hồ Sơ
          </Link>
          <Link
            to="/appointment-history"
            className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-green-600 transition-colors duration-150"
            onClick={() => setOpen(false)}
          >
            <Calendar size={16} className="mr-2" />
            Lịch hẹn
          </Link>
          <button
            className="w-full flex items-center text-left px-4 py-2 text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors duration-150"
            onClick={handleLogout}
          >
            <LogOut size={16} className="mr-2" />
            Đăng Xuất
          </button>
        </div>
      )}
    </div>
  );
};

export default AvatarDropdown;
