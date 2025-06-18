import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Thông tin trung tâm */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold mb-3">TRUNG TÂM HỖ TRỢ VÀ HIV/AIDS HIV</h3>
            <div className="text-gray-300 text-sm">
              7 Đ. D1, Long Thạnh Mỹ, Thủ Đức, Hồ Chí Minh 700000
            </div>
            <div className="text-gray-300 text-sm">
              113 (Tư vấn miễn phí)
            </div>
            <div className="text-gray-300 text-sm">
              tuvan@hivcenter.vn
            </div>
            <div className="text-gray-300 text-sm">
              Làm việc: Thứ 2 - Chủ Nhật (7:30 - 20:00)
            </div>
          </div>

          {/* Liên kết nhanh */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Liên kết nhanh</h3>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li>
                <Link to="/gioi-thieu" className="hover:text-red-400 transition">Giới thiệu</Link>
              </li>
              <li>
                <Link to="/chuyen-gia" className="hover:text-red-400 transition">Đội ngũ bác sĩ</Link>
              </li>
              <li>
                <Link to="/tu-van" className="hover:text-red-400 transition">Điều đạn tư vấn</Link>
              </li>
            </ul>
          </div>

          {/* Theo dõi HIV */}
          <div>
            <h3 className="text-lg font-semibold mb-3">THEO DÕI HIV</h3>
            <p className="text-gray-300 text-sm mb-4">
              Cập nhật thông tin mới nhất về HIV/AIDS và các dịch vụ hỗ trợ
            </p>
            <form className="flex gap-2">
              <input
                type="email"
                placeholder="Nhập email của bạn"
                className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition font-medium"
              >
                Đăng ký
              </button>
            </form>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-6">
          <p className="text-center text-gray-400 text-xs">
            © 2025 Trung tâm HIV/AIDS HIV Care Center. Thiết kế và cung đông.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;