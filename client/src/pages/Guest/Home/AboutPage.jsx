import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { getDoctors } from "../../../services/api";
import { motion, useInView } from "framer-motion";

const AboutPage = () => {
  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [doctorsError, setDoctorsError] = useState(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await getDoctors();
        // Handle both response.data and direct response
        const data = response.data || response;
        setDoctors(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching doctors:", err);
        setDoctorsError("Không thể tải danh sách bác sĩ.");
      } finally {
        setLoadingDoctors(false);
      }
    };

    fetchDoctors();
  }, []);

  function SectionAppear({ children, effect = "fade-up", delay = 0 }) {
    const ref = useRef();
    const inView = useInView(ref, { once: true, margin: "-100px" });
    let initial, animate, exit;
    switch (effect) {
      case "fade-down":
        initial = { opacity: 0, y: -40 };
        animate = { opacity: 1, y: 0 };
        exit = { opacity: 0, y: -40 };
        break;
      case "fade-left":
        initial = { opacity: 0, x: -60 };
        animate = { opacity: 1, x: 0 };
        exit = { opacity: 0, x: -60 };
        break;
      case "fade-right":
        initial = { opacity: 0, x: 60 };
        animate = { opacity: 1, x: 0 };
        exit = { opacity: 0, x: 60 };
        break;
      case "zoom-in":
        initial = { opacity: 0, scale: 0.85 };
        animate = { opacity: 1, scale: 1 };
        exit = { opacity: 0, scale: 0.85 };
        break;
      default:
        initial = { opacity: 0, y: 40 };
        animate = { opacity: 1, y: 0 };
        exit = { opacity: 0, y: 40 };
    }
    return (
      <motion.section
        ref={ref}
        initial={initial}
        animate={inView ? animate : initial}
        exit={exit}
        transition={{ duration: 0.7, ease: "easeOut", delay }}
        className="w-full"
      >
        {children}
      </motion.section>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      {/* Hero Banner */}
      <SectionAppear>
        <section className="relative bg-green-700 text-white py-20 shadow-xl overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center opacity-20"></div>
          <div className="relative z-10 max-w-4xl mx-auto text-center px-4 animate-fade-in-up">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 drop-shadow-lg">Giới thiệu về HIV Care Center</h1>
            <p className="text-lg md:text-xl font-medium mb-6 drop-shadow">Trung tâm tiên phong trong chăm sóc, xét nghiệm và điều trị HIV/AIDS tại Việt Nam</p>
            <Link to="/" className="inline-block bg-white text-green-700 font-bold px-8 py-3 rounded-full shadow hover:bg-green-100 transition">Về trang chủ</Link>
          </div>
        </section>
      </SectionAppear>

      {/* Lịch sử & Sứ mệnh */}
      <SectionAppear effect="fade-left" delay={0.1}>
        <section className="max-w-5xl mx-auto py-16 px-4 grid md:grid-cols-2 gap-10 items-center">
          <div className="animate-fade-in-left">
            <img src="https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=600&q=80" alt="Lịch sử" className="rounded-xl shadow-lg w-full object-cover" />
          </div>
          <div className="space-y-6 animate-fade-in-right">
            <h2 className="text-3xl font-bold text-green-700">Lịch sử & Sứ mệnh</h2>
            <p className="text-gray-700">Được thành lập từ năm 2010, HIV Care Center là đơn vị tiên phong trong lĩnh vực phòng chống, xét nghiệm và điều trị HIV/AIDS tại Việt Nam. Chúng tôi cam kết mang lại dịch vụ y tế chất lượng cao, bảo mật và không kỳ thị cho mọi bệnh nhân.</p>
            <ul className="list-disc pl-6 text-gray-600">
              <li>Sứ mệnh: Chăm sóc toàn diện, đồng hành cùng bệnh nhân HIV/AIDS.</li>
              <li>Tầm nhìn: Trở thành trung tâm hàng đầu khu vực về điều trị HIV/AIDS.</li>
              <li>Giá trị: Tận tâm, chuyên nghiệp, hiện đại, nhân văn.</li>
            </ul>
          </div>
        </section>
      </SectionAppear>

      {/* Đội ngũ chuyên gia */}
      <SectionAppear effect="fade-up" delay={0.2}>
        <section className="bg-green-50 py-16">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-green-700 mb-10">Đội ngũ chuyên gia</h2>
            {loadingDoctors ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-700"></div>
                <p className="mt-2 text-gray-600">Đang tải danh sách bác sĩ...</p>
              </div>
            ) : doctorsError ? (
              <div className="text-center py-8">
                <p className="text-red-500">{doctorsError}</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-4 lg:grid-cols-5 gap-6">
                {doctors && doctors.length > 0 ? (
                  doctors.map((doctor, idx) => (
                    <div key={doctor.doctor_id || doctor.id || idx} className="bg-white rounded-2xl shadow-lg p-6 text-center hover:scale-105 transition-all duration-300 animate-fade-in-up border border-gray-100">
                      <div className="relative mb-4">
                        <img 
                          src={doctor.avatar || `https://randomuser.me/api/portraits/men/${32 + idx}.jpg`} 
                          alt={doctor.name} 
                          className="w-20 h-20 mx-auto rounded-full shadow-lg border-4 border-green-200 object-cover" 
                        />
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                      <h3 className="font-bold text-lg text-green-800 mb-1 leading-tight">
                        {doctor.name || `BS. ${doctor.full_name || 'Chuyên gia'}`}
                      </h3>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-8">
                    <p className="text-gray-500">Chưa có thông tin bác sĩ.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </SectionAppear>

      {/* Thành tựu & hợp tác */}
      <SectionAppear effect="fade-right" delay={0.3}>
        <section className="py-16">
          <div className="max-w-5xl mx-auto px-4 grid md:grid-cols-2 gap-10 items-center">
            <div className="space-y-6 animate-fade-in-left">
              <h2 className="text-3xl font-bold text-green-700">Thành tựu & Hợp tác</h2>
              <ul className="list-disc pl-6 text-gray-700">
                <li>Hơn 10.000 bệnh nhân được điều trị thành công.</li>
                <li>Đối tác với các tổ chức y tế lớn: WHO, UNAIDS, Bộ Y tế Việt Nam.</li>
                <li>Tham gia nhiều dự án cộng đồng, nâng cao nhận thức về HIV/AIDS.</li>
                <li>Nhận nhiều giải thưởng về chất lượng dịch vụ y tế.</li>
              </ul>
            </div>
            <div className="animate-fade-in-right">
              <img src="https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=600&q=80" alt="Thành tựu" className="rounded-xl shadow-lg w-full object-cover" />
            </div>
          </div>
        </section>
      </SectionAppear>

      {/* Cơ sở vật chất */}
      <SectionAppear effect="zoom-in" delay={0.4}>
        <section className="bg-green-50 py-16">
          <div className="max-w-5xl mx-auto px-4 grid md:grid-cols-2 gap-10 items-center">
            <div className="animate-fade-in-left">
              <img src="https://images.unsplash.com/photo-1504439468489-c8920d796a29?auto=format&fit=crop&w=600&q=80" alt="Cơ sở vật chất" className="rounded-xl shadow-lg w-full object-cover" />
            </div>
            <div className="space-y-6 animate-fade-in-right">
              <h2 className="text-3xl font-bold text-green-700">Cơ sở vật chất hiện đại</h2>
              <p className="text-gray-700">Trung tâm được trang bị hệ thống phòng khám, phòng xét nghiệm và điều trị hiện đại, đạt chuẩn quốc tế. Không gian thân thiện, sạch sẽ, tạo cảm giác an tâm cho bệnh nhân.</p>
              <ul className="list-disc pl-6 text-gray-600">
                <li>Phòng xét nghiệm đạt chuẩn quốc tế.</li>
                <li>Trang thiết bị hiện đại, cập nhật công nghệ mới nhất.</li>
                <li>Khu vực tư vấn riêng tư, bảo mật.</li>
              </ul>
            </div>
          </div>
        </section>
      </SectionAppear>

      {/* Cam kết chất lượng */}
      <SectionAppear effect="fade-up" delay={0.5}>
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 text-center animate-fade-in-up">
            <h2 className="text-3xl font-bold text-green-700 mb-6">Cam kết chất lượng</h2>
            <p className="text-lg text-gray-700 mb-4">Chúng tôi cam kết mang lại dịch vụ y tế chất lượng cao, bảo mật tuyệt đối thông tin bệnh nhân, không kỳ thị và luôn đồng hành cùng bạn trên hành trình chiến thắng HIV/AIDS.</p>
            <div className="flex flex-wrap justify-center gap-6 mt-8">
              <span className="inline-block bg-green-100 text-green-700 px-6 py-3 rounded-full font-semibold shadow">Bảo mật thông tin</span>
              <span className="inline-block bg-green-100 text-green-700 px-6 py-3 rounded-full font-semibold shadow">Không kỳ thị</span>
              <span className="inline-block bg-green-100 text-green-700 px-6 py-3 rounded-full font-semibold shadow">Chăm sóc tận tâm</span>
              <span className="inline-block bg-green-100 text-green-700 px-6 py-3 rounded-full font-semibold shadow">Hỗ trợ 24/7</span>
            </div>
          </div>
        </section>
      </SectionAppear>
    </div>
  );
};

export default AboutPage; 