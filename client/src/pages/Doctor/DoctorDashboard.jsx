import axios from "axios";
import { useEffect, useState } from "react";
import {
  Clock,
  FileText,
  CheckCircle,
  User,
  Phone,
  Calendar,
  MessageCircle,
  Search,
} from "lucide-react";

const PatientCard = ({ patient, index, type }) => (
  <div className="bg-white rounded-xl shadow border p-6 flex flex-col gap-3 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-lg font-bold text-blue-700">
          {index + 1}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg text-gray-900">
              {patient.full_name || patient.name}
            </span>
            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
              Thường
            </span>
          </div>
          <div className="text-gray-400 text-sm">
            {patient.code ||
              `HIV${String(patient.patient_id).padStart(3, "0")}`}
          </div>
        </div>
      </div>
      {patient.status === "urgent" && (
        <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
          Khẩn cấp
        </span>
      )}
    </div>
    <div className="flex flex-col gap-1 text-gray-700 text-sm mb-2">
      <div className="flex items-center gap-1">
        <User className="w-4 h-4 text-gray-400" />
        {patient.age} tuổi -{" "}
        {patient.gender === "Male"
          ? "Nam"
          : patient.gender === "Female"
          ? "Nữ"
          : patient.gender}
      </div>
      <div className="flex items-center gap-1">
        <Clock className="w-4 h-4 text-gray-400" />
        Hẹn lúc:{" "}
        {patient.start_time
          ? new Date(patient.start_time).toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
            })
          : ""}
      </div>
      <div className="flex items-center gap-1">
        <Calendar className="w-4 h-4 text-gray-400" />
        Đặt lúc:{" "}
        {patient.booking_time
          ? new Date(patient.booking_time).toLocaleString("vi-VN")
          : ""}
      </div>
      {patient.phone && (
        <div className="flex items-center gap-1">
          <Phone className="w-4 h-4 text-pink-500" />
          <span className="font-medium">{patient.phone}</span>
        </div>
      )}
    </div>
    <div className="bg-blue-50 rounded p-3 text-sm">
      <span className="font-semibold">ARV:</span>{" "}
      {patient.arv_regimen || "Chưa có"}
      <br />
      <span className="font-semibold">Tuân thủ:</span>{" "}
      {patient.arv_adherence === "good"
        ? "Tốt (>95%)"
        : patient.arv_adherence === "average"
        ? "Khá (90-95%)"
        : patient.arv_adherence || "Chưa có"}
    </div>
    <div className="bg-green-50 rounded p-3 text-sm mt-2">
      <span className="font-semibold">Viral Load:</span>{" "}
      {patient.viral_load || "Chưa có"}
      <br />
      <span className="font-semibold">CD4:</span>{" "}
      {patient.cd4 ? `${patient.cd4}` : "Chưa có"}
    </div>
    {type === "waiting" && (
      <button className="w-full mt-2 bg-gray-900 text-white py-2 rounded-lg flex items-center justify-center gap-2 font-semibold hover:bg-gray-800 transition">
        <FileText className="w-5 h-5" />
        Bắt đầu khám
      </button>
    )}
    {type === "examining" && (
      <button className="w-full mt-2 bg-blue-600 text-white py-2 rounded-lg flex items-center justify-center gap-2 font-semibold hover:bg-blue-700 transition">
        <FileText className="w-5 h-5" />
        Tiếp tục khám
      </button>
    )}
    {type === "completed" && (
      <button className="w-full mt-2 bg-gray-100 text-gray-700 py-2 rounded-lg flex items-center justify-center gap-2 font-semibold hover:bg-gray-200 transition">
        <FileText className="w-5 h-5" />
        Xem hồ sơ
      </button>
    )}
  </div>
);

const DoctorDashboard = () => {
  const staff = JSON.parse(localStorage.getItem("staff"));
  const doctorId = staff?.doctor_id;
  const baseURL = "http://localhost:5000/api/v1/doctor/appointments";

  const [queue, setQueue] = useState([]);
  const [inProgress, setInProgress] = useState([]);
  const [finished, setFinished] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("queue");
  const [search, setSearch] = useState("");

  // Dữ liệu mẫu cho tư vấn trực tuyến
  const consultationPatients = [
    {
      id: 1,
      name: "Nguyễn Văn Tư Vấn",
      code: "TV001",
      age: 30,
      gender: "Nam",
      appointmentTime: "10:00",
      bookingTime: "09:00:00 1/6/2024",
      phone: "0909999999",
      arv: "TDF/3TC/EFV",
      adherence: "Tốt (>95%)",
      viralLoad: "Không phát hiện (<50 copies/ml)",
      cd4: "500 cells/μL",
      status: "normal",
    },
  ];

  useEffect(() => {
    if (tab !== "queue") return;
    const fetchAppointments = async () => {
      setLoading(true);
      try {
        const [queueRes, inProgressRes, finishedRes] = await Promise.all([
          axios.get(`${baseURL}/queue/${doctorId}`),
          axios.get(`${baseURL}/in_progress/${doctorId}`),
          axios.get(`${baseURL}/finished/${doctorId}`),
        ]);
        setQueue(queueRes.data.data || []);
        setInProgress(inProgressRes.data.data || []);
        setFinished(finishedRes.data.data || []);
      } catch (err) {
        setQueue([]);
        setInProgress([]);
        setFinished([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, [doctorId, tab]);

  // Lọc theo search
  const filterPatients = (patients) => {
    if (!search) return patients;
    return patients.filter(
      (patient) =>
        (patient.full_name || patient.name || "")
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        (
          patient.code ||
          (patient.patient_id
            ? `HIV${String(patient.patient_id).padStart(3, "0")}`
            : "")
        )
          .toLowerCase()
          .includes(search.toLowerCase())
    );
  };
  // Thêm vào trong DoctorDashboard component

  const [selectedPatient, setSelectedPatient] = useState(null);
  const [mode, setMode] = useState(""); // "exam" hoặc ""

  const handleStartExam = (patient) => {
    setSelectedPatient(patient);
    setMode("exam");
    // Chuyển sang inProgress
    setQueue((prev) =>
      prev.filter((p) => p.appointment_id !== patient.appointment_id)
    );
    setInProgress((prev) => [...prev, { ...patient, status: "in_progress" }]);
  };

  const handleSaveTemp = (updatedPatient) => {
    // Cập nhật thông tin bệnh nhân đang khám (nếu có)
    setInProgress((prev) =>
      prev.map((p) =>
        p.appointment_id === updatedPatient.appointment_id ? updatedPatient : p
      )
    );
    // Giữ nguyên ở inProgress
    setMode("");
    setSelectedPatient(null);
  };

  const handleFinishExam = (updatedPatient) => {
    // Chuyển sang finished
    setInProgress((prev) =>
      prev.filter((p) => p.appointment_id !== updatedPatient.appointment_id)
    );
    setFinished((prev) => [...prev, { ...updatedPatient, status: "finished" }]);
    setMode("");
    setSelectedPatient(null);
  };
  return (
    <div className="min-h-screen bg-blue-50 p-6">
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
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-2">
                BN hôm nay
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {queue.length + inProgress.length + finished.length}
              </p>
            </div>
            <div className="p-3 rounded-full bg-gray-50 text-blue-500">
              <User className="w-6 h-6" />
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-2">Chờ khám</p>
              <p className="text-3xl font-bold text-gray-900">{queue.length}</p>
            </div>
            <div className="p-3 rounded-full bg-gray-50 text-orange-500">
              <Clock className="w-6 h-6" />
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-2">
                Tư vấn online
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {consultationPatients.length}
              </p>
            </div>
            <div className="p-3 rounded-full bg-gray-50 text-green-500">
              <MessageCircle className="w-6 h-6" />
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-2">
                Hoàn thành
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {finished.length}
              </p>
            </div>
            <div className="p-3 rounded-full bg-gray-50 text-purple-500">
              <CheckCircle className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            className={`flex-1 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 ${
              tab === "queue"
                ? "bg-white text-blue-700 shadow"
                : "bg-gray-100 text-gray-600"
            }`}
            onClick={() => setTab("queue")}
          >
            <User className="w-5 h-5" />
            Hàng đợi khám
          </button>
          <button
            className={`flex-1 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 ${
              tab === "consult"
                ? "bg-white text-blue-700 shadow"
                : "bg-gray-100 text-gray-600"
            }`}
            onClick={() => setTab("consult")}
          >
            <MessageCircle className="w-5 h-5" />
            Tư vấn trực tuyến
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
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Content */}
        {tab === "queue" ? (
          loading ? (
            <p>Đang tải dữ liệu...</p>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Đang chờ khám */}
              <div>
                <div className="flex items-center gap-2 mb-4 text-orange-700 text-xl font-bold">
                  <Clock className="w-6 h-6" />
                  Đang chờ khám ({queue.length})
                </div>
                <div className="space-y-4">
                  {filterPatients(queue).length === 0 ? (
                    <div className="text-center text-gray-400 py-8">
                      Không có bệnh nhân nào
                    </div>
                  ) : (
                    filterPatients(queue).map((patient, idx) => (
                      <PatientCard
                        key={patient.appointment_id || patient.id}
                        patient={patient}
                        index={idx}
                        type="waiting"
                        onStartExam={() => handleStartExam(patient)}
                      />
                    ))
                  )}
                </div>
              </div>
              {/* Đang khám */}
              <div>
                <div className="flex items-center gap-2 mb-4 text-blue-700 text-xl font-bold">
                  <FileText className="w-6 h-6" />
                  Đang khám ({inProgress.length})
                </div>
                <div className="space-y-4">
                  {filterPatients(inProgress).length === 0 ? (
                    <div className="text-center text-gray-400 py-8">
                      Không có bệnh nhân nào
                    </div>
                  ) : (
                    filterPatients(inProgress).map((patient, idx) => (
                      <PatientCard
                        key={patient.appointment_id || patient.id}
                        patient={patient}
                        index={idx}
                        type="examining"
                      />
                    ))
                  )}
                </div>
              </div>
              {/* Hoàn thành */}
              <div>
                <div className="flex items-center gap-2 mb-4 text-green-700 text-xl font-bold">
                  <CheckCircle className="w-6 h-6" />
                  Hoàn thành ({finished.length})
                </div>
                <div className="space-y-4">
                  {filterPatients(finished).length === 0 ? (
                    <div className="text-center text-gray-400 py-8">
                      Không có bệnh nhân nào
                    </div>
                  ) : (
                    filterPatients(finished).map((patient, idx) => (
                      <PatientCard
                        key={patient.appointment_id || patient.id}
                        patient={patient}
                        index={idx}
                        type="completed"
                      />
                    ))
                  )}
                </div>
              </div>
            </div>
          )
        ) : (
          // Tab tư vấn trực tuyến (dùng dữ liệu mẫu)
          <div>
            <div className="flex items-center gap-2 mb-4 text-green-700 text-xl font-bold">
              <MessageCircle className="w-6 h-6" />
              Bệnh nhân chờ tư vấn ({consultationPatients.length})
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filterPatients(consultationPatients).length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  Không có bệnh nhân nào
                </div>
              ) : (
                filterPatients(consultationPatients).map((patient, idx) => (
                  <PatientCard
                    key={patient.id}
                    patient={patient}
                    index={idx}
                    type="waiting"
                  />
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;
