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
import PatientCard from "./PatientCard";
import PatientExam from "./PatientExam";

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
  const [viewingPatientId, setViewingPatientId] = useState(null);

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
        console.error("Error fetching appointments:", err);
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

  // const handleStartExam = (patient) => {
  //   setSelectedPatient(patient);
  //   setMode("exam");
  //   // Chuyển sang inProgress
  //   setQueue((prev) =>
  //     prev.filter((p) => p.appointment_id !== patient.appointment_id)
  //   );
  //   setInProgress((prev) => [...prev, { ...patient, status: "in_progress" }]);
  // };

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
  if (viewingPatientId) {
    return (
      <PatientExam
        patientId={viewingPatientId}
        onBack={() => setViewingPatientId(null)}
      />
    );
  }
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
          mode === "exam" && selectedPatient ? (
            <ExamForm
              patient={selectedPatient}
              onSaveTemp={handleSaveTemp}
              onFinish={handleFinishExam}
            />
          ) : loading ? (
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
                        // onStartExam={() => handleStartExam(patient)}
                        onStartExam={() =>
                          setViewingPatientId(patient.patient_id)
                        }
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
                        type="examining" // hoặc "completed"
                        onContinueExam={() =>
                          setViewingPatientId(patient.patient_id)
                        }
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
                        onViewHistory={() =>
                          setViewingPatientId(patient.patient_id)
                        }
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
const ExamForm = ({ patient, onSaveTemp, onFinish }) => {
  const [form, setForm] = useState({
    diagnosis: "",
    treatmentPlan: "",
    note: "",
    reExamDate: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div className="bg-white rounded-xl shadow p-8 max-w-4xl mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-6">
        Chẩn đoán và kế hoạch điều trị
      </h2>
      <div className="mb-4">
        <label className="font-semibold">Chẩn đoán *</label>
        <textarea
          className="w-full border rounded p-2 mt-2"
          name="diagnosis"
          value={form.diagnosis}
          onChange={handleChange}
          placeholder="Chẩn đoán chi tiết..."
        />
      </div>
      <div className="mb-4">
        <label className="font-semibold">Kế hoạch điều trị</label>
        <input
          className="w-full border rounded p-2 mt-2"
          name="treatmentPlan"
          value={form.treatmentPlan}
          onChange={handleChange}
          placeholder="Tiếp tục phác đồ hiện tại"
        />
      </div>
      <div className="mb-4">
        <label className="font-semibold">Hướng dẫn khác</label>
        <textarea
          className="w-full border rounded p-2 mt-2"
          name="note"
          value={form.note}
          onChange={handleChange}
          placeholder="Hướng dẫn thêm về chế độ ăn uống, tập thể dục..."
        />
      </div>
      <div className="mb-4">
        <label className="font-semibold">Ngày hẹn tái khám</label>
        <input
          className="w-full border rounded p-2 mt-2"
          name="reExamDate"
          value={form.reExamDate}
          onChange={handleChange}
          placeholder="dd/mm/yyyy"
        />
      </div>
      <div className="flex gap-4 justify-end mt-8">
        <button
          className="bg-white border border-gray-300 px-6 py-2 rounded-lg flex items-center gap-2 font-semibold hover:bg-gray-100"
          onClick={() => onSaveTemp({ ...patient, ...form })}
        >
          <FileText className="w-5 h-5" />
          Lưu tạm
        </button>
        <button
          className="bg-gray-900 text-white px-6 py-2 rounded-lg flex items-center gap-2 font-semibold hover:bg-gray-800"
          onClick={() => onFinish({ ...patient, ...form })}
        >
          <CheckCircle className="w-5 h-5" />
          Hoàn thành khám
        </button>
      </div>
    </div>
  );
};
export default DoctorDashboard;
