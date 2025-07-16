import React, { useState } from "react";
import { X, Save, User, ClipboardList, CheckCircle } from "lucide-react";

const TestDetailPopup = ({ test, onClose, onCompleteTest }) => {
  const [notes, setNotes] = useState("");
  const [testResults, setTestResults] = useState(
    test.testTypes.map((testType) => ({
      tt_id: testType.tt_id,
      tt_name: testType.tt_name,
      tt_unit: testType.tt_unit,
      reference_range: testType.reference_range,
      result_value: "",
    }))
  );
  const [error, setError] = useState("");

  const handleResultChange = (tt_id, value) => {
    setTestResults((prev) =>
      prev.map((result) =>
        result.tt_id === tt_id ? { ...result, result_value: value } : result
      )
    );
  };

  const validateResults = () => {
    for (const result of testResults) {
      if (!result.result_value) {
        setError(`Vui lòng nhập kết quả cho xét nghiệm: ${result.tt_name}`);
        return false;
      }
      if (
        result.tt_id !== 3 &&
        result.tt_id !== 4 &&
        isNaN(result.result_value)
      ) {
        setError(`Kết quả cho xét nghiệm "${result.tt_name}" phải là số.`);
        return false;
      }
      if (
        (result.tt_id === 3 || result.tt_id === 4) &&
        !["Âm tính", "Dương tính"].includes(result.result_value)
      ) {
        setError(
          `Kết quả cho xét nghiệm "${result.tt_name}" phải là Âm tính hoặc Dương tính.`
        );
        return false;
      }
    }
    setError("");
    return true;
  };

  const handleSubmit = () => {
    if (!validateResults()) {
      return;
    }
    console.log("Submitting test results:", { test, testResults, notes });
    onCompleteTest(test, testResults, notes);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-3xl w-full overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Chi tiết xét nghiệm
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        {/* Patient Info */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6 shadow-sm">
          <div className="flex items-center gap-4">
            <User className="w-6 h-6 text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-800">
              Thông tin bệnh nhân
            </h3>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-gray-700">
            <p>
              <strong>Họ tên:</strong> {test.name}
            </p>
            <p>
              <strong>Mã bệnh nhân:</strong> {test.patientId}
            </p>
            <p>
              <strong>Tuổi:</strong> {test.age}
            </p>
            <p>
              <strong>Giới tính:</strong> {test.gender}
            </p>
            <p>
              <strong>Điện thoại:</strong> {test.phone}
            </p>
            <p>
              <strong>Email:</strong> {test.email}
            </p>
            <p>
              <strong>Địa chỉ:</strong> {test.address}
            </p>
            <p>
              <strong>Trạng thái:</strong>{" "}
              <span
                className={`text-${
                  test.status === "completed" ? "green" : "blue"
                }-500 font-medium`}
              >
                {test.status}
              </span>
            </p>
          </div>
        </div>

        {/* Test Types */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6 shadow-sm">
          <div className="flex items-center gap-4">
            <CheckCircle className="w-6 h-6 text-green-500" />
            <h3 className="text-lg font-semibold text-gray-800">
              Loại xét nghiệm
            </h3>
          </div>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          <div className="mt-4 space-y-4">
            {test.testTypes.map((testType) => (
              <div
                key={testType.tt_id}
                className="grid grid-cols-3 gap-4 items-center border rounded-lg p-4 bg-white shadow-sm"
              >
                <p className="text-sm font-medium">{testType.tt_name}</p>
                {testType.tt_id === 3 || testType.tt_id === 4 ? (
                  <select
                    value={
                      testResults.find((r) => r.tt_id === testType.tt_id)
                        ?.result_value || ""
                    }
                    onChange={(e) =>
                      handleResultChange(testType.tt_id, e.target.value)
                    }
                    className="p-2 border rounded-lg min-w-[150px] max-w-[200px] text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Chọn kết quả</option>
                    <option value="Âm tính">Âm tính</option>
                    <option value="Dương tính">Dương tính</option>
                  </select>
                ) : (
                  <input
                    type="text"
                    value={
                      testResults.find((r) => r.tt_id === testType.tt_id)
                        ?.result_value || ""
                    }
                    onChange={(e) =>
                      handleResultChange(testType.tt_id, e.target.value)
                    }
                    className="p-2 border rounded-lg min-w-[150px] max-w-[200px] text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder={`Tham chiếu: ${
                      testType.reference_range || "N/A"
                    }`}
                  />
                )}
                <span className="text-sm text-gray-600">
                  {testType.tt_unit || "N/A"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
          <label className="block text-sm font-medium">Ghi chú:</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="mt-1 p-2 border rounded-lg w-full text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            rows="4"
            placeholder="Nhập ghi chú (tùy chọn)"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-6">
          {test.status === "in_progress" && (
            <button
              onClick={handleSubmit}
              className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              <Save size={20} className="mr-2" />
              Hoàn thành
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestDetailPopup;
