import React from 'react';
import { Link } from 'react-router-dom';
import ServiceCard from '../../../components/common/ServiceCard'; // Import ServiceCard component
import DoctorCard from '../../../components/common/DoctorCard';

const HomePage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header và Footer đã được bọc ở App.jsx, không render ở đây */}
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-white text-green-700 py-20 shadow-lg">
          <div className="max-w-4xl mx-auto text-center space-y-6 px-4">
            <div className="text-2xl font-bold tracking-wide">Trung tâm chăm sóc HIV hàng đầu Việt Nam</div>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-green-800">"Đồng hành cùng sức khỏe của bạn"</h1>
            <p className="text-lg font-medium text-green-600">Chăm sóc toàn diện, chuyên nghiệp và bảo mật</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
              <Link to="/login/patient" className="bg-green-600 text-white px-8 py-3 rounded-full font-semibold shadow hover:bg-green-700 transition">Đăng nhập để đặt lịch</Link>
              <span className="bg-green-100 text-green-700 px-6 py-3 rounded-full font-semibold shadow border border-green-300">Hotline 24/7: 1900-1234</span>
            </div>
          </div>
        </section>

        {/* Về chúng tôi */}
        <section className="bg-white py-16">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-green-700 mb-6">Về chúng tôi</h2>
            <p className="text-center text-gray-600 mb-10">Với hơn 20 năm kinh nghiệm, chúng tôi cam kết mang đến dịch vụ chăm sóc sức khỏe chất lượng cao cho bệnh nhân HIV/AIDS.</p>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-green-50 rounded-xl p-6 shadow text-center">
                <h3 className="font-bold text-xl text-green-700 mb-2">Sứ mệnh</h3>
                <p className="text-gray-600">Chăm sóc toàn diện và tận tâm cho mọi bệnh nhân, góp phần xây dựng cộng đồng khỏe mạnh và không kỳ thị.</p>
              </div>
              <div className="bg-green-50 rounded-xl p-6 shadow text-center">
                <h3 className="font-bold text-xl text-green-700 mb-2">Tầm nhìn</h3>
                <p className="text-gray-600">Trở thành trung tâm chăm sóc HIV/AIDS hàng đầu khu vực, tiên phong trong công nghệ và phương pháp điều trị.</p>
              </div>
              <div className="bg-green-50 rounded-xl p-6 shadow text-center">
                <h3 className="font-bold text-xl text-green-700 mb-2">Giá trị cốt lõi</h3>
                <p className="text-gray-600">Tận tâm, chuyên nghiệp, hiện đại và luôn đặt bệnh nhân làm trung tâm trong mọi hoạt động.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Dịch vụ nổi bật */}
        <section className="bg-green-50 py-16">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-green-700 mb-2">Dịch vụ nổi bật</h2>
            <p className="text-center text-gray-500 mb-10">Các dịch vụ chăm sóc sức khỏe toàn diện</p>
            <div className="grid md:grid-cols-3 gap-8">
              {/* Map services via ServiceCard component */}
              <ServiceCard
                iconBg="bg-green-600"
                iconColor="text-white"
                icon={<span>✓</span>}
                title="Xét nghiệm sàng lọc"
                subtitle="Sàng lọc HIV từ giai đoạn sớm"
                duration="30 phút"
                price="169.000đ"
                features={[
                  'Sàng lọc từ giai đoạn sớm',
                  'Kết quả nhanh',
                  'Bảo mật tuyệt đối',
                ]}
                link="/services/screening"
              />
              <ServiceCard
                iconBg="bg-green-600"
                iconColor="text-white"
                icon={<span>✓</span>}
                title="Xét nghiệm khẳng định"
                subtitle="Dùng cho trường hợp test Combo có phản ứng"
                duration="60 phút"
                price="500.000đ"
                features={[
                  'Độ chính xác cao',
                  'Công nghệ hiện đại',
                  'Báo cáo chi tiết',
                ]}
                link="/services/confirm"
              />
              <ServiceCard
                iconBg="bg-red-500"
                iconColor="text-white"
                icon={<span>!</span>}
                title="PEP - Dự phòng sau phơi nhiễm HIV"
                subtitle="Miễn phí, trong vòng 72h"
                duration="28 ngày"
                price="Liên hệ"
                features={[
                  'Hiệu quả lên đến 99%',
                  'Trong vòng 72h',
                  'Theo dõi chuyên nghiệp',
                ]}
                link="/services/pep"
              />
            </div>
          </div>
        </section>

        {/* Đội ngũ bác sĩ chuyên nghiệp */}
        <section className="bg-white py-16">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-green-700 mb-2">Đội ngũ bác sĩ chuyên nghiệp</h2>
            <p className="text-center text-gray-500 mb-10">Các chuyên gia hàng đầu trong lĩnh vực HIV/AIDS</p>
            <div className="grid md:grid-cols-4 gap-8">
              {/* Use DoctorCard component for each doctor */}
              <DoctorCard
                image="https://randomuser.me/api/portraits/men/32.jpg"
                name="TS.BS Nguyễn Văn A"
                gender="Nam"
                schedule="Thứ 2-6, 8:00-17:00"
                price="300.000đ"
                link="/doctors/1"
              />
              <DoctorCard
                image="https://randomuser.me/api/portraits/women/44.jpg"
                name="BS.CKI Trần Thị B"
                gender="Nữ"
                schedule="Thứ 2,4,6. 8:00-12:00"
                price="250.000đ"
                link="/doctors/2"
              />
              <DoctorCard
                image="https://randomuser.me/api/portraits/men/45.jpg"
                name="BS Lê Văn C"
                gender="Nam"
                schedule="Thứ 3,5,7. 14:00-18:00"
                price="200.000đ"
                link="/doctors/3"
              />
              <DoctorCard
                image="https://randomuser.me/api/portraits/women/65.jpg"
                name="BS Phạm Thị D"
                gender="Nữ"
                schedule="Thứ 2-7. 7:00-16:00"
                price="220.000đ"
                link="/doctors/4"
              />
            </div>
          </div>
        </section>

        {/* Chứng nhận & Giấy phép */}
        <section className="bg-green-50 py-16">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-green-700 mb-6">Chứng nhận & Giấy phép</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white rounded-xl p-6 shadow text-center border border-green-100">
                <div className="font-bold text-lg text-green-700 mb-2">Chứng nhận ISO 9001:2015</div>
                <div className="text-gray-600">Hệ thống quản lý chất lượng quốc tế</div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow text-center border border-green-100">
                <div className="font-bold text-lg text-green-700 mb-2">Giấy phép hoạt động</div>
                <div className="text-gray-600">Được cấp bởi Sở Y tế TP.HCM</div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow text-center border border-green-100">
                <div className="font-bold text-lg text-green-700 mb-2">Chứng nhận WHO</div>
                <div className="text-gray-600">Đạt chuẩn quốc tế về chăm sóc HIV/AIDS</div>
              </div>
            </div>
          </div>
        </section>

        {/* Tin tức & Sự kiện */}
        <section className="bg-white py-16">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-green-700 mb-6">Tin tức & Sự kiện</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-green-50 rounded-xl p-6 shadow hover:shadow-lg transition border border-green-100">
                <div className="font-bold text-lg text-green-700 mb-2">Khởi động chương trình xét nghiệm miễn phí HIV tháng 12</div>
                <div className="text-xs text-gray-500 mb-2">05/12/2024</div>
                <div className="text-gray-600 mb-4">Trung tâm sẽ tổ chức xét nghiệm miễn phí HIV cho cộng đồng trong tháng 12/2024...</div>
                <Link to="/news/1" className="text-green-600 hover:underline font-medium text-sm">Đọc thêm →</Link>
              </div>
              {/* ...Thêm các tin khác tương tự... */}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default HomePage;