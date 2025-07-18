import React, { useState } from "react";
import {
  Calendar,
  User,
  Building,
  Plus,
  Edit,
  CheckCircle,
  XCircle,
  CalendarDays,
  CalendarClock,
  Ban,
} from "lucide-react";
import { useWorkingShifts } from "../../../../hooks/manager/useWorkingShifts";
import LoadingSpinner from "../../../../components/common/LoadingSpinner";
import StatsCard from "../../../../components/common/StatsCard";
import SearchAndFilter from "../../../../components/common/SearchAndFilter";
import EmptyState from "../../../../components/common/EmptyState";
import CreateShiftModal from "./CreateShiftModal";
import EditShiftModal from "./EditShiftModal";

const WorkingShiftManagement = () => {
  const {
    doctors,
    rooms,
    loading,
    actionLoading,
    error,
    createShift,
    updateShift,
    getShiftStats,
    getDoctorName,
    getRoomName,
    filterShifts,
    isShiftCompleted,
  } = useWorkingShifts();

  // UI State
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingShift, setEditingShift] = useState(null);
  const [filters, setFilters] = useState({
    status: undefined, // undefined = all, "approved", "cancelled"
    doctorId: null,
    startDate: "",
    endDate: "",
  });

  const stats = getShiftStats();
  const filteredShifts = filterShifts(searchTerm, filters);

  // Handle create shift
  const handleCreateShift = async (shiftData) => {
    const result = await createShift(shiftData);
    if (result.success) {
      setShowCreateModal(false);
      // Success notification will be handled by the modal
    }
    return result;
  };

  // Handle edit shift
  const handleEditShift = async (shiftData) => {
    const result = await updateShift(editingShift.shift_id, shiftData);
    if (result.success) {
      setEditingShift(null);
    }
    return result;
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "Chưa xác định";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("vi-VN", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "Ngày không hợp lệ";
    }
  };

  if (loading) {
    return <LoadingSpinner message="Đang tải dữ liệu ca làm việc..." />;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Quản lý Lịch làm việc
            </h2>
            <p className="text-gray-600 mt-1">
              Phân ca làm việc cho bác sĩ và quản lý lịch trình
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            disabled={actionLoading}
          >
            <Plus className="w-4 h-4" />
            Thêm ca làm việc
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatsCard
            title="Tổng số ca"
            value={stats.total}
            icon={<Calendar className="w-6 h-6" />}
            iconColor="text-blue-600"
            iconBg="bg-blue-50"
          />
          <StatsCard
            title="Ca sắp tới"
            value={stats.upcoming}
            icon={<CalendarClock className="w-6 h-6" />}
            iconColor="text-green-600"
            iconBg="bg-green-50"
          />
          <StatsCard
            title="Ca hôm nay"
            value={stats.today}
            icon={<CalendarDays className="w-6 h-6" />}
            iconColor="text-yellow-600"
            iconBg="bg-yellow-50"
          />
          <StatsCard
            title="Ca đã hủy"
            value={stats.cancelled}
            icon={<Ban className="w-6 h-6" />}
            iconColor="text-red-600"
            iconBg="bg-red-50"
          />
        </div>

        {/* Search and Filters */}
        <SearchAndFilter
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Tìm kiếm theo tên bác sĩ hoặc phòng..."
          filterValue={filters.status === undefined ? "all" : filters.status}
          onFilterChange={(value) => {
            setFilters((prev) => ({
              ...prev,
              status: value === "all" ? undefined : value,
            }));
          }}
          filterOptions={[
            { value: "approved", label: "Đã duyệt" },
            { value: "cancelled", label: "Đã hủy" },
          ]}
          filterLabel="Tất cả trạng thái"
          className="mb-4"
        />
      </div>

      {/* Error Display */}
      {error && (
        <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Working Shifts Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Bác sĩ
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ngày làm việc
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Phòng
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ngày tạo
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredShifts.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <EmptyState
                    message={
                      searchTerm || filters.status !== undefined
                        ? "Không tìm thấy ca làm việc nào phù hợp"
                        : "Chưa có ca làm việc nào được tạo"
                    }
                    showClearFilter={searchTerm || filters.status !== undefined}
                    onClearFilter={() => {
                      setSearchTerm("");
                      setFilters((prev) => ({ ...prev, status: undefined }));
                    }}
                  />
                </td>
              </tr>
            ) : (
              filteredShifts.map((shift) => (
                <tr key={shift.shift_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <User className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {getDoctorName(shift.doctor_id)}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {shift.doctor_id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">
                        {formatDate(shift.shift_date)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Building className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">
                        {getRoomName(shift.room_id)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        shift.status === "approved"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {shift.status === "approved" ? (
                        <>
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Đã duyệt
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3 mr-1" />
                          Đã hủy
                        </>
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(shift.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setEditingShift(shift)}
                        className={`p-1 rounded transition-colors ${
                          isShiftCompleted(shift)
                            ? "text-gray-400 cursor-not-allowed"
                            : "text-blue-600 hover:text-blue-900 hover:bg-blue-50"
                        }`}
                        title={
                          isShiftCompleted(shift)
                            ? "Ca làm việc đã hoàn thành"
                            : "Chỉnh sửa"
                        }
                        disabled={actionLoading || isShiftCompleted(shift)}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateShiftModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateShift}
          doctors={doctors}
          rooms={rooms}
          isLoading={actionLoading}
        />
      )}

      {editingShift && (
        <EditShiftModal
          isOpen={!!editingShift}
          onClose={() => setEditingShift(null)}
          onUpdate={handleEditShift}
          shift={editingShift}
          doctors={doctors}
          rooms={rooms}
          isLoading={actionLoading}
        />
      )}
    </div>
  );
};

export default WorkingShiftManagement;
