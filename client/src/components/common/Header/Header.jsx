import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import AvatarDropdown from "./AvatarDropdown";

const Header = ({ user, setUser }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isServiceOpen, setIsServiceOpen] = useState(false);
  const serviceRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const isStaff =
    user &&
    ["Lab-Staff", "Registration-staff", "Manager", "Doctor"].includes(
      user.role
    );

  // Debug log
  console.log('Header - User:', user);
  console.log('Header - isStaff:', isStaff);
  const handleLogout = () => {
    setUser(null);
    // Clear session storage
    sessionStorage.clear();
    
    // Navigate to appropriate login page based on user role
    if (isStaff) {
      navigate("/login/staff");
    } else {
      navigate("/login/patient");
    }
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (serviceRef.current && !serviceRef.current.contains(event.target)) {
        setIsServiceOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo as link */}          <button
            onClick={() => {
              if (user?.role === 'Lab-Staff') navigate("/lab-staff");
              else if (user?.role === 'Registration-staff') navigate("/registration-staff");
              else if (isStaff) navigate("/lab-staff"); // fallback cho Manager, Doctor
              else navigate("/");
            }}
            className="flex items-center focus:outline-none"
          >
            <div className="text-red-600 font-bold text-2xl mr-2">H+</div>
            <div className="text-gray-800 font-semibold text-lg">
              HIV Care Center
            </div>
          </button>

          {/* Desktop Navigation */}
          {!isStaff && (
            <nav className="hidden md:flex items-center space-x-8">
              <Link
                to="/about"
                className="text-gray-700 hover:text-red-600 font-medium"
              >
                Giới thiệu
              </Link>
              <Link
                to="/doctorpage"
                className="text-gray-700 hover:text-red-600 font-medium"
              >
                Chuyên Gia - Bác sĩ
              </Link>
              <Link
                to="/news"
                className="text-gray-700 hover:text-red-600 font-medium"
              >
                Tin tức
              </Link>
              <div className="relative" ref={serviceRef}>
                <button
                  className="inline-flex items-center text-gray-700 hover:text-red-600 font-medium focus:outline-none"
                  onClick={() => setIsServiceOpen(!isServiceOpen)}
                >
                  Dịch vụ HIV
                  <svg
                    className="ml-1 h-4 w-4 text-gray-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.23 7.21a.75.75 0 011.06-.02L10 10.67l3.71-3.48a.75.75 0 111.04 1.08l-4.25 4a.75.75 0 01-1.04 0l-4.25-4a.75.75 0 01-.02-1.06z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                <div
                  className={`absolute right-0 w-48 bg-white border border-gray-200 shadow-lg rounded-md mt-2 py-1 z-50 transition ease-out duration-150 origin-top-right ${
                    isServiceOpen
                      ? "opacity-100 scale-100"
                      : "opacity-0 scale-95"
                  }`}
                >
                  <Link
                    to="/services/screening"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsServiceOpen(false)}
                  >
                    Xét nghiệm sàng lọc
                  </Link>
                  <Link
                    to="/services/confirm"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsServiceOpen(false)}
                  >
                    Xét nghiệm khẳng định
                  </Link>
                  <Link
                    to="/services/pep"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsServiceOpen(false)}
                  >
                    PEP - Dự phòng
                  </Link>
                </div>
              </div>
              <Link
                to="/appointment"
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
              >
                Đặt lịch
              </Link>
            </nav>
          )}

          {/* Auth Buttons or Avatar - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <AvatarDropdown user={user} onLogout={handleLogout} />
            ) : (
              <>
                <Link
                  to="/login/patient"
                  state={{ from: location.pathname }}
                  className="text-gray-700 hover:text-red-600 font-medium"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="bg-gray-100 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-200 font-medium border"
                >
                  Đăng ký
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-500 hover:text-gray-600 focus:outline-none focus:text-gray-600"
              aria-label="Toggle menu"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-50 rounded-lg mt-2">
              {!isStaff && (
                <>
                  <Link
                    to="/about"
                    className="block px-3 py-2 text-gray-700 hover:text-red-600 font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Giới thiệu
                  </Link>
                  <Link
                    to="/doctorpage"
                    className="block px-3 py-2 text-gray-700 hover:text-red-600 font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Chuyên Gia - Bác sĩ
                  </Link>
                  <Link
                    to="/news"
                    className="block px-3 py-2 text-gray-700 hover:text-red-600 font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Tin tức
                  </Link>
                  <div className="relative">
                    <button className="block px-3 py-2 text-gray-700 hover:text-red-600 font-medium focus:outline-none">
                      Dịch vụ HIV
                    </button>
                    <div className="mt-1 ml-4 space-y-1">
                      <Link
                        to="/services/screening"
                        className="block px-3 py-2 text-gray-700 hover:text-red-600 font-medium"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Xét nghiệm sàng lọc
                      </Link>
                      <Link
                        to="/services/confirm"
                        className="block px-3 py-2 text-gray-700 hover:text-red-600 font-medium"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Xét nghiệm khẳng định
                      </Link>
                      <Link
                        to="/services/pep"
                        className="block px-3 py-2 text-gray-700 hover:text-red-600 font-medium"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        PEP - Dự phòng
                      </Link>
                    </div>
                  </div>
                  <Link
                    to="/Appointment"
                    className="block px-3 py-2 text-gray-700 hover:text-red-600 font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Đặt lịch
                  </Link>
                </>
              )}
              <div className="border-t border-gray-200 pt-2">
                {user ? (
                  <AvatarDropdown user={user} onLogout={handleLogout} />
                ) : (
                  <>
                    <Link
                      to="/Appointment"
                      state={{ from: location.pathname }}
                      className="block px-3 py-2 text-gray-700 hover:text-red-600 font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Đăng nhập
                    </Link>
                    <Link
                      to="/register"
                      className="block px-3 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 font-medium mx-3 mt-1"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Đăng ký
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
