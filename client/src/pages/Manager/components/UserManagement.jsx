import React, { useState, useEffect, useCallback } from "react";
import { Plus } from "lucide-react";
import UserTable from "./UserTable";
import { getUsers } from "../../../services/api";

/**
 * Component quản lý người dùng
 * Hiển thị danh sách người dùng và các chức năng quản lý
 */
const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Format date to readable string
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString("vi-VN");
    } catch {
      return dateString;
    }
  };

  // Get Vietnamese role label
  const getRoleLabel = (role) => {
    const roleMap = {
      // Database format (capitalize)
      Patient: "Bệnh nhân",
      Doctor: "Bác sĩ",
      "Lab-Staff": "Nhân viên xét nghiệm",
      "Registration-staff": "Nhân viên tiếp nhận",
      Manager: "Quản lý",
      // Backup for lowercase (just in case)
      patient: "Bệnh nhân",
      doctor: "Bác sĩ",
      "lab-staff": "Nhân viên xét nghiệm",
      "registration-staff": "Nhân viên tiếp nhận",
      manager: "Quản lý",
    };
    return roleMap[role] || role || "Chưa xác định";
  };

  // Fetch users data
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getUsers();

      // Transform data to match table format
      const transformedUsers = (response.data || []).map((user, index) => ({
        id: `user-${index}`, // Temporary ID since API doesn't provide ID
        username: user.userName || user.username,
        email: user.email || "N/A",
        role: getRoleLabel(user.role),
        status: user.status || "active",
        createdAt: user.createdAt ? formatDate(user.createdAt) : "N/A",
      }));

      setUsers(transformedUsers);
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

  // Handle status change (placeholder - API chưa có endpoint này)
  const handleStatusChange = async (userId, newStatus) => {
    try {
      // Cập nhật UI ngay lập tức
      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user.id === userId ? { ...user, status: newStatus } : user
        )
      );

      // TODO: Gọi API cập nhật trạng thái khi có endpoint
      // await updateUserStatus(userId, newStatus);

      console.log(`Status change for user ${userId}: ${newStatus}`);
      // Hiển thị thông báo thành công (có thể dùng toast)
    } catch (err) {
      console.error("Error updating user status:", err);
      // Khôi phục trạng thái cũ nếu lỗi
      fetchUsers();
      setError("Cập nhật trạng thái thất bại.");
    }
  };

  // Handle add user (placeholder)
  const handleAddUser = () => {
    // TODO: Mở modal hoặc navigate đến trang thêm user
    console.log("Add user functionality will be implemented");
    alert("Chức năng thêm người dùng đang được phát triển");
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4 w-1/4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded w-full"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchUsers}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Quản lý người dùng
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Tổng cộng {users.length} người dùng
          </p>
        </div>
        <button
          onClick={handleAddUser}
          className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Thêm người dùng
        </button>
      </div>

      {/* User Table */}
      <div className="p-6">
        {users.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Không có dữ liệu người dùng</p>
          </div>
        ) : (
          <UserTable users={users} onStatusChange={handleStatusChange} />
        )}
      </div>
    </div>
  );
};

export default UserManagement;
