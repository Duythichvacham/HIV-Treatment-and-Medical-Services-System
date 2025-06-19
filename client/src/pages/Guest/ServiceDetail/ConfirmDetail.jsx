import React from 'react';
import { Link } from 'react-router-dom';
import AppointmentForm from '../../../components/common/AppointmentForm';

const ConfirmDetail = ({ user }) => {
  return (
    <div className="px-4 py-8 max-w-7xl mx-auto">
      {/* Service header with icon and summary */}
      <section className="bg-green-50 p-6 rounded-lg mb-8 flex flex-col md:flex-row items-center">
        <div className="flex-shrink-0 bg-green-200 p-3 rounded-full">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5 8H5a2 2 0 01-2-2V5a2 2 0 012-2h6l2 2h6a2 2 0 012 2v11a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div className="mt-4 md:mt-0 md:ml-4 flex-1">
          <h1 className="text-3xl font-bold text-green-700">Xét nghiệm khẳng định HIV</h1>
          <p className="text-gray-600 mt-1">Dùng cho trường hợp sau khi test Combo HIV Ag/Ab có phản ứng hoặc dương tính</p>
          <div className="mt-3 flex items-center space-x-6">
            <div className="flex items-center text-gray-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11.25V10h2.5a.75.75 0 010 1.5H9.25A.75.75 0 018.5 10V7.5a.75.75 0 011.5 0z" clipRule="evenodd" />
              </svg>
              <span className="ml-1 font-medium">60 phút</span>
            </div>
            <div className="text-blue-600 font-semibold text-lg">500.000đ</div>
          </div>
        </div>
      </section>
      <Link to="/" className="text-gray-500 hover:underline mb-4 inline-block">&larr; Quay lại</Link>
      <h1 className="text-3xl font-bold text-green-700 mb-2">Xét nghiệm khẳng định HIV</h1>
      <p className="text-gray-700 mb-6">Dùng cho trường hợp sau khi test Combo HIV Ag/Ab có phản ứng hoặc dương tính</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          {/* Giới thiệu */}
          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold mb-2">Giới thiệu</h2>
            <p className="text-gray-600 leading-relaxed">
              Xét nghiệm khẳng định HIV được thực hiện để xác nhận chính xác kết quả sau khi
              xét nghiệm sàng lọc có phản ứng dương tính.
            </p>
          </section>
          {/* Mục đích xét nghiệm */}
          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold mb-2">Mục đích xét nghiệm</h2>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>
                Dùng cho trường hợp sau khi test Combo HIV Ag/Ab, kit test có phản ứng hoặc dương tính
                sẽ tiến hành xét nghiệm khẳng định HIV.
              </li>
            </ul>
          </section>
          {/* Dành cho đối tượng nào */}
          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold mb-2">Dành cho đối tượng nào</h2>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>Người sau khi test nhanh HIV có phản ứng/Dương tính</li>
              <li>Mắc các bệnh xã hội, bệnh lây nhiễm qua đường tình dục</li>
              <li>Quan hệ tình dục không an toàn, có nhiều bạn tình</li>
              <li>Chấn thương hoặc chia sẻ kim tiêm</li>
              <li>Hoạt động lao động tình dục</li>
              <li>Nhóm quan hệ đồng giới (MSM)</li>
              <li>Trẻ em sinh ra từ mẹ nhiễm HIV</li>
              <li>Phụ nữ mang thai</li>
            </ul>
          </section>
          {/* Thông tin kỹ thuật */}
          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold mb-2">Thông tin kỹ thuật</h2>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>Loại mẫu: Máu</li>
              <li>Thời gian nhận kết quả: 60 phút có kết quả</li>
              <li>Có cần nhịn ăn trước khi xét nghiệm: Không cần nhịn ăn trước khi lấy mẫu xét nghiệm</li>
            </ul>
          </section>
          {/* Đặc điểm nổi bật */}
          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold mb-2">Đặc điểm nổi bật</h2>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>Khẳng định chính xác sau test sàng lọc</li>
              <li>Kết quả trong 60 phút</li>
              <li>Không cần nhịn ăn</li>
              <li>Phương pháp 3 test nhanh</li>
              <li>Xét nghiệm HIV PCR</li>
              <li>Báo cáo chi tiết</li>
            </ul>
          </section>
          {/* Chuẩn bị trước khi thực hiện */}
          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold mb-2">Chuẩn bị trước khi thực hiện</h2>
            <p className="text-gray-600">Không cần nhịn ăn trước khi lấy mẫu xét nghiệm.</p>
          </section>
          {/* Chăm sóc sau thực hiện */}
          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold mb-2">Chăm sóc sau thực hiện</h2>
            <p className="text-gray-600">
              Bác sĩ sẽ phân tích kết quả và đưa ra kế hoạch điều trị tiếp theo nếu cần thiết.
            </p>
          </section>
        </div>
        <div>
          <AppointmentForm
            serviceType="confirm"
            serviceName="Xét nghiệm khẳng định HIV"
            duration="60 phút"
            price="500.000đ"
            user={user}
          />
        </div>
      </div> {/* end of grid */}
    </div>
  );
};

export default ConfirmDetail;
