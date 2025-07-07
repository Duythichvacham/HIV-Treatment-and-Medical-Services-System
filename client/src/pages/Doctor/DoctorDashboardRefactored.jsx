import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";

// Components
import StatsCards from "./components/Dashboard/StatsCards";
import TabNavigation from "./components/Dashboard/TabNavigation";
import FilterBar from "./components/Dashboard/FilterBar";
import LoadingSpinner from "./components/Dashboard/LoadingSpinner";
import QueueColumn from "./components/PatientQueue/QueueColumn";
import PatientExamRefactored from "./PatientExamRefactored";

// Hooks
import { useAppointments } from "./hooks/useAppointments";
import { useFilters } from "./hooks/useFilters";

// Utils
import { TABS, QUEUE_TYPES, APPOINTMENT_STATUS } from "./utils/constants";

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [doctorId, setDoctorId] = useState(null);
  const [viewingPatientId, setViewingPatientId] = useState(null);
  const [viewingAppointmentId, setViewingAppointmentId] = useState(null);
  const [viewMode, setViewMode] = useState("edit");


  // Note: Consultation feature is not yet implemented in the backend
  // Only examination appointments are currently supported

  // Custom hooks
  const filters = useFilters();
  const appointments = useAppointments(doctorId, filters.selectedDate);

  // Get doctor ID from user
  useEffect(() => {
    if (user?.doctor_id) {
      console.log("[DEBUG] Using doctor_id from user object:", user.doctor_id);
      setDoctorId(user.doctor_id);
    } else if (user?.id) {
      // Fallback logic if needed
      console.log("[DEBUG] No doctor_id found, might need to fetch");
    }
  }, [user]);

  // Handle patient actions
  const handlePatientAction = async (patient, actionType) => {
    
    try {
      switch (actionType) {
        case QUEUE_TYPES.WAITING: {
          // Start examination
          const result = await appointments.updateAppointmentStatus(
            patient.appointment_id,
            APPOINTMENT_STATUS.IN_PROGRESS
          );

          if (result.success) {
            setViewMode("edit");
            setViewingPatientId(patient.patient_id);
            setViewingAppointmentId(patient.appointment_id);
            alert(
              "Bắt đầu khám bệnh nhân: " + (patient.full_name || patient.name)
            );
          } else {
            alert("Có lỗi xảy ra: " + result.error);
          }
          break;
        }

        case QUEUE_TYPES.EXAMINING: {
          // Continue examination
          setViewMode("edit");
          setViewingPatientId(patient.patient_id);
          setViewingAppointmentId(patient.appointment_id);
          break;
        }

        case QUEUE_TYPES.COMPLETED: {
          // View patient history
          setViewMode("view");
          setViewingPatientId(patient.patient_id);
          setViewingAppointmentId(patient.appointment_id);
          break;
        }

        default:
          console.warn("Unknown action type:", actionType);
      }
    } catch (error) {
      console.error("Error handling patient action:", error);
      alert("Có lỗi xảy ra khi thực hiện thao tác");
    }
  };

  // Handle exam completion
  const handleFinishExam = async () => {
    try {
      // Find current patient in inProgress list
      const currentPatient = appointments.appointments.inProgress.find(
        (p) => p.patient_id === viewingPatientId
      );

      if (!currentPatient) {
        throw new Error(
          "Không tìm thấy thông tin bệnh nhân trong danh sách đang khám"
        );
      }

      // Update appointment status to completed
      const result = await appointments.updateAppointmentStatus(
        currentPatient.appointment_id,
        APPOINTMENT_STATUS.COMPLETED
      );

      if (result.success) {
        // Return to dashboard
        setViewingPatientId(null);
        setViewingAppointmentId(null);
        setViewMode("edit");
        alert("Hoàn thành khám bệnh thành công!");
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Error finishing exam:", error);
      alert("Có lỗi xảy ra khi hoàn thành khám bệnh: " + error.message);
    }
  };

  // If viewing a patient, show the exam interface
  if (viewingPatientId) {
    // Find current patient data from appointments
    const currentPatient = [
      ...appointments.appointments.queue,
      ...appointments.appointments.inProgress,
      ...appointments.appointments.completed,
    ].find(
      (p) =>
        p.patient_id === viewingPatientId &&
        p.appointment_id === viewingAppointmentId
    );

    return (
      <PatientExamRefactored
        patientId={viewingPatientId}
        appointmentId={viewingAppointmentId}
        patientInfo={currentPatient} // Truyền thông tin patient từ appointments
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

  // Main dashboard view
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
        <StatsCards
          counts={appointments.getCounts()}
          consultationCount={0} // Consultation feature not yet implemented
        />

        {/* Tab Navigation */}
        <TabNavigation
          activeTab={filters.tab}
          onTabChange={filters.updateTab}
        />

        {/* Filter Bar */}
        <FilterBar
          selectedDate={filters.selectedDate}
          onDateChange={filters.updateDate}
          search={filters.search}
          onSearchChange={filters.updateSearch}
          selectedSlot={filters.selectedSlot}
          onSlotChange={filters.updateSlot}
          onResetToToday={filters.resetToToday}
          isToday={filters.isToday()}
          formattedDate={filters.getFormattedDate()}
        />

        {/* Content */}
        {filters.tab === TABS.QUEUE ? (
          appointments.loading ? (
            <LoadingSpinner
              message={`Đang tải dữ liệu cho ngày ${filters.getFormattedDate()}...`}
            />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Queue Column */}
              <QueueColumn
                type={QUEUE_TYPES.WAITING}
                title="Đang chờ khám"
                count={appointments.appointments.queue.length}
                patients={appointments.filterAppointments(
                  appointments.appointments.queue,
                  filters.search
                )}
                onPatientAction={handlePatientAction}
                
              />

              {/* In Progress Column */}
              <QueueColumn
                type={QUEUE_TYPES.EXAMINING}
                title="Đang khám"
                count={appointments.appointments.inProgress.length}
                patients={appointments.filterAppointments(
                  appointments.appointments.inProgress,
                  filters.search
                )}
                onPatientAction={handlePatientAction}
                
              />

              {/* Completed Column */}
              <QueueColumn
                type={QUEUE_TYPES.COMPLETED}
                title="Hoàn thành"
                count={appointments.appointments.completed.length}
                patients={appointments.filterAppointments(
                  appointments.appointments.completed,
                  filters.search
                )}
                onPatientAction={handlePatientAction}
               
              />
            </div>
          )
        ) : (
          // Consultation Tab - Feature not yet implemented
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.959 8.959 0 01-4.906-1.681L3 21l2.681-5.094A8.959 8.959 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Tính năng tư vấn
              </h3>
              <p className="text-gray-500 max-w-sm">
                Tính năng tư vấn trực tuyến đang được phát triển. Vui lòng quay
                lại sau.
              </p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {appointments.error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{appointments.error}</p>
            <button
              onClick={appointments.refreshAppointments}
              className="mt-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Thử lại
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;
