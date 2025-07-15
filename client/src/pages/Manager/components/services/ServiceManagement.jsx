// File: client/src/pages/Manager/components/ServiceManagement.jsx
import React, { useState, useEffect } from "react";
import LoadingSpinner from "../../../../components/common/LoadingSpinner";
import ErrorAlert from "../../../../components/common/ErrorAlert";
import TableHeader from "../../../../components/common/TableHeader";
import EmptyState from "../../../../components/common/EmptyState";
import Modal from "../../../../components/common/Modal";
import ServiceForm from "./ServiceForm";
import ServiceTable from "./ServiceTable";
import {
  getManagerServices,
  createManagerService,
  toggleManagerService,
} from "../../../../services/api";

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

  // Get service type label in Vietnamese
  const getServiceTypeLabel = (serviceType) => {
    const typeMap = {
      consultation: "Tư vấn",
      test: "Xét nghiệm",
      examination: "Khám bệnh",
    };
    return typeMap[serviceType] || serviceType;
  };

  // Format price for display
  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN").format(price) + " đ";
  };

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

  const handleEditService = (service) => {
    // Edit functionality can be implemented later
    console.log("Edit service:", service);
  };

  useEffect(() => {
    fetchServices();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border">
        <LoadingSpinner
          message="Đang tải danh sách dịch vụ..."
          variant="inline"
          size="md"
        />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <TableHeader
        title="Quản lý dịch vụ"
        onAdd={() => setShowAddModal(true)}
        addButtonText="Thêm dịch vụ"
      />

      <ErrorAlert error={error} className="mx-6 mt-4" />

      {services.length === 0 ? (
        <EmptyState message="Chưa có dịch vụ nào được tạo" />
      ) : (
        <ServiceTable
          services={services}
          onEdit={handleEditService}
          onToggle={handleToggleService}
          getServiceTypeLabel={getServiceTypeLabel}
          formatPrice={formatPrice}
        />
      )}

      <Modal
        isOpen={showAddModal}
        title="Thêm dịch vụ mới"
        onClose={() => setShowAddModal(false)}
      >
        <ServiceForm
          formData={formData}
          onFormDataChange={setFormData}
          onSubmit={handleCreateService}
          isSubmitting={isSubmitting}
          onCancel={() => setShowAddModal(false)}
          serviceTypes={serviceTypes}
        />
      </Modal>
    </div>
  );
};

export default ServiceManagement;
