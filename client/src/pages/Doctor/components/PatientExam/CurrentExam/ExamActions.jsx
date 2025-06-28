import React from "react";
import { Save, CheckCircle, ArrowLeft, Loader } from "lucide-react";

const ExamActions = ({
  onSave,
  onComplete,
  onBack,
  saving = false,
  canComplete = true,
  readOnly = false,
}) => {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="w-full sm:w-auto px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại Dashboard
        </button>

        {/* Action Buttons */}
        {!readOnly && (
          <div className="flex flex-col gap-3 w-full sm:w-auto">
            {/* Validation Message */}
            {!canComplete && (
              <div className="text-sm text-orange-600 bg-orange-50 px-3 py-2 rounded-lg border border-orange-200">
                ⚠️ Để hoàn thành khám: cần nhập chẩn đoán và ít nhất một chỉ số
                sinh hiệu
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              {/* Save Draft Button */}
              <button
                onClick={onSave}
                disabled={saving}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300 transition-colors flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Lưu tạm
                  </>
                )}
              </button>

              {/* Complete Button */}
              <button
                onClick={onComplete}
                disabled={saving || !canComplete}
                className={`px-6 py-3 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                  canComplete
                    ? "bg-green-500 text-white hover:bg-green-600 disabled:bg-green-300"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
                title={
                  !canComplete
                    ? "Vui lòng nhập chẩn đoán và ít nhất một chỉ số sinh hiệu"
                    : "Hoàn thành khám bệnh"
                }
              >
                {saving ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Hoàn thành khám
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      {!readOnly && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Save className="w-4 h-4 text-blue-500" />
              <span>
                <strong>Lưu tạm:</strong> Lưu thông tin khám, có thể chỉnh sửa
                sau
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>
                <strong>Hoàn thành:</strong> Kết thúc khám, không thể chỉnh sửa
              </span>
            </div>
          </div>

          {!canComplete && (
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Lưu ý:</strong> Cần nhập đầy đủ thông tin bắt buộc (chẩn
                đoán chính, sinh hiệu) để hoàn thành khám.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ExamActions;
