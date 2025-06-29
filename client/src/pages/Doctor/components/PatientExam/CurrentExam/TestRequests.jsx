import React, { useState } from "react";
import { TestTube, Plus, X, AlertCircle, CheckCircle } from "lucide-react";

const TestRequests = ({
  selectedTests,
  availableTests,
  ongoingTests,
  onAddTest,
  onRemoveTest,
  readOnly = false,
}) => {
  const [showTestSelector, setShowTestSelector] = useState(false);

  const getTestById = (testId) => {
    return availableTests.find((test) => test.service_id === testId);
  };

  const isTestOngoing = (testId) => {
    return ongoingTests.some((test) => test.service_id === testId);
  };

  const handleAddTest = (testId) => {
    const success = onAddTest(testId);
    if (success) {
      setShowTestSelector(false);
    }
  };

  const availableTestsToShow = availableTests.filter(
    (test) =>
      !selectedTests.includes(test.service_id) &&
      !isTestOngoing(test.service_id)
  );

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <TestTube className="w-5 h-5 text-blue-500" />
          Chỉ định xét nghiệm
        </h3>

        {!readOnly && (
          <button
            onClick={() => setShowTestSelector(!showTestSelector)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Thêm xét nghiệm
          </button>
        )}
      </div>

      {/* Ongoing Tests Warning */}
      {ongoingTests.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-yellow-800">
                Xét nghiệm đang thực hiện
              </h4>
              <p className="text-sm text-yellow-700 mt-1">
                Bệnh nhân hiện đang có các xét nghiệm chưa hoàn thành:
              </p>
              <ul className="mt-2 space-y-1">
                {ongoingTests.map((test, index) => (
                  <li key={index} className="text-sm text-yellow-700">
                    • {test.name} - {test.status}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Selected Tests */}
      {selectedTests.length > 0 ? (
        <div className="space-y-3">
          {selectedTests.map((testId) => {
            const test = getTestById(testId);
            if (!test) return null;

            return (
              <div
                key={testId}
                className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-800">{test.name}</p>
                    {test.description && (
                      <p className="text-sm text-green-600">
                        {test.description}
                      </p>
                    )}
                    <p className="text-sm text-green-600 font-medium">
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(test.price)}
                    </p>
                  </div>
                </div>

                {!readOnly && (
                  <button
                    onClick={() => onRemoveTest(testId)}
                    className="p-1 text-red-500 hover:text-red-700 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center text-gray-500 py-8">
          <TestTube className="w-12 h-12 text-gray-300 mx-auto mb-2" />
          <p>Chưa có chỉ định xét nghiệm nào được thêm</p>
        </div>
      )}

      {/* Test Selector Modal */}
      {showTestSelector && !readOnly && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Chọn xét nghiệm</h3>
              <button
                onClick={() => setShowTestSelector(false)}
                className="p-2 text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {availableTestsToShow.length > 0 ? (
                availableTestsToShow.map((test) => (
                  <div
                    key={test.service_id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleAddTest(test.service_id)}
                  >
                    <div>
                      <p className="font-medium text-gray-900">{test.name}</p>
                      {test.description && (
                        <p className="text-sm text-gray-600">
                          {test.description}
                        </p>
                      )}
                      {test.price && (
                        <p className="text-sm text-blue-600 font-medium">
                          {new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(test.price)}
                        </p>
                      )}
                    </div>
                    <Plus className="w-5 h-5 text-blue-500" />
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <p>Không có xét nghiệm nào khả dụng</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestRequests;
