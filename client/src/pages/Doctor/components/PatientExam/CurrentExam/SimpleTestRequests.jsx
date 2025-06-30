import React, { useState, useEffect } from "react";
import { TestTube, Plus, Calendar, Clock } from "lucide-react";
import { testRequestApi } from "../../../services/testRequestApi";

const SimpleTestRequests = ({ patientId, appointmentId, readOnly = false }) => {
  const [availableTests, setAvailableTests] = useState([]);
  const [selectedTests, setSelectedTests] = useState([]);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [existingRequests, setExistingRequests] = useState([]);

  // Load available tests và existing requests
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Load available tests (chỉ lấy 3 loại test thực)
        const testsResponse = await testRequestApi.getAvailableTests();
        if (testsResponse.success && testsResponse.data) {
          setAvailableTests(testsResponse.data);
        }

        // Load existing test requests for this patient
        if (patientId) {
          const requestsResponse =
            await testRequestApi.getTestRequestsByPatient(patientId);
          if (requestsResponse.success && requestsResponse.data) {
            setExistingRequests(requestsResponse.data);
          }
        }
      } catch (error) {
        console.error("Error loading test data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [patientId]);

  // Handle test selection
  const handleTestToggle = (testId) => {
    if (readOnly) return;

    setSelectedTests((prev) => {
      if (prev.includes(testId)) {
        return prev.filter((id) => id !== testId);
      } else {
        return [...prev, testId];
      }
    });
  };

  // Helper function to determine actual status based on results
  const getActualStatus = (request) => {
    // Nếu đã có status completed, return completed
    if (request.status === "completed") return "completed";

    // Kiểm tra xem tất cả test trong request có kết quả chưa
    const allTestsHaveResults = request.details.every(
      (detail) => detail.result !== null
    );
    if (allTestsHaveResults) return "completed";

    // Ngược lại return status gốc
    return request.status;
  };

  // Check if can create new test request (all previous requests must be completed)
  const canCreateNewRequest = () => {
    if (existingRequests.length === 0) return true;

    // Check if there are any pending requests
    const hasPendingRequests = existingRequests.some((request) => {
      // Nếu status là completed hoặc có kết quả thì coi như đã hoàn thành
      if (request.status === "completed") return false;

      // Kiểm tra xem tất cả các test trong request có kết quả chưa
      const allTestsHaveResults = request.details.every(
        (detail) => detail.result !== null
      );
      if (allTestsHaveResults) return false;

      // Còn lại là pending
      return request.status === "requested" || request.status === "in_progress";
    });

    return !hasPendingRequests;
  };

  // Handle create test request
  const handleCreateTestRequest = async () => {
    if (!appointmentId || selectedTests.length === 0) {
      alert("Vui lòng chọn ít nhất một loại xét nghiệm");
      return;
    }

    // Check if can create new request
    if (!canCreateNewRequest()) {
      alert(
        "Không thể tạo chỉ định mới khi vẫn còn xét nghiệm đang chờ kết quả. Vui lòng đợi kết quả trước khi chỉ định tiếp."
      );
      return;
    }

    try {
      setLoading(true);

      for (const testId of selectedTests) {
        await testRequestApi.createTestRequest(appointmentId, {
          service_id: testId,
          notes: notes || "Chỉ định từ bác sĩ",
        });
      }

      // Reset form
      setSelectedTests([]);
      setNotes("");

      // Reload existing requests
      const requestsResponse = await testRequestApi.getTestRequestsByPatient(
        patientId
      );
      if (requestsResponse.success && requestsResponse.data) {
        setExistingRequests(requestsResponse.data);
      }

      alert("Tạo chỉ định xét nghiệm thành công!");
    } catch (error) {
      console.error("Error creating test request:", error);
      alert("Có lỗi xảy ra khi tạo chỉ định xét nghiệm");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <TestTube className="w-5 h-5 text-blue-500" />
          Chỉ định xét nghiệm
        </h3>
      </div>

      {/* Available Tests Selection */}
      {!readOnly && canCreateNewRequest() && (
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              1. Chọn loại xét nghiệm:
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {availableTests.map((test) => (
                <div
                  key={test.service_id}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedTests.includes(test.service_id)
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => handleTestToggle(test.service_id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{test.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {test.description}
                      </p>
                      <p className="text-sm font-medium text-blue-600 mt-2">
                        {test.price?.toLocaleString()} đ
                      </p>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedTests.includes(test.service_id)
                          ? "border-blue-500 bg-blue-500"
                          : "border-gray-300"
                      }`}
                    >
                      {selectedTests.includes(test.service_id) && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              2. Ghi chú (tùy chọn):
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ghi chú thêm về yêu cầu xét nghiệm..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows="3"
            />
          </div>

          {/* Create Button */}
          <div className="flex justify-end">
            <button
              onClick={handleCreateTestRequest}
              disabled={
                loading || selectedTests.length === 0 || !canCreateNewRequest()
              }
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Tạo chỉ định
            </button>
          </div>
        </div>
      )}

      {/* Warning when cannot create new request */}
      {!readOnly && !canCreateNewRequest() && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center gap-2 text-yellow-800">
            <TestTube className="w-5 h-5" />
            <span className="font-medium">Chờ kết quả xét nghiệm</span>
          </div>
          <p className="text-sm text-yellow-700 mt-1">
            Không thể tạo chỉ định mới khi vẫn còn xét nghiệm đang chờ kết quả.
            Vui lòng đợi tất cả kết quả trước khi chỉ định tiếp.
          </p>
        </div>
      )}

      {/* Existing Test Requests */}
      {existingRequests.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 mb-3">
            Danh sách chỉ định đã tạo:
          </h4>
          <div className="space-y-3">
            {existingRequests.map((request) => (
              <div
                key={request.request_id}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="font-medium text-gray-900">
                        Ngày chỉ định:{" "}
                        {new Date(request.request_date).toLocaleDateString(
                          "vi-VN",
                          {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          }
                        )}
                      </p>
                      <p className="text-sm text-gray-600">
                        Bác sĩ: {request.doctor_name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-500" />
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        getActualStatus(request) === "requested"
                          ? "bg-yellow-100 text-yellow-800"
                          : getActualStatus(request) === "in_progress"
                          ? "bg-blue-100 text-blue-800"
                          : getActualStatus(request) === "completed"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {getActualStatus(request) === "requested"
                        ? "Đã chỉ định"
                        : getActualStatus(request) === "in_progress"
                        ? "Đang thực hiện"
                        : getActualStatus(request) === "completed"
                        ? "Hoàn thành"
                        : getActualStatus(request)}
                    </span>
                  </div>
                </div>

                {/* Test Details */}
                <div className="mt-3 pl-7">
                  <div className="space-y-2">
                    {request.details.map((detail) => (
                      <div key={detail.detail_id} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-900">
                            {detail.service_name}
                          </span>
                          <span className="text-sm font-medium text-blue-600">
                            {detail.price?.toLocaleString()} đ
                          </span>
                        </div>

                        {/* Show results if completed */}
                        {(getActualStatus(request) === "completed" ||
                          detail.result) && (
                          <div className="bg-green-50 border border-green-200 rounded p-3 mt-2">
                            <h5 className="text-sm font-semibold text-green-800 mb-2">
                              📋 Kết quả xét nghiệm:
                            </h5>
                            <div className="text-sm space-y-1">
                              {/* Hiển thị kết quả thực từ database */}
                              {detail.result ? (
                                <>
                                  <div>
                                    <span className="font-medium text-green-700">
                                      Kết quả:
                                    </span>
                                    <span className="ml-2 text-green-800">
                                      {detail.result.result_value}{" "}
                                      {detail.result.unit}
                                    </span>
                                  </div>
                                  {detail.result.reference_range && (
                                    <div>
                                      <span className="font-medium text-green-700">
                                        Chỉ số bình thường:
                                      </span>
                                      <span className="ml-2 text-green-800">
                                        {detail.result.reference_range}
                                      </span>
                                    </div>
                                  )}
                                  {detail.result.result_date && (
                                    <div>
                                      <span className="font-medium text-green-700">
                                        Ngày có kết quả:
                                      </span>
                                      <span className="ml-2 text-green-800">
                                        {new Date(
                                          detail.result.result_date
                                        ).toLocaleDateString("vi-VN")}
                                      </span>
                                    </div>
                                  )}
                                  {detail.result.result_notes && (
                                    <div>
                                      <span className="font-medium text-green-700">
                                        Ghi chú:
                                      </span>
                                      <span className="ml-2 text-green-800">
                                        {detail.result.result_notes}
                                      </span>
                                    </div>
                                  )}
                                </>
                              ) : (
                                <div className="text-yellow-700">
                                  Kết quả chưa được cập nhật từ phòng xét nghiệm
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  {request.details[0]?.notes && (
                    <div className="mt-2 text-sm text-gray-600">
                      <strong>Ghi chú chỉ định:</strong>{" "}
                      {request.details[0].notes}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {existingRequests.length === 0 && !loading && (
        <div className="text-center py-8 text-gray-500">
          <TestTube className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>Chưa có chỉ định xét nghiệm nào</p>
        </div>
      )}

      {loading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
        </div>
      )}
    </div>
  );
};

export default SimpleTestRequests;
