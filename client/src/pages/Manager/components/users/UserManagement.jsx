// File: client/src/pages/Manager/components/UserManagement.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import UserTable from "./UserTable";
import Pagination from "../../../../components/common/Pagination";
import ErrorAlert from "../../../../components/common/ErrorAlert";
import TableHeader from "../../../../components/common/TableHeader";
import SearchAndFilter from "../../../../components/common/SearchAndFilter";
import EmptyState from "../../../../components/common/EmptyState";
import LoadingSpinner from "../../../../components/common/LoadingSpinner";
import usePagination from "../../../../hooks/usePagination";
import { getUsers } from "../../../../services/api";

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
    alert("Chức năng thêm người dùng đang được phát triển");
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
    </div>
  );
};

export default UserManagement;
