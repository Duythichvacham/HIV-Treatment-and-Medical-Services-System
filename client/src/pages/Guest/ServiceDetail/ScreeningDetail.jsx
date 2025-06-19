import React from 'react';
import { Link } from 'react-router-dom';
import AppointmentForm from '../../../components/common/AppointmentForm';
import { services } from '../../../mockData/data';

const ScreeningDetail = ({ user }) => {
  const service = services.find(s => s.id === 'screening');

  return (
    <div className="px-4 py-8 max-w-7xl mx-auto">
      {/* Service header with icon and summary */}
      <section className="bg-green-50 p-6 rounded-lg mb-8 flex flex-col md:flex-row items-center">
        <div className="flex-shrink-0 bg-green-200 p-3 rounded-full">
          {/* Heartbeat icon */}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5 8H5a2 2 0 01-2-2V5a2 2 0 012-2h6l2 2h6a2 2 0 012 2v11a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div className="mt-4 md:mt-0 md:ml-4 flex-1">
          <h1 className="text-3xl font-bold text-green-700">{service.name}</h1>
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
          {/* Giới thiệu chi tiết dịch vụ */}
          <section className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-2xl font-semibold mb-2">Giới thiệu</h2>
            <p className="text-gray-600 leading-relaxed">
              Dịch vụ sàng lọc sử dụng phương pháp PCR để phát hiện HIV ở giai đoạn sớm...
            </p>
          </section>
          {/* Thông tin kỹ thuật */}
          <section className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-2xl font-semibold mb-2">Thông tin kỹ thuật</h2>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>Loại mẫu: Máu</li>
              <li>Thời gian nhận kết quả: 30 phút có kết quả</li>
              <li>Có cần nhịn ăn trước khi xét nghiệm: Không cần nhịn ăn trước khi lấy mẫu xét nghiệm</li>
            </ul>
          </section>
          {/* Mục đích xét nghiệm */}
          <section className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-2xl font-semibold mb-2">Mục đích xét nghiệm</h2>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>Sàng lọc HIV từ giai đoạn sớm (giai đoạn phơi nhiễm sau 18 ngày)</li>
              <li>Phát hiện dấu hiệu virus HIV ở giai đoạn đầu</li>
            </ul>
          </section>
          {/* Dành cho đối tượng nào */}
          <section className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-2xl font-semibold mb-2">Dành cho đối tượng nào</h2>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>Quan hệ tình dục không an toàn</li>
              <li>Mắc các bệnh xã hội, bệnh lây nhiễm qua đường tình dục</li>
              <li>Chấn thương hoặc chia sẻ kim tiêm</li>
              <li>Hoạt động lao động tình dục</li>
              <li>Nhóm quan hệ đồng giới (MSM)</li>
              <li>Trẻ em sinh ra từ mẹ nhiễm HIV</li>
              <li>Người có nhiều bạn tình</li>
              <li>Phụ nữ mang thai</li>
            </ul>
          </section>
          {/* Các phương pháp xét nghiệm HIV */}
          <section className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-2xl font-semibold mb-2">Các phương pháp xét nghiệm HIV</h2>
            <div className="mb-4">
              <h3 className="font-semibold">Xét nghiệm HIV sàng lọc:</h3>
              <ul className="list-disc list-inside text-gray-600 ml-4">
                <li>Từ 7-14 ngày: Xét nghiệm HIV PCR (sinh học phân tử)</li>
                <li>Từ 15-90 ngày: Xét nghiệm HIV Combo Ag/Ab (Test nhanh tìm kháng Nguyên Ag và kháng thể Ab)</li>
                <li>Sau 90 ngày: Xét nghiệm HIV Ab (kháng thể HIV) hoặc HIV Combo Ag/Ab</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold">Xét nghiệm HIV khẳng định:</h3>
              <ul className="list-disc list-inside text-gray-600 ml-4">
                <li>Xét nghiệm khẳng định HIV phương pháp 3 test nhanh</li>
                <li>Xét nghiệm HIV PCR (Sinh học phân tử)</li>
              </ul>
              <p className="text-sm text-yellow-700 mt-2">
                <strong>Lưu ý:</strong> Xét nghiệm HIV Khẳng định chỉ thực hiện khi Xét nghiệm sàng lọc có phản ứng nhằm sàng lọc ra các kết quả dương tính giả.
              </p>
            </div>
          </section>
          {/* Đặc điểm nổi bật */}
          <section className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-2xl font-semibold mb-2">Đặc điểm nổi bật</h2>
            <ul className="list-disc list-inside text-gray-600">
              <li>Sàng lọc từ giai đoạn sớm</li>
              <li>Kết quả nhanh trong 30 phút</li>
              <li>Không cần nhịn ăn</li>
              <li>Bảo mật thông tin tuyệt đối</li>
              <li>Tư vấn trước và sau xét nghiệm</li>
              <li>Phương pháp hiện đại</li>
            </ul>
          </section>
          {/* Chuẩn bị trước khi thực hiện */}
          <section className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-2xl font-semibold mb-2">Chuẩn bị trước khi thực hiện</h2>
            <p className="text-gray-600">Không cần nhịn ăn trước khi lấy mẫu xét nghiệm.</p>
          </section>
          {/* Chăm sóc sau thực hiện */}
          <section className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-2xl font-semibold mb-2">Chăm sóc sau thực hiện</h2>
            <p className="text-gray-600">Sau khi có kết quả, bác sĩ sẽ tư vấn chi tiết và hướng dẫn các bước tiếp theo nếu cần thiết.</p>
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

export default ScreeningDetail;
