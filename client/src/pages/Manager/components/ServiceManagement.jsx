// File: client/src/pages/Manager/components/ServiceManagement.jsx
import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, AlertCircle } from "lucide-react";
import LoadingSpinner from "./LoadingSpinner";
import {
  getManagerServices,
  createManagerService,
  toggleManagerService,
} from "../../../services/api";

const ServiceManagement = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    service_type: "consultation",
    description: "",
    price: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Service type options theo database schema
  const serviceTypes = [
    { value: "consultation", label: "Tư vấn" },
    { value: "test", label: "Xét nghiệm" },
    { value: "examination", label: "Khám bệnh" },
  ];

  // Fetch services from API
  const fetchServices = async () => {
    try {
      setLoading(true);
      const data = await getManagerServices();
      setServices(data.data || []);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching services:", err);
    } finally {
      setLoading(false);
    }
  };

  // Create new service
  const handleCreateService = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null); // Clear previous errors

    // Basic validation
    if (!formData.name.trim()) {
      setError("Tên dịch vụ không được để trống");
      setIsSubmitting(false);
      return;
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      setError("Giá dịch vụ phải lớn hơn 0");
      setIsSubmitting(false);
      return;
    }

    try {
      const serviceData = {
        ...formData,
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
      };

      await createManagerService(serviceData);

      // Success
      setShowAddModal(false);
      setFormData({
        name: "",
        service_type: "consultation",
        description: "",
        price: "",
      });
      fetchServices(); // Refresh list
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Có lỗi xảy ra khi tạo dịch vụ";
      setError(errorMessage);
      console.error("Error creating service:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle service active status
  const handleToggleService = async (serviceId, currentStatus) => {
    try {
      setError(null); // Clear previous errors
      await toggleManagerService(serviceId, !currentStatus);
      fetchServices(); // Refresh list
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Có lỗi xảy ra khi cập nhật dịch vụ";
      setError(errorMessage);
      console.error("Error updating service:", err);
    }
  };

  // Format price for display
  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN").format(price) + " đ";
  };

  // Get service type label in Vietnamese
  const getServiceTypeLabel = (serviceType) => {
    const type = serviceTypes.find((t) => t.value === serviceType);
    return type ? type.label : serviceType;
  };

  useEffect(() => {
    fetchServices();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Đang tải danh sách dịch vụ..." />;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">
            Quản lý dịch vụ
          </h3>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Thêm dịch vụ
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Services Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tên dịch vụ
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Loại
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Giá
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mô tả
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {services.map((service) => (
              <tr key={service.service_id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {service.name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {getServiceTypeLabel(service.service_type)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {formatPrice(service.price)}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-500 max-w-xs truncate">
                    {service.description}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        /* Edit functionality can be added later */
                      }}
                      className="inline-flex items-center px-3 py-1 text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                      title="Chỉnh sửa"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Sửa
                    </button>
                    <button
                      onClick={() =>
                        handleToggleService(
                          service.service_id,
                          service.is_active
                        )
                      }
                      className={`inline-flex items-center px-3 py-1 text-sm rounded-lg transition-colors ${
                        service.is_active
                          ? "bg-red-50 text-red-600 hover:bg-red-100"
                          : "bg-green-50 text-green-600 hover:bg-green-100"
                      }`}
                      title={service.is_active ? "Ẩn dịch vụ" : "Hiện dịch vụ"}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      {service.is_active ? "Ẩn" : "Hiện"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {services.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-500">Chưa có dịch vụ nào được tạo</p>
        </div>
      )}

      {/* Add Service Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Thêm dịch vụ mới
              </h3>
            </div>

            <form onSubmit={handleCreateService} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên dịch vụ
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Nhập tên dịch vụ"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Loại dịch vụ
                  </label>
                  <select
                    value={formData.service_type}
                    onChange={(e) =>
                      setFormData({ ...formData, service_type: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {serviceTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Giá (VNĐ)
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="1000"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Nhập giá dịch vụ"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mô tả
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Nhập mô tả dịch vụ"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? "Đang tạo..." : "Tạo dịch vụ"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceManagement;
