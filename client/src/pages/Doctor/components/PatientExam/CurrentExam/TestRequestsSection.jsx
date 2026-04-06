import React, { useState, useEffect } from "react";
import { TestTube, Plus, Clock, CheckCircle, AlertCircle } from "lucide-react";
// import axios from "axios";
import api from "../../../../../services/api";

const TestRequestsSection = ({ appointmentId, readOnly = false }) => {
  const [testTypes, setTestTypes] = useState([]);
  const [currentRequest, setCurrentRequest] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedTests, setSelectedTests] = useState([]);
  const [notes, setNotes] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Load test types and current request status
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Load available test types
        const testTypesRes = await api.get("VITE_API_API_PREFIX/doctors/test-types");
        if (testTypesRes.data.success) {
          setTestTypes(testTypesRes.data.data);
        }

        // Check current test request status for this appointment
        if (appointmentId) {
          try {
            const currentRequestRes = await api.get(
              `VITE_API_API_PREFIX/doctors/current-test-request/${appointmentId}`
            );
            if (currentRequestRes.data.success) {
              setCurrentRequest(currentRequestRes.data.data);
            }
          } catch (error) {
            // If no current request, that's fine
            if (error.response?.status !== 404) {
              console.error("Error loading current request:", error);
            }
          }
        }
      } catch (error) {
        console.error("Error loading test data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [appointmentId]);

  const handleTestToggle = (testId) => {
    setSelectedTests((prev) =>
      prev.includes(testId)
        ? prev.filter((id) => id !== testId)
        : [...prev, testId]
    );
  };

  const handleNoteChange = (testId, note) => {
    setNotes((prev) => ({
      ...prev,
      [testId]: note,
    }));
  };

  const handleSubmitRequest = async () => {
    if (selectedTests.length === 0) {
      alert("Vui lòng chọn ít nhất một loại xét nghiệm");
      return;
    }

    try {
      setSubmitting(true);

      const requestData = {
        appointment_id: appointmentId,
        service_id: selectedTests,
        notes: notes,
      };

      const response = await api.post(
        "VITE_API_API_PREFIX/doctors/test-requests",
        requestData
      );

      if (response.data.success) {
        alert("Tạo chỉ định xét nghiệm thành công!");
        setShowForm(false);
        setSelectedTests([]);
        setNotes({});
        // Reload data to show new request status
        window.location.reload();
      } else {
        alert("Có lỗi xảy ra: " + response.data.message);
      }
    } catch (error) {
      console.error("Error submitting test request:", error);
      alert("Có lỗi xảy ra khi tạo chỉ định xét nghiệm");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  const canCreateNewRequest =
    !currentRequest || currentRequest.status === "completed";

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-purple-800 flex items-center gap-2">
          <TestTube className="w-5 h-5" />
          Chỉ định xét nghiệm
        </h3>

        {!readOnly && canCreateNewRequest && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Thêm chỉ định
          </button>
        )}
      </div>

      {/* Current Request Status */}
      {currentRequest && (
        <div className="mb-4 p-4 border rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            {currentRequest.status === "requested" ? (
              <>
                <Clock className="w-5 h-5 text-yellow-500" />
                <span className="font-medium text-yellow-700">
                  Đang chờ xét nghiệm
                </span>
              </>
            ) : currentRequest.status === "completed" ? (
              <>
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="font-medium text-green-700">
                  Đã hoàn thành xét nghiệm
                </span>
              </>
            ) : (
              <>
                <AlertCircle className="w-5 h-5 text-blue-500" />
                <span className="font-medium text-blue-700">
                  Trạng thái: {currentRequest.status}
                </span>
              </>
            )}
          </div>
          <p className="text-sm text-gray-600">
            Ngày tạo: {currentRequest.request_date}
          </p>

          {currentRequest.services && (
            <div className="mt-3">
              <p className="text-sm font-medium mb-2">
                Các xét nghiệm đã chỉ định:
              </p>
              <ul className="space-y-1">
                {currentRequest.services.map((service, index) => (
                  <li key={index} className="text-sm text-gray-700">
                    •{" "}
                    {testTypes.find((t) => t.service_id === service.service_id)
                      ?.name || "Xét nghiệm"}
                    {service.notes && ` - ${service.notes}`}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Warning if cannot create new request */}
      {!canCreateNewRequest && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <p className="text-yellow-800 text-sm">
              <span className="font-medium">Không thể tạo chỉ định mới.</span>
              Bệnh nhân đang có chỉ định xét nghiệm chưa hoàn thành.
            </p>
          </div>
        </div>
      )}

      {/* Test Request Form */}
      {showForm && canCreateNewRequest && (
        <div className="border rounded-lg p-4 bg-gray-50">
          <h4 className="font-medium mb-4">Chọn loại xét nghiệm</h4>

          <div className="space-y-3 mb-4">
            {testTypes.map((test) => (
              <div
                key={test.service_id}
                className="border rounded-lg p-3 bg-white"
              >
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedTests.includes(test.service_id)}
                    onChange={() => handleTestToggle(test.service_id)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="font-medium">{test.name}</div>
                    <div className="text-sm text-gray-600">
                      {test.description}
                    </div>
                    <div className="text-sm text-blue-600 font-medium mt-1">
                      {test.price?.toLocaleString("vi-VN")} VNĐ
                    </div>

                    {selectedTests.includes(test.service_id) && (
                      <div className="mt-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Ghi chú:
                        </label>
                        <textarea
                          value={notes[test.service_id] || ""}
                          onChange={(e) =>
                            handleNoteChange(test.service_id, e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                          rows={2}
                          placeholder="Nhập ghi chú cho xét nghiệm này..."
                        />
                      </div>
                    )}
                  </div>
                </label>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSubmitRequest}
              disabled={submitting || selectedTests.length === 0}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? "Đang tạo..." : "Tạo chỉ định"}
            </button>
            <button
              onClick={() => {
                setShowForm(false);
                setSelectedTests([]);
                setNotes({});
              }}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Hủy
            </button>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!currentRequest && !showForm && (
        <div className="text-center py-8 text-gray-500">
          <TestTube className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p className="font-medium mb-1">Chưa có chỉ định xét nghiệm</p>
          <p className="text-sm">
            Nhấn "Thêm chỉ định" để tạo chỉ định xét nghiệm mới
          </p>
        </div>
      )}
    </div>
  );
};

export default TestRequestsSection;
