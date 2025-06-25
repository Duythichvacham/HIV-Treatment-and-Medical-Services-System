import React, { useState, useEffect, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import AppointmentForm from "../../../components/common/AppointmentForm";
import { getServices } from "../../../services/api";
import { AuthContext } from "../../../contexts/AuthContext";

const MainServiceDetail = () => {
  const { serviceId } = useParams(); // Only support /service/:serviceId
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchService = async () => {
      try {
        // Get services by type - first try with test type
        const services = await getServices("test");
        console.log("All services:", services);

        let foundService = null;
        let serviceType = "test"; // default

        // Find service by service_id
        if (serviceId) {
          console.log("Looking for service with ID:", serviceId);
          const serviceData = services.data || services;
          foundService = serviceData.find(
            (s) => s.service_id === parseInt(serviceId)
          );

          // Determine service type based on service name
          if (foundService) {
            if (foundService.name.toLowerCase().includes("sàng lọc")) {
              serviceType = "screening";
            } else if (foundService.name.toLowerCase().includes("khẳng định")) {
              serviceType = "confirm";
            } else if (
              foundService.name.toLowerCase().includes("tư vấn") ||
              foundService.name.toLowerCase().includes("arv")
            ) {
              serviceType = "pep";
            } else {
              serviceType = "test"; // default
            }
          }
        }

        // Fallback if not found
        if (!foundService) {
          const serviceData = services.data || services;
          if (serviceData.length > 0) {
            foundService = serviceData[0];
            serviceType = "test";
            console.warn(`Service not found, using fallback:`, foundService);
          }
        }

        if (!foundService) throw new Error("Service not found");

        // Enhance service data with additional info based on service type
        const enhancedService = {
          ...foundService,
          details: getServiceDetails(serviceType),
          process: getServiceProcess(serviceType),
        };

        setService(enhancedService);
      } catch (err) {
        console.error("Error fetching service:", err);
        setError("Không tìm thấy dịch vụ.");
      } finally {
        setLoading(false);
      }
    };
    fetchService();
  }, [serviceId]);
  // Helper function to get service details based on type
  const getServiceDetails = (serviceType) => {
    const detailsMap = {
      screening: [
        "Sàng lọc từ giai đoạn sớm",
        "Kết quả nhanh chóng",
        "Bảo mật tuyệt đối thông tin cá nhân",
        "Sử dụng công nghệ hiện đại",
        "Đội ngũ y tế chuyên nghiệp",
      ],
      confirm: [
        "Độ chính xác cao lên đến 99.9%",
        "Công nghệ xét nghiệm hiện đại",
        "Báo cáo chi tiết và rõ ràng",
        "Tư vấn chuyên sâu từ bác sĩ",
        "Hỗ trợ tâm lý cho bệnh nhân",
      ],
      pep: [
        "Hiệu quả lên đến 99% nếu dùng đúng cách",
        "Cần bắt đầu trong vòng 72h sau phơi nhiễm",
        "Theo dõi chuyên nghiệp suốt 28 ngày",
        "Miễn phí hoàn toàn",
        "Hỗ trợ 24/7 trong quá trình điều trị",
      ],
      test: [
        "Xét nghiệm chính xác và đáng tin cậy",
        "Thực hiện bởi đội ngũ chuyên môn cao",
        "Bảo mật thông tin tuyệt đối",
        "Kết quả nhanh chóng",
        "Hỗ trợ tư vấn chuyên nghiệp",
      ],
    };
    return detailsMap[serviceType] || detailsMap.test;
  };
  // Helper function to get service process based on type
  const getServiceProcess = (serviceType) => {
    const processMap = {
      screening: [
        "Đăng ký và khai báo y tế",
        "Lấy mẫu máu",
        "Xét nghiệm bằng test nhanh",
        "Trả kết quả và tư vấn",
      ],
      confirm: [
        "Đăng ký và thăm khám sơ bộ",
        "Lấy mẫu máu để xét nghiệm",
        "Xét nghiệm bằng phương pháp ELISA",
        "Xét nghiệm khẳng định Western Blot",
        "Trả kết quả và tư vấn điều trị",
      ],
      pep: [
        "Đánh giá nguy cơ phơi nhiễm",
        "Tư vấn và kê đơn thuốc PEP",
        "Theo dõi định kỳ hàng tuần",
        "Xét nghiệm sau 1 tháng",
        "Xét nghiệm sau 3 tháng",
      ],
      test: [
        "Đăng ký và khai báo y tế",
        "Lấy mẫu theo yêu cầu",
        "Thực hiện xét nghiệm",
        "Trả kết quả và tư vấn",
      ],
    };
    return processMap[serviceType] || processMap.test;
  };
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin dịch vụ...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops!</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            to="/"
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors inline-block"
          >
            Về trang chủ
          </Link>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">📋</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Không tìm thấy dịch vụ
          </h2>
          <p className="text-gray-600 mb-6">
            Dịch vụ bạn tìm kiếm không tồn tại
          </p>
          <Link
            to="/"
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors inline-block"
          >
            Về trang chủ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-8 max-w-7xl mx-auto">
      <Link to="/" className="text-gray-500 hover:underline inline-block mb-6">
        ← Quay lại trang chủ
      </Link>

      {/* Header Section */}
      <section className="bg-white p-8 rounded-lg shadow mb-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-green-800 mb-4">
            {service.name}
          </h1>
          <p className="text-lg text-gray-600 mb-6">{service.description}</p>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {" "}
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-700">
                {service.price === 0 || service.price === null
                  ? "Miễn phí"
                  : `${Number(service.price).toLocaleString()}đ`}
              </div>
              <div className="text-sm text-gray-600">Chi phí</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-700">
                {service.service_type === "test" ? "Xét nghiệm" : "Tư vấn"}
              </div>
              <div className="text-sm text-gray-600">Loại dịch vụ</div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Service Details */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-2xl font-semibold text-green-800 mb-4">
              Đặc điểm nổi bật
            </h2>
            <ul className="space-y-3">
              {service.details.map((detail, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-green-600 mr-3 mt-1">✓</span>
                  <span className="text-gray-700">{detail}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-semibold text-green-800 mb-4">
              Quy trình thực hiện
            </h2>
            <div className="space-y-4">
              {service.process.map((step, index) => (
                <div key={index} className="flex items-start">
                  <div className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-4 mt-1">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-700">{step}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Appointment Form */}
        <div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-green-800 mb-4">
              Đặt lịch ngay
            </h2>{" "}
            <AppointmentForm
              serviceType={`service_${service.service_id}`}
              serviceName={service.name}
              price={
                service.price === 0 || service.price === null
                  ? "Miễn phí"
                  : `${Number(service.price).toLocaleString()}đ`
              }
              user={user}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainServiceDetail;
