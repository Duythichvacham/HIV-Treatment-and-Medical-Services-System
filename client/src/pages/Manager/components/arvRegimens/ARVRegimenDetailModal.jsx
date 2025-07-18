import React from "react";
import { Eye, X, Package, Users, Activity } from "lucide-react";

const ARVRegimenDetailModal = ({ isOpen, regimen, onClose }) => {
  if (!isOpen || !regimen) return null;

  // Parse components into individual drugs
  const getDrugsFromComponents = (components) => {
    if (!components) return [];

    return components.split("+").map((drug, index) => {
      const trimmed = drug.trim();
      // Try to extract drug name and dosage
      const match = trimmed.match(/^(.+?)\s+(\d+mg)$/);
      if (match) {
        return {
          id: index,
          name: match[1].trim(),
          dosage: match[2],
          fullText: trimmed,
        };
      }
      return {
        id: index,
        name: trimmed,
        dosage: "",
        fullText: trimmed,
      };
    });
  };

  const drugs = getDrugsFromComponents(regimen.components);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-blue-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Chi tiết phác đồ ARV
              </h3>
              <p className="text-sm text-gray-600">
                Thông tin chi tiết về phác đồ điều trị
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên phác đồ
                </label>
                <div className="p-3 bg-gray-50 rounded-lg border">
                  <p className="font-semibold text-blue-600">{regimen.name}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nhóm đối tượng
                </label>
                <div className="p-3 bg-gray-50 rounded-lg border flex items-center space-x-2">
                  <Users className="w-4 h-4 text-gray-600" />
                  <p>{regimen.for_group || "Chưa xác định"}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Trạng thái
                </label>
                <div className="p-3 bg-gray-50 rounded-lg border flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-gray-600" />
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      regimen.is_active
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {regimen.is_active ? "Đang hoạt động" : "Tạm dừng"}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ID phác đồ
                </label>
                <div className="p-3 bg-gray-50 rounded-lg border">
                  <p className="font-mono text-sm">#{regimen.arv_regimen_id}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Drug Components */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Thành phần thuốc ({drugs.length} loại)
            </label>
            <div className="bg-gray-50 rounded-lg border p-4">
              <div className="space-y-3">
                {drugs.map((drug, index) => (
                  <div
                    key={drug.id}
                    className="bg-white rounded-lg border p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-sm font-semibold text-blue-600">
                          {index + 1}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{drug.name}</p>
                        {drug.dosage && (
                          <p className="text-sm text-blue-600 font-medium">
                            Liều lượng: {drug.dosage}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">
                        Thành phần {index + 1}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Raw Components Display */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Thành phần đầy đủ
            </label>
            <div className="p-4 bg-gray-50 rounded-lg border">
              <p className="text-sm text-gray-700 font-mono leading-relaxed">
                {regimen.components}
              </p>
            </div>
          </div>

          {/* Usage Guidelines */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-2 flex items-center">
              <Activity className="w-4 h-4 mr-2" />
              Hướng dẫn sử dụng
            </h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Tuân thủ đúng liều lượng và thời gian dùng thuốc</li>
              <li>
                • Không tự ý thay đổi hoặc ngừng thuốc khi chưa có chỉ định
              </li>
              <li>• Thông báo ngay cho bác sĩ nếu có tác dụng phụ</li>
              <li>• Tái khám định kỳ theo lịch hẹn</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ARVRegimenDetailModal;
