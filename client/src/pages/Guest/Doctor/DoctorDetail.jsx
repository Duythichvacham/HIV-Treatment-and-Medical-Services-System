import React, { useState, useEffect, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import AppointmentForm from "../../../components/appointment/AppointmentForm";
import { getDoctorById, getServices } from "../../../services/api";
import { AuthContext } from "../../../contexts/AuthContext";

const DoctorDetail = () => {
  const { doctorId } = useParams();
  const { user } = useContext(AuthContext);
  console.log("User in DoctorDetail:", user);
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("Thông tin");
  const [serviceExamination, setServiceExamination] = useState(null); // New state for serviceExamination

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const data = await getDoctorById(doctorId);
        if (!data) throw new Error("Not found");
        setDoctor(data);
      } catch (err) {
        setError("Không tìm thấy bác sĩ.");
      } finally {
        setLoading(false);
      }
    };
    fetchDoctor();
  }, [doctorId]);

  // Đảm bảo chỉ set serviceExamination 1 lần, ưu tiên lấy từ fetchServices (dữ liệu chuẩn)
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const allServices = await getServices();
        const serviceList = allServices.data || allServices;
        // Lấy đúng service_id === 1 (Khám tổng quát HIV)
        const examinationService = serviceList.find(
          (s) => s.service_type === "examination" && s.service_id === 1
        );
        setServiceExamination(examinationService);
      } catch (err) {
        setError("Không thể tải dịch vụ khám bệnh.");
      }
    };
    fetchServices();
  }, []);

  if (loading)
    return <div className="p-6 text-center">Đang tải thông tin bác sĩ...</div>;
  if (error || !doctor)
    return <div className="p-6 text-center text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 py-10 px-2 animate-fade-in duration-700">
      <div className="max-w-7xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-green-700 border border-green-200 bg-white rounded-full px-5 py-2 mb-6 text-lg font-semibold shadow hover:bg-green-50 hover:border-green-400 transition-all duration-200"
        >
          <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
            <path
              stroke="#16a34a"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Quay lại
        </Link>
        {/* Header Card */}
        <section className="bg-white p-10 rounded-3xl shadow-2xl mb-10 flex flex-col md:flex-row items-center gap-10 animate-slide-up duration-700">
          <img
            src={doctor.avatar}
            alt={doctor.name}
            className="w-40 h-40 rounded-full object-cover shadow-lg border-4 border-green-100"
          />
          <div className="flex-1">
            <h1 className="text-4xl font-extrabold text-green-800 mb-2 tracking-tight drop-shadow-lg">
              {doctor.name}
            </h1>
            <div className="text-gray-600 text-lg mb-2">{doctor.degrees}</div>
            <div className="flex items-center text-green-600 text-lg font-semibold mb-2">
              <span className="mr-2">🎖️</span>
              <span>{doctor.experience} năm kinh nghiệm</span>
            </div>
          </div>
        </section>
        {/* Tabs and Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-8 animate-fade-in animate-slide-up duration-700">
              <div className="flex border-b mb-6">
                <button
                  onClick={() => setActiveTab("Thông tin")}
                  className={`flex-1 py-4 text-center text-xl font-bold transition-all duration-200 ${
                    activeTab === "Thông tin"
                      ? "border-b-4 border-green-600 text-green-700 bg-green-50 rounded-t-2xl"
                      : "text-gray-600"
                  }`}
                >
                  Thông tin
                </button>
              </div>
              <div className="p-2">
                {activeTab === "Thông tin" && (
                  <div>
                    <h2 className="text-2xl font-bold mb-6 text-green-800">
                      Thông tin chi tiết
                    </h2>
                    <ul className="text-gray-700 space-y-4 text-lg">
                      <li>
                        <strong>Học vị:</strong> {doctor.degrees}
                      </li>
                      <li>
                        <strong>Kinh nghiệm:</strong> {doctor.experience} năm
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* Appointment Form Section */}
          <div className="animate-fade-in animate-slide-up duration-700 delay-200">
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-green-800 mb-6">
                Đặt lịch khám với bác sĩ
              </h2>
              <AppointmentForm
                serviceType_id={`examination_${doctorId}`}
                serviceName={`Khám bác sĩ ${doctor.name}`}
                price={serviceExamination ? serviceExamination.price : ""}
                user={user}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDetail;
