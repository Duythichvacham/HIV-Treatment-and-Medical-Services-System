import React, { useState, useMemo, useCallback } from "react";
import { TestTube, Clock, CheckCircle } from "lucide-react";
import GenericStatsCards from "../../components/common/GenericStatsCards";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import TestQueueColumn from "./components/TestQueue/TestQueueColumn";
import TestDetailPopup from "./components/TestQueue/TestDetailPopup";
import { formatDateVietnamese } from "../../utils/dateUtil";
import FilterBar from "./components/FilterBar";
import { TEST_STATUS } from "../../utils/labStaffConstants";
import useLabAppointments from "../../hooks/labstaff/useLabAppointments";
import { useAuth } from "../../contexts/AuthContext";

const LabStaffDashboard = () => {
  //const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [search, setSearch] = useState("");
  const [selectedTest, setSelectedTest] = useState(null);

  // Bỏ useMemo và params object không cần thiết
  // useEffect(() => { ... });

  // Gọi hook với giá trị nguyên thủy `selectedDate` để tránh re-render không cần thiết
  const {
    appointments,
    loading,
    error,
    getServiceTypeCounts,
    updateTestRequestStatus,
    updateLabAppointmentStatus,
    saveTestResults,
    refreshAppointments,
  } = useLabAppointments(selectedDate); // Thay đổi ở đây: truyền selectedDate trực tiếp

  const stats = useMemo(() => {
    const counts = getServiceTypeCounts();
    return [
      {
        title: "Xét nghiệm CD4 và Viral Load",
        value: counts.cd4_viral,
        icon: TestTube,
        color: "text-blue-500",
        bgColor: "bg-blue-50",
        id: 3,
      },
      {
        title: "Xét nghiệm sàng lọc",
        value: counts.screening,
        icon: Clock,
        color: "text-orange-500",
        bgColor: "bg-orange-50",
        id: 4,
      },
      {
        title: "Xét nghiệm khẳng định",
        value: counts.confirmation,
        icon: CheckCircle,
        color: "text-green-500",
        bgColor: "bg-green-50",
        id: 5,
      },
      {
        title: "Hoàn thành",
        value: counts.completed,
        icon: CheckCircle,
        color: "text-purple-500",
        bgColor: "bg-purple-50",
      },
    ];
  }, [getServiceTypeCounts]);

  const filterAppointments = useCallback((appointmentList, searchTerm) => {
    if (!searchTerm) return appointmentList;
    const lowerSearch = searchTerm.toLowerCase();
    return appointmentList.filter(
      (appointment) =>
        appointment.name?.toLowerCase().includes(lowerSearch) ||
        appointment.patientId?.toString().includes(lowerSearch) ||
        appointment.serviceNames.some((name) =>
          name.toLowerCase().includes(lowerSearch)
        )
    );
  }, []);

  // ... existing code ...
  const handleTestAction = useCallback(
    async (test) => {
      // Nếu test đang ở trạng thái chờ, chuyển sang "in_progress" và mở popup
      if (test.status === "requested") {
        console.log(
          "Starting test processing, opening detail popup for:",
          test
        );

        // 1. Cập nhật UI ngay lập tức (Optimistic Update)
        setSelectedTest({ ...test, status: "in_progress" });

        // 2. Gọi API ở chế độ nền (fire and forget)
        try {
          if (test.requestId) {
            await updateTestRequestStatus(test.requestId, "in_progress");
          } else {
            await updateLabAppointmentStatus(test.id, "in_progress");
          }
          // 3. Tải lại dữ liệu để đảm bảo đồng bộ sau khi API thành công
          refreshAppointments();
        } catch (error) {
          console.error("Lỗi nền khi cập nhật trạng thái:", error);
          // Optional: Có thể thêm toast notification ở đây để thông báo lỗi
          // Nếu lỗi, lần refresh tiếp theo sẽ tự động sửa lại trạng thái đúng
        }
      } else {
        // Nếu test đang xử lý hoặc đã hoàn thành, chỉ mở popup
        setSelectedTest(test);
      }
    },
    [updateTestRequestStatus, updateLabAppointmentStatus, refreshAppointments]
  );

  const handleCompleteTest = useCallback(
    async (test, testResults, notes) => {
      console.log("Completing test:", test);

      // 1. Đóng popup ngay lập tức
      setSelectedTest(null);

      try {
        if (!user?.id) {
          throw new Error("Không tìm thấy ID nhân viên xét nghiệm.");
        }

        // 2. Tạo payload để lưu kết quả
        const payload = {
          request_id: test.requestId || null,
          appointment_id: test.id,
          created_by_id: user.id,
          test_datetime: new Date().toISOString(),
          notes,
          test_results: testResults.map((result) => ({
            test_type_id: result.tt_id,
            result_value: result.result_value,
            unit: result.tt_unit || "",
            reference_range: result.reference_range || "",
          })),
        };

        // 3. Gọi API để LƯU KẾT QUẢ
        const saveResult = await saveTestResults(payload);
        if (!saveResult.success) {
          throw new Error(saveResult.error);
        }

        // 4. Gọi API để CẬP NHẬT TRẠNG THÁI
        if (test.source === "doctor_request") {
          await updateTestRequestStatus(test.requestId, "completed");
        } else {
          await updateLabAppointmentStatus(test.id, "completed");
        }

        // 5. Tải lại toàn bộ danh sách để đồng bộ hóa giao diện
        refreshAppointments();
        // Optional: Hiển thị thông báo thành công ở đây
      } catch (error) {
        console.error("Lỗi khi hoàn thành xét nghiệm:", error);
        alert(`Lỗi khi hoàn thành xét nghiệm: ${error.message}`);
        // Nếu có lỗi, gọi refresh để giao diện quay về trạng thái đúng
        refreshAppointments();
      }
    },
    [
      saveTestResults,
      updateTestRequestStatus,
      updateLabAppointmentStatus,
      user,
      refreshAppointments,
    ]
  );

  const handleSearchChange = (value) => {
    setSearch(value);
  };

  return (
    <div className="min-h-screen bg-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Dashboard Nhân viên Xét nghiệm
          </h1>
          <p className="text-gray-600">
            Quản lý mẫu xét nghiệm từ bác sĩ chỉ định và đăng ký xét nghiệm
          </p>
        </div>
        <GenericStatsCards stats={stats} />
        <FilterBar
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          search={search}
          onSearchChange={handleSearchChange}
          formattedDate={selectedDate}
        />
        {loading ? (
          <LoadingSpinner
            message={`Đang tải dữ liệu cho ngày ${formatDateVietnamese(
              selectedDate
            )}...`}
          />
        ) : error ? (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">
              Có lỗi xảy ra khi tải dữ liệu: {error}
            </p>
            <button
              onClick={refreshAppointments}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg"
            >
              Thử lại
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <TestQueueColumn
              type={TEST_STATUS.REQUESTED}
              title="Chờ xử lý"
              count={filterAppointments(appointments.requested, search).length}
              tests={filterAppointments(appointments.requested, search)}
              onTestAction={handleTestAction}
            />
            <TestQueueColumn
              type={TEST_STATUS.IN_PROGRESS}
              title="Đang xử lý"
              count={filterAppointments(appointments.inProgress, search).length}
              tests={filterAppointments(appointments.inProgress, search)}
              onTestAction={handleTestAction}
            />
            <TestQueueColumn
              type={TEST_STATUS.COMPLETED}
              title="Hoàn thành"
              count={filterAppointments(appointments.completed, search).length}
              tests={filterAppointments(appointments.completed, search)}
              // onTestAction={handleTestAction}
            />
          </div>
        )}
        {selectedTest && (
          <TestDetailPopup
            test={selectedTest}
            onClose={() => setSelectedTest(null)}
            onCompleteTest={handleCompleteTest}
          />
        )}
        <div className="h-12" />
      </div>
    </div>
  );
};

export default LabStaffDashboard;
