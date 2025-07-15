import React, { useState, useEffect } from "react";
import {
  TestTube,
  Plus,
  X,
  AlertCircle,
  CheckCircle,
  Edit3,
  Calendar,
} from "lucide-react";
import { testRequestApi } from "../../../services/testRequestApi";

const IndependentTestRequests = ({
  patientId,
  appointmentId,
  readOnly = false,
}) => {
  const [testTypes, setTestTypes] = useState([]);
  const [existingTestRequests, setExistingTestRequests] = useState([]);
  const [showTestSelector, setShowTestSelector] = useState(false);
  const [selectedTestType, setSelectedTestType] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [notes, setNotes] = useState("");
  const [urgency, setUrgency] = useState("normal");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load test types and existing test requests
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log(
          "[IndependentTestRequests] Loading data for patient:",
          patientId
        );

        const [testTypesData, existingRequestsData] = await Promise.all([
          testRequestApi.getTestTypes(),
          patientId
            ? testRequestApi.getTestRequestsByPatient(patientId)
            : Promise.resolve({ data: [] }),
        ]);

        const processedTestTypes = testTypesData.data || testTypesData || [];
        const processedRequests =
          existingRequestsData.data || existingRequestsData || [];

        setTestTypes(processedTestTypes);
        setExistingTestRequests(processedRequests);
      } catch (err) {
        console.error("Error loading test data:", err);
        setError(`Không thể tải dữ liệu xét nghiệm: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (patientId) {
      loadData();
    }
  }, [patientId]);

  const handleShowTestSelector = () => {
    setShowTestSelector(true);
    setSelectedTestType(null);
    setSelectedService(null);
    setNotes("");
    setUrgency("normal");
    setError(null);
  };

  const handleSelectTestType = (testType) => {
    setSelectedTestType(testType);
    setSelectedService(null);
  };

  const handleSelectService = (service) => {
    setSelectedService(service);
  };

  const handleCreateTestRequest = async () => {
    if (!selectedService) {
      setError("Vui lòng chọn dịch vụ xét nghiệm");
      return;
    }

    if (!appointmentId) {
      setError("Không tìm thấy thông tin appointment");
      return;
    }

    try {
      setLoading(true);

      const testRequestData = {
        service_id: selectedService.service_id,
        notes,
      };

      await testRequestApi.createTestRequest(appointmentId, testRequestData);

      // Reload existing test requests
      if (patientId) {
        const updatedRequests = await testRequestApi.getTestRequestsByPatient(
          patientId
        );
        setExistingTestRequests(updatedRequests.data || []);
      }

      // Close modal
      setShowTestSelector(false);
      setError(null);
    } catch (err) {
      console.error("Error creating test request:", err);
      setError("Có lỗi xảy ra khi tạo chỉ định xét nghiệm");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "in_progress":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "completed":
        return "text-green-600 bg-green-50 border-green-200";
      case "cancelled":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "pending":
        return "Chờ thực hiện";
      case "in_progress":
        return "Đang thực hiện";
      case "completed":
        return "Hoàn thành";
      case "cancelled":
        return "Đã hủy";
      default:
        return status;
    }
  };

  if (loading && existingTestRequests.length === 0) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-600">Đang tải...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <TestTube className="w-5 h-5 text-blue-500" />
          Chỉ định xét nghiệm
        </h3>

        {!readOnly && (
          <button
            onClick={handleShowTestSelector}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            Thêm chỉ định
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        </div>
      )}

      {/* Existing Test Requests */}
      {existingTestRequests.length > 0 ? (
        <div className="space-y-3">
          {existingTestRequests.map((request) => (
            <div
              key={request.request_id}
              className="border border-gray-200 rounded-lg p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">
                      Ngày chỉ định: {formatDate(request.request_date)}
                    </p>
                    <p className="text-sm text-gray-600">
                      Bác sĩ: {request.doctor_name}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(
                    request.status
                  )}`}
                >
                  {getStatusText(request.status)}
                </span>
              </div>

              {/* Test Details */}
              <div className="space-y-2 mb-3">
                {request.details.map((detail) => (
                  <div
                    key={detail.detail_id}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {detail.service_name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {detail.test_type_name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-blue-600">
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(detail.price)}
                      </p>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                          detail.status
                        )}`}
                      >
                        {getStatusText(detail.status)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Notes */}
              {request.notes && (
                <div className="bg-blue-50 border border-blue-200 rounded p-3">
                  <div className="flex items-start gap-2">
                    <Edit3 className="w-4 h-4 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-800">
                        Ghi chú:
                      </p>
                      <p className="text-sm text-blue-700">{request.notes}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 py-8">
          <TestTube className="w-12 h-12 text-gray-300 mx-auto mb-2" />
          <p>Chưa có chỉ định xét nghiệm nào</p>
        </div>
      )}

      {/* Test Selector Modal */}
      {showTestSelector && !readOnly && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Tạo chỉ định xét nghiệm</h3>
              <button
                onClick={() => setShowTestSelector(false)}
                className="p-2 text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <span className="text-sm text-red-700">{error}</span>
                </div>
              </div>
            )}

            {/* Step 1: Select Test Type */}
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-3">
                1. Chọn loại xét nghiệm:
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {testTypes.map((testType) => (
                  <div
                    key={testType.test_type_id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedTestType?.test_type_id === testType.test_type_id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                    onClick={() => handleSelectTestType(testType)}
                  >
                    <p className="font-medium text-gray-900">
                      {testType.test_type_name}
                    </p>
                    {testType.unit && (
                      <p className="text-sm text-gray-600 mt-1">
                        Đơn vị: {testType.unit} | Giá trị bình thường:{" "}
                        {testType.normal_range}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {testType.services?.length || 0} dịch vụ khả dụng
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Step 2: Select Service */}
            {selectedTestType && (
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">
                  2. Chọn dịch vụ cụ thể:
                </h4>
                <div className="space-y-2">
                  {selectedTestType.services.map((service) => (
                    <div
                      key={service.service_id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedService?.service_id === service.service_id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                      onClick={() => handleSelectService(service)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">
                            {service.service_name}
                          </p>
                          {service.description && (
                            <p className="text-sm text-gray-600">
                              {service.description}
                            </p>
                          )}
                        </div>
                        <p className="text-sm font-medium text-blue-600">
                          {new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(service.price)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Notes and Urgency */}
            {selectedService && (
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">
                  3. Thông tin bổ sung:
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ghi chú:
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows="3"
                      placeholder="Nhập ghi chú cho chỉ định xét nghiệm..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mức độ ưu tiên:
                    </label>
                    <select
                      value={urgency}
                      onChange={(e) => setUrgency(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="normal">Bình thường</option>
                      <option value="urgent">Khẩn cấp</option>
                      <option value="stat">Cấp cứu</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowTestSelector(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleCreateTestRequest}
                disabled={!selectedService || loading}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Đang tạo..." : "Tạo chỉ định"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IndependentTestRequests;
