import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import AvatarDropdown from './AvatarDropdown';

const Header = ({ user, setUser }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isStaff = user && [
    'Lab-Staff', 'Registration-staff', 'Manager', 'Doctor'
  ].includes(user.role);

  const handleLogout = () => {
    setUser(null);
    navigate('/');
  };

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo as link */}
          <button
            onClick={() => {
              if (isStaff) navigate('/lab-staff');
              else navigate('/');
            }}
            className="flex items-center focus:outline-none"
          >
            <div className="text-red-600 font-bold text-2xl mr-2">H+</div>
            <div className="text-gray-800 font-semibold text-lg">HIV Care Center</div>
          </button>

          {/* Desktop Navigation */}
          {!isStaff && (
            <nav className="hidden md:flex items-center space-x-8">
              <Link to="/gioi-thieu" className="text-gray-700 hover:text-red-600 font-medium">
                Giới thiệu
              </Link>
              <Link to="/chuyen-gia" className="text-gray-700 hover:text-red-600 font-medium">
                Chuyên Gia - Bác sĩ
              </Link>
              <Link to="/tin-tuc" className="text-gray-700 hover:text-red-600 font-medium">
                Tin tức
              </Link>
              <Link to="/dich-vu-hiv" className="text-gray-700 hover:text-red-600 font-medium">
                Dịch vụ HIV
              </Link>
              <Link to="/dat-lich" className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 font-medium">
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
                  to="/dang-nhap-benh-nhan"
                  state={{ from: location.pathname }}
                  className="text-gray-700 hover:text-red-600 font-medium"
                >
                  Đăng nhập
                </Link>
                <Link to="/dang-ky" className="bg-gray-100 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-200 font-medium border">
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
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
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
                    to="/gioi-thieu"
                    className="block px-3 py-2 text-gray-700 hover:text-red-600 font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Giới thiệu
                  </Link>
                  <Link
                    to="/chuyen-gia"
                    className="block px-3 py-2 text-gray-700 hover:text-red-600 font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Chuyên Gia - Bác sĩ
                  </Link>
                  <Link
                    to="/tin-tuc"
                    className="block px-3 py-2 text-gray-700 hover:text-red-600 font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Tin tức
                  </Link>
                  <Link
                    to="/dich-vu-hiv"
                    className="block px-3 py-2 text-gray-700 hover:text-red-600 font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dịch vụ HIV
                  </Link>
                  <Link
                    to="/dat-lich"
                    className="block px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium mx-3"
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
                      to="/dang-nhap-benh-nhan"
                      state={{ from: location.pathname }}
                      className="block px-3 py-2 text-gray-700 hover:text-red-600 font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Đăng nhập
                    </Link>
                    <Link
                      to="/dang-ky"
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
