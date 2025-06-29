import React, { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import ServiceCard from "../../../components/common/ServiceCard"; // Import ServiceCard component
import DoctorCard from "../../../components/common/DoctorCard";
import { getDoctors, getServices } from "../../../services/api";
import { useAuth } from "../../../contexts/AuthContext";
import NewsSection from "./NewsSection";
import { AnimatePresence, motion, useInView } from "framer-motion";

const HomePage = () => {
  const { user, isAuthenticated, isStaff, getDefaultPath } = useAuth();

  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [doctorsError, setDoctorsError] = useState(null);

  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [servicesError, setServicesError] = useState(null);

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
    const fetchServices = async () => {
      try {
        const response = await getServices("test");
        console.log("Services response:", response);
        // Handle API response structure {message: "", data: [...]}
        const data = response.data || response;
        setServices(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching services:", err);
        setServicesError("Không thể tải danh sách dịch vụ.");
      } finally {
        setLoadingServices(false);
      }
    };

    fetchDoctors();
    fetchServices();
  }, []); // Map services to display format based on actual DB data
  const getServiceDisplayData = (serviceName) => {
    const mappings = {
      "khẳng định": {
        icon: <span>✅</span>,
        iconBg: "bg-green-600",
      },
      "sàng lọc": {
        icon: <span>🔍</span>,
        iconBg: "bg-blue-600",
      },
      "xét nghiệm": {
        icon: <span>�</span>,
        iconBg: "bg-purple-600",
      },
    };

    const key = Object.keys(mappings).find((k) =>
      serviceName.toLowerCase().includes(k)
    );

    return (
      mappings[key] || {
        icon: <span>🏥</span>,
        iconBg: "bg-blue-600",
      }
    );
  };

  // Redirect staff users to their dashboard
  if (isAuthenticated() && isStaff()) {
    return <Navigate to={getDefaultPath(user.role)} replace />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header và Footer đã được bọc ở App.jsx, không render ở đây */}
      <main className="flex-grow">
        {/* Hero Section */}
        <SectionFadeIn delay={0}>
          <section className="bg-white text-green-700 py-20 shadow-lg">
            <div className="max-w-4xl mx-auto text-center space-y-6 px-4">
              <div className="text-2xl font-bold tracking-wide">
                Trung tâm chăm sóc HIV hàng đầu Việt Nam
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-green-800">
                "Đồng hành cùng sức khỏe của bạn"
              </h1>
              <p className="text-lg font-medium text-green-600">
                Chăm sóc toàn diện, chuyên nghiệp và bảo mật
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
                <Link
                  to="/about"
                  className="bg-white text-green-700 border border-green-600 px-8 py-3 rounded-full font-semibold shadow hover:bg-green-100 transition"
                >
                  Giới thiệu trung tâm
                </Link>
              </div>
            </div>
          </section>
        </SectionFadeIn>

        {/* Về chúng tôi */}
        <SectionFadeIn delay={0.15}>
          <section className="bg-white py-16">
            <div className="max-w-5xl mx-auto px-4">
              <h2 className="text-3xl font-bold text-center text-green-700 mb-6">
                Về chúng tôi
              </h2>
              <p className="text-center text-gray-600 mb-10">
                Với hơn 20 năm kinh nghiệm, chúng tôi cam kết mang đến dịch vụ
                chăm sóc sức khỏe chất lượng cao cho bệnh nhân HIV/AIDS.
              </p>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="bg-green-50 rounded-xl p-6 shadow text-center">
                  <h3 className="font-bold text-xl text-green-700 mb-2">
                    Sứ mệnh
                  </h3>
                  <p className="text-gray-600">
                    Chăm sóc toàn diện và tận tâm cho mọi bệnh nhân, góp phần xây
                    dựng cộng đồng khỏe mạnh và không kỳ thị.
                  </p>
                </div>
                <div className="bg-green-50 rounded-xl p-6 shadow text-center">
                  <h3 className="font-bold text-xl text-green-700 mb-2">
                    Tầm nhìn
                  </h3>
                  <p className="text-gray-600">
                    Trở thành trung tâm chăm sóc HIV/AIDS hàng đầu khu vực, tiên
                    phong trong công nghệ và phương pháp điều trị.
                  </p>
                </div>
                <div className="bg-green-50 rounded-xl p-6 shadow text-center">
                  <h3 className="font-bold text-xl text-green-700 mb-2">
                    Giá trị cốt lõi
                  </h3>
                  <p className="text-gray-600">
                    Tận tâm, chuyên nghiệp, hiện đại và luôn đặt bệnh nhân làm
                    trung tâm trong mọi hoạt động.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </SectionFadeIn>

        {/* Dịch vụ nổi bật */}
        <SectionFadeIn delay={0.3}>
          <section className="bg-green-50 py-16">
            <div className="max-w-6xl mx-auto px-4">
              <h2 className="text-3xl font-bold text-center text-green-700 mb-2">
                Dịch vụ nổi bật
              </h2>{" "}
              <p className="text-center text-gray-500 mb-10">
                Các dịch vụ chăm sóc sức khỏe toàn diện
              </p>
              {loadingServices ? (
                <div className="text-center p-6">
                  Đang tải danh sách dịch vụ...
                </div>
              ) : servicesError ? (
                <div className="text-center p-6 text-red-500">
                  {servicesError}
                </div>
              ) : (
                <div className="grid md:grid-cols-3 gap-8">
                  {" "}
                  {services && services.length > 0 ? (
                    services.slice(0, 3).map((service) => {
                      const displayData = getServiceDisplayData(
                        service.name || ""
                      );
                      return (
                        <ServiceCard
                          key={service.service_id || service.id}
                          iconBg={displayData.iconBg}
                          iconColor="text-white"
                          icon={displayData.icon}
                          name={service.name || "Dịch vụ"}
                          description={
                            service.description ||
                            "Dịch vụ chăm sóc sức khỏe chuyên nghiệp"
                          }
                          price={
                            service.price === 0 || service.price === null
                              ? "Miễn phí"
                              : `${Number(service.price).toLocaleString()}đ`
                          }
                          link={`/service/${service.service_id || service.id}`}
                        />
                      );
                    })
                  ) : (
                    <div className="col-span-3 text-center p-6 text-gray-500">
                      Chưa có dịch vụ nào
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        </SectionFadeIn>

        <NewsSection />

        {/* Đội ngũ bác sĩ chuyên nghiệp */}
        <SectionFadeIn delay={0.45}>
          <section className="bg-white py-16">
            <div className="max-w-6xl mx-auto px-4">
              <h2 className="text-3xl font-bold text-center text-green-700 mb-2">
                Đội ngũ bác sĩ chuyên nghiệp
              </h2>
              <p className="text-center text-gray-500 mb-10">
                Các chuyên gia hàng đầu trong lĩnh vực HIV/AIDS
              </p>
              {loadingDoctors ? (
                <div className="text-center p-6">
                  Đang tải danh sách bác sĩ...
                </div>
              ) : doctorsError ? (
                <div className="text-center p-6 text-red-500">{doctorsError}</div>
              ) : (
                <DoctorSlider doctors={doctors} />
              )}
            </div>
          </section>
        </SectionFadeIn>

        {/* Chứng nhận & Giấy phép */}
        <SectionFadeIn delay={0.6}>
          <section className="bg-green-50 py-16">
            <div className="max-w-5xl mx-auto px-4">
              <h2 className="text-3xl font-bold text-center text-green-700 mb-6">
                Chứng nhận & Giấy phép
              </h2>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="bg-white rounded-xl p-6 shadow text-center border border-green-100">
                  <div className="font-bold text-lg text-green-700 mb-2">
                    Chứng nhận ISO 9001:2015
                  </div>
                  <div className="text-gray-600">
                    Hệ thống quản lý chất lượng quốc tế
                  </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow text-center border border-green-100">
                  <div className="font-bold text-lg text-green-700 mb-2">
                    Giấy phép hoạt động
                  </div>
                  <div className="text-gray-600">Được cấp bởi Sở Y tế TP.HCM</div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow text-center border border-green-100">
                  <div className="font-bold text-lg text-green-700 mb-2">
                    Chứng nhận WHO
                  </div>
                  <div className="text-gray-600">
                    Đạt chuẩn quốc tế về chăm sóc HIV/AIDS
                  </div>
                </div>
              </div>
            </div>
          </section>
        </SectionFadeIn>
      </main>
    </div>
  );
};

function DoctorSlider({ doctors }) {
  const [startIndex, setStartIndex] = React.useState(0);
  const [pageKey, setPageKey] = React.useState(0);
  const itemsPerPage = 3;
  const total = doctors.length;

  React.useEffect(() => {
    if (total <= itemsPerPage) return;
    const interval = setInterval(() => {
      setStartIndex((prev) => {
        const next = (prev + itemsPerPage) % total;
        setPageKey((k) => k + 1);
        return next;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [total]);

  const visible = [];
  for (let i = 0; i < Math.min(itemsPerPage, total); i++) {
    visible.push(doctors[(startIndex + i) % total]);
  }

  return (
    <div className="relative min-h-[320px]">
      <AnimatePresence mode="wait">
        <motion.div
          key={pageKey}
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -60 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="grid sm:grid-cols-1 md:grid-cols-3 gap-8"
        >
          {visible.map((doc) => (
            <DoctorCard
              key={doc.id}
              image={doc.avatar}
              name={doc.name}
              link={`/doctors/${doc.id}`}
            />
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function SectionFadeIn({ children, delay = 0 }) {
  const ref = React.useRef();
  const inView = useInView(ref, { once: true, margin: "-100px" });
  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: "easeOut", delay }}
      className="w-full"
    >
      {children}
    </motion.section>
  );
}

export default HomePage;
