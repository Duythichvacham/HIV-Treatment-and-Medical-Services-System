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
import { useAuth } from "../../contexts/AuthContext";

const DoctorDashboard = () => {
  const { user } = useAuth();
  const doctorId = user?.doctor_id;
  const baseURL = "http://localhost:5000/api/v1/doctor/appointments";

  console.log("DoctorDashboard - User:", user);
  console.log("DoctorDashboard - Doctor ID:", doctorId);

  const [queue, setQueue] = useState([]);
  const [inProgress, setInProgress] = useState([]);
  const [finished, setFinished] = useState([]);  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("queue");  const [search, setSearch] = useState("");  const [viewingPatientId, setViewingPatientId] = useState(null);
  const [viewingAppointmentId, setViewingAppointmentId] = useState(null);
  const [viewMode, setViewMode] = useState("edit"); // "edit" or "view"
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]); // YYYY-MM-DD format
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
  ];  useEffect(() => {
    // Fetch appointments cho tất cả tab khi có doctorId
    if (!doctorId) return;
    
    const fetchAppointments = async () => {
      setLoading(true);
      try {
        const dateParam = selectedDate ? `?date=${selectedDate}` : '';
        const [queueRes, inProgressRes, finishedRes] = await Promise.all([
          axios.get(`${baseURL}/queue/${doctorId}${dateParam}`),
          axios.get(`${baseURL}/in_progress/${doctorId}${dateParam}`),
          axios.get(`${baseURL}/finished/${doctorId}${dateParam}`),
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
  }, [doctorId, selectedDate]); // Removed tab dependency to fetch for all tabs

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
  };  // Thêm vào trong DoctorDashboard component

  const [selectedPatient, setSelectedPatient] = useState(null);
  const [mode, setMode] = useState(""); // "exam" hoặc ""  // API để cập nhật status appointment
  const updateAppointmentStatus = async (appointmentId, status) => {
    try {
      const token = localStorage.getItem('token');
      console.log('Updating appointment status:', { appointmentId, status, token: token ? 'exists' : 'missing' });
      
      const response = await axios.post(`http://localhost:5000/api/v1/appointments/${appointmentId}/status`, {
        status: status
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Update appointment status response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating appointment status:', error.response?.data || error.message);
      throw error;
    }
  };  const handleStartExam = async (patient) => {
    try {
      console.log('Starting exam for patient:', patient);
      
      // Gọi API để cập nhật status thành 'in_progress'
      await updateAppointmentStatus(patient.appointment_id, 'in_progress');
      
      console.log('Status updated successfully, switching to exam view');      // Chuyển sang phiếu khám bệnh đầy đủ (mode = edit)
      setViewMode("edit");
      setViewingPatientId(patient.patient_id);
      setViewingAppointmentId(patient.appointment_id);
      // Chuyển sang inProgress
      setQueue((prev) =>
        prev.filter((p) => p.appointment_id !== patient.appointment_id)
      );
      setInProgress((prev) => [...prev, { ...patient, status: "in_progress" }]);
    } catch (error) {
      console.error('Error starting exam:', error);
      alert('Có lỗi xảy ra khi bắt đầu khám bệnh: ' + (error.response?.data?.message || error.message));
    }
  };  const handleContinueExam = (patient) => {
    console.log('Continuing exam for patient:', patient);
    // Chuyển sang phiếu khám bệnh đầy đủ (mode = edit)
    setViewMode("edit");
    setViewingPatientId(patient.patient_id);
    setViewingAppointmentId(patient.appointment_id);
  };
  const handleViewHistory = (patient) => {
    console.log('Viewing history for patient:', patient);
    // Chuyển sang xem hồ sơ (mode = view)
    setViewMode("view");
    setViewingPatientId(patient.patient_id);
    setViewingAppointmentId(patient.appointment_id);
  };
  const handleFinishExam = async (examData) => {
    try {
      console.log('handleFinishExam called with examData:', examData);
      
      // Tìm patient hiện tại trong inProgress list
      const currentPatient = inProgress.find(p => p.patient_id === viewingPatientId);
      if (!currentPatient) {
        throw new Error('Không tìm thấy thông tin bệnh nhân trong danh sách đang khám');
      }
      
      console.log('Found current patient:', currentPatient);
      
      // Gọi API để cập nhật status thành 'completed'
      await updateAppointmentStatus(currentPatient.appointment_id, 'completed');
      
      // Chuyển sang finished
      setInProgress((prev) =>
        prev.filter((p) => p.appointment_id !== currentPatient.appointment_id)
      );
      setFinished((prev) => [...prev, { ...currentPatient, status: "completed" }]);        // Quay về dashboard
      setViewingPatientId(null);
      setViewingAppointmentId(null);
      setViewMode("edit");
      
      alert('Hoàn thành khám bệnh thành công!');
    } catch (error) {
      console.error('Error finishing exam:', error);
      alert('Có lỗi xảy ra khi hoàn thành khám bệnh: ' + (error.message || error.response?.data?.message));
    }
  };if (viewingPatientId) {    return (
      <PatientExam
        patientId={viewingPatientId}
        appointmentId={viewingAppointmentId}
        onBack={() => {
          setViewingPatientId(null);
          setViewingAppointmentId(null);
          setViewMode("edit");
        }}
        onFinishExam={handleFinishExam}
        mode={viewMode}
      />
    );
  }
  return (
    <div className="min-h-screen bg-blue-50 p-6">
      <div className="max-w-7xl mx-auto">        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Dashboard Bác sĩ
          </h1>
          <div className="flex items-center gap-4">
            <p className="text-gray-600">Quản lý bệnh nhân và lịch khám</p>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              <span>Ngày: {new Date(selectedDate).toLocaleDateString('vi-VN', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
            </div>
          </div>
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
        </div>        {/* Date Picker and Search */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Date Picker */}
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
              className="px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Hôm nay
            </button>
          </div>
          
          {/* Search */}
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
        </div>        {/* Content */}
        {tab === "queue" ? (
          loading ? (
            <div className="text-center text-gray-500 py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p>Đang tải dữ liệu cho ngày {new Date(selectedDate).toLocaleDateString('vi-VN')}...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Đang chờ khám */}
              <div>
                <div className="flex items-center gap-2 mb-4 text-orange-700 text-xl font-bold">
                  <Clock className="w-6 h-6" />
                  Đang chờ khám ({queue.length})
                </div>                <div className="space-y-4">
                  {filterPatients(queue).length === 0 ? (
                    <div className="text-center text-gray-400 py-8">
                      {search ? "Không tìm thấy bệnh nhân nào" : `Không có bệnh nhân chờ khám vào ngày ${new Date(selectedDate).toLocaleDateString('vi-VN')}`}
                    </div>
                  ) : (
                    filterPatients(queue).map((patient, idx) => (                      <PatientCard
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
                </div>                <div className="space-y-4">
                  {filterPatients(inProgress).length === 0 ? (
                    <div className="text-center text-gray-400 py-8">
                      {search ? "Không tìm thấy bệnh nhân nào" : `Không có bệnh nhân đang khám vào ngày ${new Date(selectedDate).toLocaleDateString('vi-VN')}`}
                    </div>
                  ) : (
                    filterPatients(inProgress).map((patient, idx) => (                      <PatientCard
                        key={patient.appointment_id || patient.id}
                        patient={patient}
                        index={idx}
                        type="examining" // hoặc "completed"
                        onContinueExam={() => handleContinueExam(patient)}
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
                </div>                <div className="space-y-4">
                  {filterPatients(finished).length === 0 ? (
                    <div className="text-center text-gray-400 py-8">
                      {search ? "Không tìm thấy bệnh nhân nào" : `Không có bệnh nhân hoàn thành khám vào ngày ${new Date(selectedDate).toLocaleDateString('vi-VN')}`}
                    </div>
                  ) : (
                    filterPatients(finished).map((patient, idx) => (
                      <PatientCard
                        key={patient.appointment_id || patient.id}
                        patient={patient}
                        index={idx}
                        type="completed"                        onViewHistory={() =>
                          handleViewHistory(patient)
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
                ))              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;
