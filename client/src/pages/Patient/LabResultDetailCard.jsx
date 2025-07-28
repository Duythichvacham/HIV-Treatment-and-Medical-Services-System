import React from "react";
import { X, FileText, FlaskConical, Calendar, Clipboard } from "lucide-react";

const LabResultDetailCard = ({
  selectedLabResult,
  labResultDetail,
  labResultLoading,
  handleCloseLabResult,
  error,
}) => {
  if (!selectedLabResult) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">
            Kết quả xét nghiệm #{selectedLabResult}
          </h2>
          <button
            onClick={handleCloseLabResult}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {labResultLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">
                Đang tải kết quả xét nghiệm...
              </span>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-red-400 mx-auto mb-2" />
              <p className="text-red-600">{error}</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Lab Test Details */}
              {labResultDetail && labResultDetail.length > 0 ? (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                    <FlaskConical className="h-5 w-5 mr-2" />
                    Thông tin kết quả xét nghiệm
                  </h3>
                  <div className="space-y-4">
                    {labResultDetail.map((result, index) => (
                      <div
                        key={result.result_id || index}
                        className="bg-white rounded-lg p-4 shadow-sm border border-gray-200"
                      >
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <span className="font-medium text-gray-600">
                              Loại xét nghiệm:
                            </span>
                            <p className="text-gray-900">
                              {result.name || "N/A"}
                            </p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">
                              Giá trị kết quả:
                            </span>
                            <p className="text-gray-900">
                              {result.result_value || "N/A"} {result.unit || ""}
                            </p>
                          </div>
                          {/* <div>
                            <span className="font-medium text-gray-600">
                              Khoảng tham chiếu:
                            </span>
                            <p className="text-gray-900">
                              {result.reference_range || "Không có"}
                            </p>
                          </div> */}
                          <div>
                            <span className="font-medium text-gray-600">
                              Ghi chú:
                            </span>
                            <p className="text-gray-900">
                              {result.notes || "Không có"}
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="font-medium text-gray-600">
                              Ngày xét nghiệm:
                            </span>
                            <p className="text-gray-900">
                              {new Date(result.test_datetime).toLocaleString(
                                "vi-VN"
                              )}
                            </p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">
                              Ngày tạo:
                            </span>
                            <p className="text-gray-900">
                              {new Date(result.created_at).toLocaleString(
                                "vi-VN"
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Clipboard className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Không có kết quả xét nghiệm</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {/* <div>${JSON.stringify(labResultDetail, null, 2)}</div> */}
    </div>
  );
};

export default LabResultDetailCard;
