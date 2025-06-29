import React from "react";
import { Save, CheckCircle, ArrowLeft, Loader } from "lucide-react";

const ExamActions = ({
  onSaveTemp,
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
                ⚠️ Để hoàn thành khám: cần nhập đầy đủ thông tin bắt buộc
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              {/* Save Temp Button */}
              <button
                onClick={onSaveTemp}
                disabled={saving}
                className="px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:bg-yellow-300 transition-colors flex items-center justify-center gap-2"
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
              <Save className="w-4 h-4 text-yellow-500" />
              <span>
                <strong>Lưu tạm:</strong> Lưu và quay lại, có thể thiếu thông
                tin
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>
                <strong>Hoàn thành:</strong> Kết thúc khám, cần đầy đủ thông tin
              </span>
            </div>
          </div>

          {!canComplete && (
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Lưu ý:</strong> Cần nhập đầy đủ thông tin bắt buộc để
                hoàn thành khám:
                <br />• Sinh hiệu đầy đủ (nhịp tim, huyết áp, nhiệt độ, cân
                nặng, chiều cao)
                <br />• Dấu hiệu lâm sàng, chẩn đoán chính
                <br />• Lời khuyên tư vấn, kế hoạch tái khám, ghi chú bác sĩ
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ExamActions;
