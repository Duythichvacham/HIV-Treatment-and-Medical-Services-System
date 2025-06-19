import React from 'react';
import { Link } from 'react-router-dom';
import AppointmentForm from '../../../components/common/AppointmentForm';
import { services } from '../../../mockData/data';

// Shared service data
const service = services.find(s => s.id === 'pep');

const PepDetail = ({ user }) => {
  return (
    <div className="px-4 py-8 max-w-7xl mx-auto">
      {/* Service header with icon and summary */}
      <section className="bg-red-50 p-6 rounded-lg mb-8 flex flex-col md:flex-row items-center">
        <div className="flex-shrink-0 bg-red-200 p-3 rounded-full">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="mt-4 md:mt-0 md:ml-4 flex-1">
          <h1 className="text-3xl font-bold text-red-600">{service.name}</h1>
          <p className="text-gray-600 mt-1">{service.description}</p>
          <div className="mt-3 flex items-center space-x-6">
            <div className="flex items-center text-gray-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11.25V10h2.5a.75.75 0 010 1.5H9.25A.75.75 0 018.5 10V7.5a.75.75 0 011.5 0z" clipRule="evenodd" />
              </svg>
              <span className="ml-1 font-medium">{service.duration}</span>
            </div>
            <div className="text-blue-600 font-semibold text-lg">{service.price}</div>
          </div>
        </div>
      </section>
      <Link to="/" className="text-gray-500 hover:underline mb-4 inline-block">&larr; Quay lại</Link>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          {/* Giới thiệu */}
          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold mb-2">Giới thiệu</h2>
            <p className="text-gray-600 leading-relaxed">
              Dịch vụ PEP cung cấp thuốc và hướng dẫn theo dõi trong 28 ngày để ngăn ngừa lây nhiễm HIV sau khi tiếp xúc nguy cơ.
            </p>
          </section>
          {/* Mục đích */}
          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold mb-2">Mục đích</h2>
            <p className="text-gray-600">
              Ngăn ngừa nhiễm HIV sau khi có sự cố phơi nhiễm trong vòng 72 giờ đầu.
            </p>
          </section>
          {/* Dành cho đối tượng nào */}
          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold mb-2">Dành cho đối tượng nào</h2>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>Người có phơi nhiễm máu hoặc dịch cơ thể có nguy cơ cao</li>
              <li>Nhân viên y tế sau tai nạn nghề nghiệp</li>
              <li>Quan hệ tình dục không an toàn với người nhiễm HIV</li>
              <li>Chia sẻ vật dụng cá nhân có dính máu (kim tiêm, dao cạo...)</li>
              <li>Phụ nữ mang thai sau sự cố phơi nhiễm</li>
            </ul>
          </section>
          {/* Thông tin kỹ thuật */}
          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold mb-2">Thông tin kỹ thuật</h2>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>Thời gian dùng thuốc: 28 ngày</li>
              <li>Thời gian thực hiện: Trong vòng 72 giờ sau phơi nhiễm</li>
              <li>Chi phí: Miễn phí (nếu có chỉ định)</li>
            </ul>
          </section>
          {/* Đặc điểm nổi bật */}
          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold mb-2">Đặc điểm nổi bật</h2>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>Hiệu quả lên đến 99%</li>
              <li>Theo dõi chuyên nghiệp suốt 28 ngày</li>
              <li>Sử dụng thuốc ARV thế hệ mới</li>
              <li>Hướng dẫn chi tiết bởi bác sĩ chuyên môn</li>
            </ul>
          </section>
          {/* Chuẩn bị trước */}
          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold mb-2">Chuẩn bị trước khi thực hiện</h2>
            <p className="text-gray-600">Không cần chuẩn bị đặc biệt, chỉ cần đến đúng giờ hẹn.</p>
          </section>
          {/* Chăm sóc sau thực hiện */}
          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold mb-2">Chăm sóc sau thực hiện</h2>
            <p className="text-gray-600">
              Theo dõi tác dụng phụ, tái khám đánh giá hiệu quả sau 28 ngày và hướng dẫn tiếp theo.
            </p>
          </section>
        </div>
        <div>
          <AppointmentForm
            serviceType={service.id}
            serviceName={service.name}
            duration={service.duration}
            price={service.price}
            user={user}
          />
        </div>
      </div>
    </div>
  );
};

export default PepDetail;
