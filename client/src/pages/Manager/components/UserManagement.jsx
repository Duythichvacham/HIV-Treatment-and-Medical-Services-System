// File: client/src/pages/Manager/components/UserManagement.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Plus, Search } from "lucide-react";
import UserTable from "./UserTable";
import Pagination from "../../../components/common/Pagination";
import usePagination from "../../../hooks/usePagination";
import { getUsers } from "../../../services/api";

const roleMap = {
  Patient: "Bệnh nhân",
  Doctor: "Bác sĩ",
  "Lab-Staff": "Nhân viên xét nghiệm",
  "Registration-staff": "Nhân viên tiếp nhận",
  Manager: "Quản lý",
};

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
    resetToFirstPage,
  } = usePagination(filteredUsers, 5);

  useEffect(() => {
    resetToFirstPage();
  }, []);

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

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 rounded w-full"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={fetchUsers}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Quản lý người dùng
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {totalItems > 0
                ? `Hiển thị ${totalItems} người dùng ${
                    searchTerm || selectedRole !== "all" ? "(đã lọc)" : ""
                  }`
                : "Không có dữ liệu người dùng"}
            </p>
          </div>
          <button
            onClick={handleAddUser}
            className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> Thêm người dùng
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Tìm kiếm theo username hoặc email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          <div className="sm:w-48">
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="all">Tất cả vai trò</option>
              {Object.entries(roleMap).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-hidden">
        {currentUsers.length === 0 ? (
          <div className="text-center py-12 px-6">
            <p className="text-gray-500">
              {searchTerm || selectedRole !== "all"
                ? "Không tìm thấy người dùng phù hợp với bộ lọc"
                : "Không có dữ liệu người dùng"}
            </p>
            {(searchTerm || selectedRole !== "all") && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedRole("all");
                }}
                className="mt-2 text-blue-600 hover:text-blue-500 text-sm"
              >
                Xóa bộ lọc
              </button>
            )}
          </div>
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
