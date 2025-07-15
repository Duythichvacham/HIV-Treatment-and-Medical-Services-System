import React from "react";
import PropTypes from "prop-types";

/**
 * Component bảng hiển thị danh sách người dùng
 * @param {object} props - Props của component
 * @param {Array} props.users - Mảng dữ liệu người dùng
 * @param {Function} props.onStatusChange - Hàm callback khi thay đổi trạng thái người dùng
 */
const UserTable = ({ users, onStatusChange }) => {
  // Get role badge style based on role
  const getRoleBadgeStyle = (role) => {
    const roleStyles = {
      "Bác sĩ": "bg-blue-100 text-blue-800",
      "Bệnh nhân": "bg-gray-100 text-gray-800",
      "Nhân viên xét nghiệm": "bg-purple-100 text-purple-800",
      "Nhân viên tiếp nhận": "bg-yellow-100 text-yellow-800",
      "Quản lý": "bg-red-100 text-red-800",
    };
    return roleStyles[role] || "bg-gray-100 text-gray-800";
  };

  // Get status badge style
  const getStatusBadgeStyle = (status) => {
    return status === "active"
      ? "bg-green-100 text-green-800"
      : "bg-gray-100 text-gray-600";
  };

  // Get status label
  const getStatusLabel = (status) => {
    return status === "active" ? "Hoạt động" : "Không hoạt động";
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Username
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Email
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Vai trò
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Trạng thái
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ngày tạo
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Hành động
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {user.username}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {user.email}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeStyle(
                    user.role
                  )}`}
                >
                  {user.role}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeStyle(
                    user.status
                  )}`}
                >
                  {getStatusLabel(user.status)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {user.createdAt}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center space-x-2">
                  {/* Toggle Switch */}
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={user.status === "active"}
                      onChange={(e) =>
                        onStatusChange(
                          user.id,
                          e.target.checked ? "active" : "inactive"
                        )
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                  <span className="text-xs text-gray-500">
                    {user.status === "active" ? "Hoạt động" : "Vô hiệu hóa"}
                  </span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

UserTable.propTypes = {
  users: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      username: PropTypes.string.isRequired,
      email: PropTypes.string.isRequired,
      role: PropTypes.string.isRequired,
      status: PropTypes.string.isRequired,
      createdAt: PropTypes.string.isRequired,
    })
  ).isRequired,
  onStatusChange: PropTypes.func.isRequired,
};

export default UserTable;
