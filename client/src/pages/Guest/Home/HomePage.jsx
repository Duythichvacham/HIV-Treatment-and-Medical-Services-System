import React from 'react';
import { Link } from 'react-router-dom';

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
              <Link to="/dat-lich" className="bg-green-600 text-white px-8 py-3 rounded-full font-semibold shadow hover:bg-green-700 transition">Đăng nhập để đặt lịch</Link>
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
              {/* Card 1 */}
              <div className="bg-white rounded-xl p-8 shadow border border-green-100 flex flex-col justify-between">
                <div>
                  <div className="flex items-center mb-2">
                    <div className="bg-green-600 text-white rounded-full w-10 h-10 flex items-center justify-center mr-3 font-bold text-xl">✓</div>
                    <div>
                      <h3 className="font-bold text-lg text-green-700">Xét nghiệm sàng lọc</h3>
                      <p className="text-gray-500 text-sm">Sàng lọc HIV từ giai đoạn sớm (giai đoạn phơi nhiễm sau 18 ngày)</p>
                    </div>
                  </div>
                  <div className="flex items-center text-gray-500 text-sm mb-2">30 phút</div>
                  <div className="text-right font-bold text-lg text-green-700 mb-2">169.000đ</div>
                  <div className="font-semibold mb-1">Đặc điểm:</div>
                  <ul className="text-green-700 text-sm list-disc list-inside mb-4">
                    <li>Sàng lọc từ giai đoạn sớm</li>
                    <li>Kết quả nhanh</li>
                    <li>Bảo mật tuyệt đối</li>
                  </ul>
                </div>
                <button className="bg-green-600 text-white px-4 py-2 rounded-full font-semibold hover:bg-green-700 transition w-full mt-2">Xem chi tiết</button>
              </div>
              {/* Card 2 */}
              <div className="bg-white rounded-xl p-8 shadow border border-green-100 flex flex-col justify-between">
                <div>
                  <div className="flex items-center mb-2">
                    <div className="bg-green-600 text-white rounded-full w-10 h-10 flex items-center justify-center mr-3 font-bold text-xl">✓</div>
                    <div>
                      <h3 className="font-bold text-lg text-green-700">Xét nghiệm khẳng định</h3>
                      <p className="text-gray-500 text-sm">Dùng cho trường hợp sau khi test Combo HIV Ag/Ab có phản ứng hoặc dương tính</p>
                    </div>
                  </div>
                  <div className="flex items-center text-gray-500 text-sm mb-2">60 phút</div>
                  <div className="text-right font-bold text-lg text-green-700 mb-2">500.000đ</div>
                  <div className="font-semibold mb-1">Đặc điểm:</div>
                  <ul className="text-green-700 text-sm list-disc list-inside mb-4">
                    <li>Độ chính xác cao</li>
                    <li>Công nghệ hiện đại</li>
                    <li>Báo cáo chi tiết</li>
                  </ul>
                </div>
                <button className="bg-green-600 text-white px-4 py-2 rounded-full font-semibold hover:bg-green-700 transition w-full mt-2">Xem chi tiết</button>
              </div>
              {/* Card 3 */}
              <div className="bg-white rounded-xl p-8 shadow border border-green-100 flex flex-col justify-between">
                <div>
                  <div className="flex items-center mb-2">
                    <div className="bg-red-500 text-white rounded-full w-10 h-10 flex items-center justify-center mr-3 font-bold text-xl">!</div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-red-600">PEP - Dự phòng sau phơi nhiễm HIV</h3>
                      <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full ml-2">Miễn phí</span>
                      <p className="text-gray-500 text-sm">Phương pháp dự phòng HIV sau khi tiếp xúc với nguy cơ phơi nhiễm</p>
                    </div>
                  </div>
                  <div className="flex items-center text-gray-500 text-sm mb-2">28 ngày</div>
                  <div className="text-right font-bold text-lg text-green-700 mb-2">Liên hệ</div>
                  <div className="font-semibold mb-1">Đặc điểm:</div>
                  <ul className="text-green-700 text-sm list-disc list-inside mb-4">
                    <li>Hiệu quả lên đến 99%</li>
                    <li>Trong vòng 72h</li>
                    <li>Theo dõi chuyên nghiệp</li>
                  </ul>
                </div>
                <button className="bg-green-600 text-white px-4 py-2 rounded-full font-semibold hover:bg-green-700 transition w-full mt-2">Xem chi tiết</button>
              </div>
            </div>
          </div>
        </section>

        {/* Đội ngũ bác sĩ chuyên nghiệp */}
        <section className="bg-white py-16">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-green-700 mb-2">Đội ngũ bác sĩ chuyên nghiệp</h2>
            <p className="text-center text-gray-500 mb-10">Các chuyên gia hàng đầu trong lĩnh vực HIV/AIDS</p>
            <div className="grid md:grid-cols-4 gap-8">
              {/* Card 1 */}
              <div className="bg-green-50 rounded-xl p-6 shadow text-center border border-green-100 flex flex-col items-center">
                <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="TS.BS Nguyễn Văn A" className="w-20 h-20 rounded-full object-cover mb-3 border-4 border-white shadow" />
                <div className="font-bold text-lg text-green-700 mb-1">TS.BS Nguyễn Văn A</div>
                <div className="text-sm text-green-600 mb-1">HIV/AIDS</div>
                <div className="text-gray-600 text-sm mb-2">Chuyên gia hàng đầu về điều trị HIV/AIDS với 15 năm kinh nghiệm</div>
                <div className="italic text-xs text-gray-500 mb-2">Tiến sĩ Y học - Đại học Y Hà Nội</div>
                <div className="flex justify-between text-xs text-gray-500 mb-2 w-full">
                  <span>15 năm</span>
                  <span>2000+</span>
                </div>
                <div className="text-xs text-gray-500 mb-2 w-full">Thứ 2-6, 8:00-17:00</div>
                <div className="flex justify-between items-center w-full mb-2">
                  <span className="text-yellow-500 font-bold flex items-center">★ 4.9</span>
                  <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">Có lịch</span>
                </div>
                <button className="bg-green-600 text-white px-3 py-1 rounded-full text-xs hover:bg-green-700 transition w-full">Xem chi tiết</button>
              </div>
              {/* Card 2 */}
              <div className="bg-green-50 rounded-xl p-6 shadow text-center border border-green-100 flex flex-col items-center">
                <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="BS.CKI Trần Thị B" className="w-20 h-20 rounded-full object-cover mb-3 border-4 border-white shadow" />
                <div className="font-bold text-lg text-green-700 mb-1">BS.CKI Trần Thị B</div>
                <div className="text-sm text-green-600 mb-1">Nội khoa</div>
                <div className="text-gray-600 text-sm mb-2">Bác sĩ nội khoa giàu kinh nghiệm trong điều trị các bệnh lý phức tạp</div>
                <div className="italic text-xs text-gray-500 mb-2">Bác sĩ chuyên khoa I - Bệnh viện Bạch Mai</div>
                <div className="flex justify-between text-xs text-gray-500 mb-2 w-full">
                  <span>12 năm</span>
                  <span>1500+</span>
                </div>
                <div className="text-xs text-gray-500 mb-2 w-full">Thứ 2,4,6. 8:00-12:00</div>
                <div className="flex justify-between items-center w-full mb-2">
                  <span className="text-yellow-500 font-bold flex items-center">★ 4.8</span>
                  <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">Có lịch</span>
                </div>
                <button className="bg-green-600 text-white px-3 py-1 rounded-full text-xs hover:bg-green-700 transition w-full">Xem chi tiết</button>
              </div>
              {/* Card 3 */}
              <div className="bg-green-50 rounded-xl p-6 shadow text-center border border-green-100 flex flex-col items-center">
                <img src="https://randomuser.me/api/portraits/men/45.jpg" alt="BS Lê Văn C" className="w-20 h-20 rounded-full object-cover mb-3 border-4 border-white shadow" />
                <div className="font-bold text-lg text-green-700 mb-1">BS Lê Văn C</div>
                <div className="text-sm text-green-600 mb-1">Tâm lý</div>
                <div className="text-gray-600 text-sm mb-2">Chuyên gia tâm lý hỗ trợ bệnh nhân HIV/AIDS vượt qua khó khăn</div>
                <div className="italic text-xs text-gray-500 mb-2">Thạc sĩ Tâm lý học - Đại học Sư phạm Hà Nội</div>
                <div className="flex justify-between text-xs text-gray-500 mb-2 w-full">
                  <span>8 năm</span>
                  <span>800+</span>
                </div>
                <div className="text-xs text-gray-500 mb-2 w-full">Thứ 3,5,7. 14:00-18:00</div>
                <div className="flex justify-between items-center w-full mb-2">
                  <span className="text-yellow-500 font-bold flex items-center">★ 4.7</span>
                  <span className="bg-gray-400 text-white text-xs px-2 py-1 rounded-full">Hết lịch</span>
                </div>
                <button className="bg-green-600 text-white px-3 py-1 rounded-full text-xs hover:bg-green-700 transition w-full">Xem chi tiết</button>
              </div>
              {/* Card 4 */}
              <div className="bg-green-50 rounded-xl p-6 shadow text-center border border-green-100 flex flex-col items-center">
                <img src="https://randomuser.me/api/portraits/women/65.jpg" alt="BS Phạm Thị D" className="w-20 h-20 rounded-full object-cover mb-3 border-4 border-white shadow" />
                <div className="font-bold text-lg text-green-700 mb-1">BS Phạm Thị D</div>
                <div className="text-sm text-green-600 mb-1">Xét nghiệm</div>
                <div className="text-gray-600 text-sm mb-2">Chuyên gia xét nghiệm và chẩn đoán HIV với nhiều năm kinh nghiệm</div>
                <div className="italic text-xs text-gray-500 mb-2">Bác sĩ Y học - Đại học Y Dược TP.HCM</div>
                <div className="flex justify-between text-xs text-gray-500 mb-2 w-full">
                  <span>10 năm</span>
                  <span>3000+</span>
                </div>
                <div className="text-xs text-gray-500 mb-2 w-full">Thứ 2-7. 7:00-16:00</div>
                <div className="flex justify-between items-center w-full mb-2">
                  <span className="text-yellow-500 font-bold flex items-center">★ 4.6</span>
                  <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">Có lịch</span>
                </div>
                <button className="bg-green-600 text-white px-3 py-1 rounded-full text-xs hover:bg-green-700 transition w-full">Xem chi tiết</button>
              </div>
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