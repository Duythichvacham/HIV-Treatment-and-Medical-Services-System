// File: client/src/pages/Manager/components/UserManagement.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import UserTable from "./UserTable";
import CreateUserModal from "./CreateUserModal";
import Pagination from "../../../../components/common/Pagination";
import ErrorAlert from "../../../../components/common/ErrorAlert";
import TableHeader from "../../../../components/common/TableHeader";
import SearchAndFilter from "../../../../components/common/SearchAndFilter";
import EmptyState from "../../../../components/common/EmptyState";
import LoadingSpinner from "../../../../components/common/LoadingSpinner";
import usePagination from "../../../../hooks/usePagination";
import { getUsers, createUser } from "../../../../services/managerApi";
import { X } from "lucide-react";

const roleMap = {
  Patient: "Bệnh nhân",
  Doctor: "Bác sĩ",
  "Lab-Staff": "Nhân viên xét nghiệm",
  "Registration-staff": "Nhân viên tiếp nhận",
  Manager: "Quản lý",
};

const roleOptions = Object.entries(roleMap).map(([key, label]) => ({
  value: key,
  label,
}));

const getRoleLabel = (role) => roleMap[role] || role || "Chưa xác định";

const formatDate = (dateString) => {
  try {
    return new Date(dateString).toLocaleDateString("vi-VN");
  } catch {
    return dateString;
  }
};

const UserManagement = () => {
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createSuccess, setCreateSuccess] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");

  const filteredUsers = useMemo(() => {
    let filtered = [...allUsers];

    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.username.toLowerCase().includes(lowerTerm) ||
          user.email.toLowerCase().includes(lowerTerm)
      );
    }

    if (selectedRole !== "all") {
      filtered = filtered.filter((user) => user.originalRole === selectedRole);
    }

    return filtered;
  }, [allUsers, searchTerm, selectedRole]);

  const {
    currentPage,
    totalPages,
    totalItems,
    currentData: currentUsers,
    goToPage,
    // resetToFirstPage,
  } = usePagination(filteredUsers, 5);

  // useEffect(() => {
  //   resetToFirstPage();
  // }, []);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getUsers();

      if (!response?.data || !Array.isArray(response.data)) {
        throw new Error("Dữ liệu người dùng không hợp lệ");
      }

      const transformedUsers = response.data.map((user) => ({
        id: user.id || user.userName || user.email,
        username: user.userName || user.username,
        email: user.email || "N/A",
        role: getRoleLabel(user.role),
        originalRole: user.role,
        status: user.status || "active",
        createdAt: user.createdAt ? formatDate(user.createdAt) : "N/A",
      }));

      setAllUsers(transformedUsers);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Không thể tải danh sách người dùng. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Handle create user
  const handleCreateUser = async (userData) => {
    try {
      setIsCreating(true);
      setError(null);

      const response = await createUser(userData);

      if (response.success) {
        setCreateSuccess(`Tạo tài khoản ${userData.role} thành công!`);
        setShowCreateModal(false);

        // Refresh user list
        await fetchUsers();

        // Clear success message after 3 seconds
        setTimeout(() => {
          setCreateSuccess(null);
        }, 3000);
      } else {
        throw new Error(response.message || "Không thể tạo tài khoản");
      }
    } catch (err) {
      console.error("Error creating user:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Không thể tạo tài khoản. Vui lòng thử lại.";
      setError(errorMessage);
    } finally {
      setIsCreating(false);
    }
  };

  const handleStatusChange = async (userId, newStatus) => {
    try {
      setAllUsers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, status: newStatus } : user
        )
      );
      console.log(`Status change for user ${userId}: ${newStatus}`);
    } catch (err) {
      console.error("Error updating user status:", err);
      fetchUsers();
      setError("Cập nhật trạng thái thất bại.");
    }
  };

  const handleAddUser = () => {
    setShowCreateModal(true);
    setError(null);
    setCreateSuccess(null);
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedRole("all");
  };

  const getSubtitle = () => {
    if (totalItems === 0) return "Không có dữ liệu người dùng";
    const filterText = searchTerm || selectedRole !== "all" ? " (đã lọc)" : "";
    return `Hiển thị ${totalItems} người dùng${filterText}`;
  };

  const getEmptyMessage = () => {
    if (searchTerm || selectedRole !== "all") {
      return "Không tìm thấy người dùng phù hợp với bộ lọc";
    }
    return "Không có dữ liệu người dùng";
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border">
        <LoadingSpinner
          message="Đang tải danh sách người dùng..."
          variant="inline"
          size="md"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <ErrorAlert error={error} onRetry={fetchUsers} />
      </div>
    );
  }

  return (
    <div>
      {/* Success Message */}
      {createSuccess && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-green-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">
                {createSuccess}
              </p>
            </div>
            <div className="ml-auto pl-3">
              <div className="-mx-1.5 -my-1.5">
                <button
                  onClick={() => setCreateSuccess(null)}
                  className="inline-flex bg-green-50 rounded-md p-1.5 text-green-500 hover:bg-green-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border">
        <TableHeader
          title="Quản lý người dùng"
          subtitle={getSubtitle()}
          onAdd={handleAddUser}
          addButtonText="Thêm người dùng"
        >
          <SearchAndFilter
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Tìm kiếm theo username hoặc email..."
            filterValue={selectedRole}
            onFilterChange={setSelectedRole}
            filterOptions={roleOptions}
            filterLabel="Tất cả vai trò"
          />
        </TableHeader>

        <div className="overflow-hidden">
          {currentUsers.length === 0 ? (
            <EmptyState
              message={getEmptyMessage()}
              showClearFilter={searchTerm || selectedRole !== "all"}
              onClearFilter={handleClearFilters}
            />
          ) : (
            <>
              <UserTable
                users={currentUsers}
                onStatusChange={handleStatusChange}
              />
              {totalPages > 1 ? (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  itemsPerPage={5}
                  onPageChange={goToPage}
                />
              ) : (
                currentUsers.length > 0 && (
                  <div className="px-6 py-3 text-sm text-gray-600">
                    Hiển thị tất cả {totalItems} kết quả
                  </div>
                )
              )}
            </>
          )}
        </div>

        {/* Create User Modal */}
        <CreateUserModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateUser}
          isSubmitting={isCreating}
        />
      </div>
    </div>
  );
};

export default UserManagement;
