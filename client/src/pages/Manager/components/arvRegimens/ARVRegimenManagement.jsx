import React, { useState, useEffect } from "react";
import { Edit2, Eye } from "lucide-react";
import LoadingSpinner from "../../../../components/common/LoadingSpinner";
import ErrorAlert from "../../../../components/common/ErrorAlert";
import ConfirmDialog from "../../../../components/common/ConfirmDialog";
import SearchAndFilter from "../../../../components/common/SearchAndFilter";
import EmptyState from "../../../../components/common/EmptyState";
import Modal from "../../../../components/common/Modal";
import TableHeader from "../../../../components/common/TableHeader";
import Pagination from "../../../../components/common/Pagination";
import StatusBadge from "../../../../components/common/StatusBadge";
import ARVRegimenDetailModal from "./ARVRegimenDetailModal";
import ComponentsPreview from "./ComponentsPreview";
import { arvRegimenManagerApi } from "../../../../services/arvRegimenApi";

const ARVRegimenManagement = () => {
  // State management
  const [regimens, setRegimens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // all, active, inactive
  const [showForm, setShowForm] = useState(false);
  const [editingRegimen, setEditingRegimen] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingRegimen, setDeletingRegimen] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [viewingRegimen, setViewingRegimen] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    for_group: "",
    components: "",
    is_active: true,
  });

  // Form validation errors
  const [formErrors, setFormErrors] = useState({});

  // Fetch regimens
  const fetchRegimens = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await arvRegimenManagerApi.getAll();

      if (response.success && response.data) {
        setRegimens(response.data);
      } else {
        setError("Không thể tải danh sách phác đồ ARV");
      }
    } catch (err) {
      console.error("Error fetching ARV regimens:", err);
      setError("Có lỗi xảy ra khi tải danh sách phác đồ ARV");
    } finally {
      setLoading(false);
    }
  };

  // Initialize
  useEffect(() => {
    fetchRegimens();
  }, []);

  // Filter regimens
  const filteredRegimens = regimens.filter((regimen) => {
    const matchesSearch =
      regimen.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      regimen.components.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (regimen.for_group &&
        regimen.for_group.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "active" && regimen.is_active) ||
      (filterStatus === "inactive" && !regimen.is_active);

    return matchesSearch && matchesFilter;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredRegimens.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRegimens = filteredRegimens.slice(startIndex, endIndex);

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  // Validate form data
  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = "Tên phác đồ là bắt buộc";
    }

    if (!formData.for_group.trim()) {
      errors.for_group = "Nhóm đối tượng là bắt buộc";
    }

    if (!formData.components.trim()) {
      errors.components = "Thành phần thuốc là bắt buộc";
    } else {
      // Simple format validation
      const componentPattern =
        /^[A-Za-z\s]+\s+\d+mg(\s*\+\s*[A-Za-z\s]+\s+\d+mg)*$/;
      if (!componentPattern.test(formData.components.trim())) {
        errors.components =
          "Định dạng không đúng. Ví dụ: Tenofovir 300mg + Lamivudine 300mg";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      return;
    }

    try {
      setActionLoading(true);

      if (editingRegimen) {
        // Update existing regimen
        await arvRegimenManagerApi.update(editingRegimen.arv_regimen_id, {
          name: formData.name,
          for_group: formData.for_group,
          components: formData.components,
        });
      } else {
        // Create new regimen
        await arvRegimenManagerApi.create(formData);
      }

      // Reset form and close
      setFormData({ name: "", for_group: "", components: "", is_active: true });
      setFormErrors({});
      setEditingRegimen(null);
      setShowForm(false);

      // Refresh list
      await fetchRegimens();
    } catch (err) {
      console.error("Error saving regimen:", err);
      setError("Có lỗi xảy ra khi lưu phác đồ");
    } finally {
      setActionLoading(false);
    }
  };

  // Handle edit
  const handleEdit = (regimen) => {
    setEditingRegimen(regimen);
    setFormData({
      name: regimen.name,
      for_group: regimen.for_group || "",
      components: regimen.components,
      is_active: regimen.is_active,
    });
    setFormErrors({}); // Clear any previous errors
    setShowForm(true);
  };

  // Handle view detail
  const handleViewDetail = (regimen) => {
    setViewingRegimen(regimen);
    setShowDetailModal(true);
  };

  // Handle toggle status
  const handleToggleStatus = async (regimen) => {
    try {
      setActionLoading(true);
      await arvRegimenManagerApi.setActive(
        regimen.arv_regimen_id,
        !regimen.is_active
      );
      await fetchRegimens();
    } catch (err) {
      console.error("Error toggling status:", err);
      setError("Có lỗi xảy ra khi thay đổi trạng thái");
    } finally {
      setActionLoading(false);
    }
  };

  // Cancel form
  const cancelForm = () => {
    setFormData({ name: "", for_group: "", components: "", is_active: true });
    setFormErrors({});
    setEditingRegimen(null);
    setShowForm(false);
  };

  if (loading) {
    return <LoadingSpinner message="Đang tải danh sách phác đồ ARV..." />;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Header */}
      <TableHeader
        title="Quản lý Phác đồ ARV"
        subtitle="Quản lý các phác đồ điều trị ARV trong hệ thống"
        onAdd={() => setShowForm(true)}
        addButtonText="Thêm phác đồ"
      >
        <SearchAndFilter
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Tìm kiếm theo tên phác đồ, thành phần, nhóm..."
          filterValue={filterStatus}
          onFilterChange={setFilterStatus}
          filterOptions={[
            { value: "active", label: "Đang hoạt động" },
            { value: "inactive", label: "Không hoạt động" },
          ]}
          filterLabel="Tất cả"
        />
      </TableHeader>

      {/* Error Display */}
      {error && (
        <div className="p-6">
          <ErrorAlert error={error} onRetry={fetchRegimens} />
        </div>
      )}

      {/* Regimens Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tên phác đồ
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thành phần
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nhóm đối tượng
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginatedRegimens.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-0">
                  <EmptyState
                    message={
                      searchTerm
                        ? "Không tìm thấy phác đồ nào"
                        : "Chưa có phác đồ nào"
                    }
                    showClearFilter={!!searchTerm}
                    onClearFilter={() => setSearchTerm("")}
                  />
                </td>
              </tr>
            ) : (
              paginatedRegimens.map((regimen) => (
                <tr key={regimen.arv_regimen_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {regimen.name}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600 max-w-md">
                      {regimen.components}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600">
                      {regimen.for_group || "Chưa xác định"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge
                      status={regimen.is_active ? "active" : "inactive"}
                      onClick={() => handleToggleStatus(regimen)}
                      disabled={actionLoading}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewDetail(regimen)}
                        className="p-1 text-green-600 hover:bg-green-50 rounded"
                        title="Xem chi tiết"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleEdit(regimen)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        title="Chỉnh sửa"
                      >
                        <Edit2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredRegimens.length > itemsPerPage && (
        <div className="px-6 py-4 border-t border-gray-200">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredRegimens.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <Modal
          isOpen={showForm}
          title={
            editingRegimen ? "Chỉnh sửa phác đồ ARV" : "Thêm phác đồ ARV mới"
          }
          size="xl"
        >
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên phác đồ *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  // Clear error when user starts typing
                  if (formErrors.name) {
                    setFormErrors({ ...formErrors, name: "" });
                  }
                }}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  formErrors.name
                    ? "border-red-300 bg-red-50"
                    : "border-gray-300"
                }`}
                placeholder="Ví dụ: TDF/3TC/EFV, TLE600..."
              />
              {formErrors.name && (
                <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Định dạng: Chữ cái, số, dấu gạch ngang (-) và gạch chéo (/)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nhóm đối tượng *
              </label>
              <select
                required
                value={formData.for_group}
                onChange={(e) => {
                  setFormData({ ...formData, for_group: e.target.value });
                  if (formErrors.for_group) {
                    setFormErrors({ ...formErrors, for_group: "" });
                  }
                }}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  formErrors.for_group
                    ? "border-red-300 bg-red-50"
                    : "border-gray-300"
                }`}
              >
                <option value="">-- Chọn nhóm đối tượng --</option>
                <option value="Người lớn">Người lớn</option>
                <option value="Trẻ em">Trẻ em</option>
                <option value="Phụ nữ mang thai">Phụ nữ mang thai</option>
                <option value="Người cao tuổi">Người cao tuổi</option>
                <option value="Bệnh nhân có bệnh lý kèm theo">
                  Bệnh nhân có bệnh lý kèm theo
                </option>
              </select>
              {formErrors.for_group && (
                <p className="mt-1 text-sm text-red-600">
                  {formErrors.for_group}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Thành phần thuốc *
              </label>
              <textarea
                required
                value={formData.components}
                onChange={(e) => {
                  setFormData({ ...formData, components: e.target.value });
                  if (formErrors.components) {
                    setFormErrors({ ...formErrors, components: "" });
                  }
                }}
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  formErrors.components
                    ? "border-red-300 bg-red-50"
                    : "border-gray-300"
                }`}
                placeholder="Tenofovir 300mg + Lamivudine 300mg + Efavirenz 600mg"
              />
              {formErrors.components && (
                <p className="mt-1 text-sm text-red-600">
                  {formErrors.components}
                </p>
              )}
              <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-700">
                  <strong>Định dạng:</strong> TênThuốc LiềuLượng + TênThuốc
                  LiềuLượng
                  <br />
                  <strong>Ví dụ:</strong> Tenofovir 300mg + Lamivudine 300mg +
                  Efavirenz 600mg
                </p>
              </div>

              {/* Components Preview */}
              <ComponentsPreview
                components={formData.components}
                errors={formErrors.components}
              />
            </div>

            {!editingRegimen && (
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) =>
                    setFormData({ ...formData, is_active: e.target.checked })
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="is_active"
                  className="ml-2 text-sm text-gray-700"
                >
                  Kích hoạt phác đồ ngay
                </label>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={cancelForm}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                disabled={actionLoading}
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                {actionLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Đang lưu...</span>
                  </>
                ) : (
                  <span>{editingRegimen ? "Cập nhật" : "Thêm mới"}</span>
                )}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Detail Modal */}
      {showDetailModal && viewingRegimen && (
        <ARVRegimenDetailModal
          isOpen={showDetailModal}
          regimen={viewingRegimen}
          onClose={() => {
            setShowDetailModal(false);
            setViewingRegimen(null);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingRegimen && (
        <ConfirmDialog
          isOpen={showDeleteModal}
          title="Xác nhận xóa phác đồ"
          message={`Bạn có chắc chắn muốn xóa phác đồ "${deletingRegimen.name}"? Hành động này không thể hoàn tác.`}
          confirmText="Xóa"
          cancelText="Hủy"
          type="danger"
          isLoading={actionLoading}
          onConfirm={async () => {
            try {
              setActionLoading(true);
              // Note: Delete API is not implemented in backend yet
              // await arvRegimenManagerApi.delete(deletingRegimen.arv_regimen_id);
              console.log("Delete not implemented yet");
              setShowDeleteModal(false);
              setDeletingRegimen(null);
              await fetchRegimens();
              return { success: true };
            } catch (err) {
              console.error("Error deleting regimen:", err);
              setError("Có lỗi xảy ra khi xóa phác đồ");
              return { success: false };
            } finally {
              setActionLoading(false);
            }
          }}
          onCancel={() => {
            setShowDeleteModal(false);
            setDeletingRegimen(null);
          }}
        />
      )}
    </div>
  );
};

export default ARVRegimenManagement;
