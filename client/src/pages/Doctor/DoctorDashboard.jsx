import React, { useState } from "react";
import {
  Clock,
  Video,
  CheckCircle,
  Calendar,
  Phone,
  Search,
  User,
  Eye,
  FileText,
  Filter,
  MessageCircle,
} from "lucide-react";

// Import PatientCard component (trong thực tế sẽ là: import PatientCard from './PatientCard';)
const PatientCard = ({ patient, type }) => (
  <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
          {patient.id}
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 text-lg">
            {patient.name}
          </h3>
          <p className="text-gray-500 text-sm">{patient.code}</p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        {patient.status === "urgent" && (
          <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
            Khẩn cấp
          </span>
        )}
        {type.includes("consultation") && (
          <>
            {type === "consultation-waiting" && (
              <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                Chờ tư vấn
              </span>
            )}
            {type === "consultation-active" && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                Đang tư vấn
              </span>
            )}
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                patient.consultationType === "video"
                  ? "bg-green-100 text-green-700"
                  : "bg-cyan-100 text-cyan-700"
              }`}
            >
              {patient.consultationType === "video" ? "Video" : "Chat"}
            </span>
          </>
        )}
        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
          Thường
        </span>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
      {patient.consultationType && (
        <div className="flex items-center space-x-2 text-gray-600 col-span-2">
          {patient.consultationType === "video" ? (
            <Video className="w-4 h-4 text-green-500" />
          ) : (
            <MessageCircle className="w-4 h-4 text-cyan-500" />
          )}
          <span>
            {patient.consultationType === "video"
              ? "Tư vấn video"
              : "Tư vấn chat"}
          </span>
        </div>
      )}
      <div className="flex items-center space-x-2 text-gray-600">
        <Clock className="w-4 h-4" />
        <span>Hẹn lúc: {patient.appointmentTime}</span>
      </div>
      <div className="flex items-center space-x-2 text-gray-600 col-span-2">
        <Calendar className="w-4 h-4" />
        <span>Đặt lúc: {patient.bookingTime}</span>
      </div>
      {patient.phone && (
        <div className="flex items-center space-x-2 text-gray-600 col-span-2">
          <Phone className="w-4 h-4 text-pink-500" />
          <span>{patient.phone}</span>
        </div>
      )}
    </div>

    {patient.reason && (
      <div className="bg-blue-50 rounded-lg p-3 mb-4">
        <div className="text-sm">
          <strong>Lý do:</strong>{" "}
          <span className="text-gray-700">{patient.reason}</span>
        </div>
      </div>
    )}

    {patient.arv && (
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <div className="grid grid-cols-1 gap-2 text-sm">
          <div>
            <strong>ARV:</strong> {patient.arv}
          </div>
          <div>
            <strong>Tuân thủ:</strong>{" "}
            <span className="text-green-600">{patient.adherence}</span>
          </div>
          <div>
            <strong>Viral Load:</strong> {patient.viralLoad}
          </div>
          <div>
            <strong>CD4:</strong> {patient.cd4}
          </div>
        </div>
      </div>
    )}

    <div className="flex space-x-3">
      {type === "waiting" && (
        <button className="flex-1 bg-gray-800 text-white py-2 px-4 rounded-lg font-medium hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2">
          <FileText className="w-4 h-4" />
          <span>Bắt đầu khám</span>
        </button>
      )}
      {type === "examining" && (
        <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2">
          <FileText className="w-4 h-4" />
          <span>Tiếp tục khám</span>
        </button>
      )}
      {type === "completed" && (
        <button className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2">
          <Eye className="w-4 h-4" />
          <span>Xem hồ sơ</span>
        </button>
      )}
      {type === "consultation-waiting" && (
        <button className="flex-1 bg-yellow-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-yellow-700 transition-colors flex items-center justify-center space-x-2">
          <FileText className="w-4 h-4" />
          <span>Bắt đầu tư vấn</span>
        </button>
      )}
      {type === "consultation-active" && (
        <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2">
          <MessageCircle className="w-4 h-4" />
          <span>Tiếp tục tư vấn</span>
        </button>
      )}
    </div>
  </div>
);

const DoctorDashboard = () => {
  const [currentView, setCurrentView] = useState("dashboard"); // 'dashboard' or 'consultation'
  const [searchTerm, setSearchTerm] = useState("");

  const waitingPatients = [
    {
      id: 1,
      name: "Nguyễn Văn A",
      code: "HIV001",
      age: 35,
      gender: "Nam",
      appointmentTime: "08:30",
      bookingTime: "07:15:00 1/6/2024",
      phone: "0901234567",
      arv: "TDF/3TC/EFV",
      adherence: "Tốt (>95%)",
      viralLoad: "Không phát hiện (<50 copies/ml)",
      cd4: "520 cells/μL",
      status: "normal",
    },
    {
      id: 2,
      name: "Lê Thị B",
      code: "HIV003",
      age: 29,
      gender: "Nữ",
      appointmentTime: "09:30",
      bookingTime: "08:00:00 1/6/2024",
      phone: "0912345678",
      arv: "TAF/FTC/BIC",
      adherence: "Tốt (>95%)",
      viralLoad: "Không phát hiện (<20 copies/ml)",
      cd4: "580 cells/μL",
      status: "normal",
    },
  ];

  const examiningPatients = [
    {
      id: 3,
      name: "Bệnh nhân ẩn danh",
      code: "HIV002",
      age: 28,
      gender: "Nữ",
      appointmentTime: "09:00",
      bookingTime: "08:45:00 1/6/2024",
      arv: "TDF/3TC/DTG",
      adherence: "Khá (90-95%)",
      viralLoad: "150 copies/ml",
      cd4: "350 cells/μL",
      status: "urgent",
    },
  ];

  const completedPatients = [
    {
      id: 5,
      name: "Phạm Thị D",
      code: "HIV005",
      age: 31,
      gender: "Nữ",
      appointmentTime: "10:30",
      bookingTime: "09:30:00 1/6/2024",
      phone: "0987123456",
      arv: "TAF/FTC/BIC",
      adherence: "Tốt (>95%)",
      viralLoad: "Không phát hiện (<20 copies/ml)",
      cd4: "620 cells/μL",
      status: "normal",
    },
    {
      id: 6,
      name: "Trần Văn E",
      code: "HIV006",
      age: 42,
      gender: "Nam",
      appointmentTime: "11:00",
      bookingTime: "10:00:00 1/6/2024",
      phone: "0976543210",
      arv: "TDF/3TC/EFV",
      adherence: "Tốt (>95%)",
      viralLoad: "Không phát hiện (<50 copies/ml)",
      cd4: "480 cells/μL",
      status: "normal",
    },
  ];

  // Consultation patients
  const consultationWaitingPatients = [
    {
      id: 1,
      name: "Nguyễn Văn A",
      code: "TV001",
      appointmentTime: "09:00 (30 phút)",
      bookingTime: "07:30:00 1/6/2024",
      phone: "0901234567",
      consultationType: "video",
      reason: "Tư vấn về tác dụng phụ của thuốc ARV",
    },
    {
      id: 3,
      name: "Trần Thị B",
      code: "TV003",
      appointmentTime: "10:00 (30 phút)",
      bookingTime: "08:15:00 1/6/2024",
      phone: "0987654321",
      consultationType: "video",
      reason: "Tư vấn về chế độ dinh dưỡng cho người nhiễm HIV",
    },
  ];

  const consultationActivePatients = [
    {
      id: 2,
      name: "Bệnh nhân ẩn danh",
      code: "TV002",
      appointmentTime: "09:30 (45 phút)",
      bookingTime: "08:00:00 1/6/2024",
      consultationType: "chat",
      reason: "Tư vấn về PrEP",
    },
  ];

  // Calculate total patients for today
  const totalPatientsToday =
    waitingPatients.length +
    examiningPatients.length +
    completedPatients.length;
  const totalConsultations =
    consultationWaitingPatients.length + consultationActivePatients.length;

  const stats = [
    {
      title: "BN hôm nay",
      value: totalPatientsToday,
      icon: User,
      color: "text-blue-500",
    },
    {
      title: "Chờ khám",
      value: waitingPatients.length,
      icon: Clock,
      color: "text-orange-500",
    },
    {
      title: "Tư vấn online",
      value: totalConsultations,
      icon: Video,
      color: "text-green-500",
    },
    {
      title: "Hoàn thành",
      value: completedPatients.length,
      icon: CheckCircle,
      color: "text-purple-500",
    },
  ];

  const TabSection = ({
    title,
    patients,
    type,
    icon: Icon,
    bgColor,
    textColor,
  }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className={`${bgColor} ${textColor} px-6 py-4 rounded-t-lg`}>
        <div className="flex items-center space-x-2">
          <Icon className="w-5 h-5" />
          <h2 className="text-lg font-semibold">
            {title} ({patients.length})
          </h2>
        </div>
      </div>
      <div className="p-6">
        {patients.length > 0 ? (
          <div className="space-y-4">
            {patients.map((patient) => (
              <PatientCard key={patient.id} patient={patient} type={type} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-4">
              <Icon className="w-12 h-12 mx-auto opacity-50" />
            </div>
            <p className="text-gray-500">Không có bệnh nhân nào</p>
          </div>
        )}
      </div>
    </div>
  );

  if (currentView === "consultation") {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center space-x-3">
                <MessageCircle className="w-8 h-8 text-blue-500" />
                <span>Tư vấn trực tuyến</span>
              </h1>
              <p className="text-gray-600">
                Quản lý các phiên tư vấn trực tuyến với bệnh nhân HIV (4 phiên)
              </p>
            </div>
            <button
              onClick={() => setCurrentView("dashboard")}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Về Dashboard
            </button>
          </div>

          {/* Search and Filter */}
          <div className="flex space-x-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Tìm theo tên hoặc mã bệnh nhân..."
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex space-x-2">
              <select className="px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Tất cả</option>
                <option>Video</option>
                <option>Chat</option>
              </select>
              <select className="px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Tất cả</option>
                <option>Chờ tư vấn</option>
                <option>Đang tư vấn</option>
              </select>
            </div>
          </div>

          {/* Consultation Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chờ tư vấn */}
            <TabSection
              title="Chờ tư vấn"
              patients={consultationWaitingPatients}
              type="consultation-waiting"
              icon={Clock}
              bgColor="bg-yellow-50"
              textColor="text-yellow-700"
            />

            {/* Đang tư vấn */}
            <TabSection
              title="Đang tư vấn"
              patients={consultationActivePatients}
              type="consultation-active"
              icon={MessageCircle}
              bgColor="bg-blue-50"
              textColor="text-blue-700"
            />

            {/* Hoàn thành tư vấn */}
            <TabSection
              title="Hoàn thành tư vấn"
              patients={[]}
              type="consultation-completed"
              icon={CheckCircle}
              bgColor="bg-green-50"
              textColor="text-green-700"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Dashboard Bác sĩ
          </h1>
          <p className="text-gray-600">Quản lý bệnh nhân và lịch khám</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium mb-2">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-full bg-gray-50 ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-8">
          <button className="flex items-center space-x-2 px-4 py-2 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
            <User className="w-4 h-4" />
            <span>Hàng đợi khám</span>
          </button>
          <button
            onClick={() => setCurrentView("consultation")}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Tư vấn trực tuyến</span>
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Tìm theo tên hoặc mã bệnh nhân..."
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Three Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Đang chờ khám */}
          <TabSection
            title="Đang chờ khám"
            patients={waitingPatients}
            type="waiting"
            icon={Clock}
            bgColor="bg-orange-50"
            textColor="text-orange-700"
          />

          {/* Đang khám */}
          <TabSection
            title="Đang khám"
            patients={examiningPatients}
            type="examining"
            icon={FileText}
            bgColor="bg-blue-50"
            textColor="text-blue-700"
          />

          {/* Hoàn thành */}
          <TabSection
            title="Hoàn thành"
            patients={completedPatients}
            type="completed"
            icon={CheckCircle}
            bgColor="bg-green-50"
            textColor="text-green-700"
          />
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
