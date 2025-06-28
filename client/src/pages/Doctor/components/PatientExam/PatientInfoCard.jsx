import React from "react";

const PatientInfoCard = ({ patientData, isLoading = false }) => {
  // Debug logging
  React.useEffect(() => {
    const token = localStorage.getItem("token");
    console.log("🔍 PatientInfoCard - Token check:", {
      hasToken: !!token,
      tokenLength: token?.length,
      patientDataExists: !!patientData,
      isLoading,
    });
  }, [patientData, isLoading]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!patientData) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-500 text-center">Chưa chọn bệnh nhân</p>
      </div>
    );
  }

  const { basicInfo, currentArv, latestTestResults, currentAppointment } =
    patientData;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
      {/* Thông tin cơ bản */}
      <div>
        <h3 className="text-lg font-semibold text-blue-800 mb-4 border-b pb-2">
          Thông tin bệnh nhân
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-sm text-gray-600">Họ tên:</span>
            <p className="font-medium">
              {basicInfo?.full_name || "Chưa có thông tin"}
            </p>
          </div>
          <div>
            <span className="text-sm text-gray-600">Mã BN:</span>
            <p className="font-medium text-blue-600">
              {basicInfo?.code || "N/A"}
            </p>
          </div>
          <div>
            <span className="text-sm text-gray-600">Tuổi/Giới:</span>
            <p className="font-medium">
              {basicInfo?.age || "N/A"} tuổi -{" "}
              {basicInfo?.gender === "male"
                ? "Nam"
                : basicInfo?.gender === "female"
                ? "Nữ"
                : "N/A"}
            </p>
          </div>
          <div>
            <span className="text-sm text-gray-600">Giờ hẹn:</span>
            <p className="font-medium text-green-600">
              {currentAppointment?.full_slot_time || currentAppointment?.slot_time || "Chưa xác định"}
            </p>
          </div>
          <div>
            <span className="text-sm text-gray-600">SĐT:</span>
            <p className="font-medium">
              {basicInfo?.phone || "Chưa có thông tin"}
            </p>
          </div>
          <div>
            <span className="text-sm text-gray-600">Địa chỉ:</span>
            <p className="font-medium text-sm">
              {basicInfo?.address || "Chưa có thông tin"}
            </p>
          </div>
        </div>
      </div>

      {/* Thông tin điều trị ARV hiện tại */}
      <div>
        <h3 className="text-lg font-semibold text-blue-800 mb-4 border-b pb-2">
          Thông tin điều trị ARV hiện tại
        </h3>
        {currentArv ? (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-gray-600">Phác đồ:</span>
              <p className="font-medium text-blue-600">
                {currentArv.regimen_name || "TDF/3TC/DTG"}
              </p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Bắt đầu:</span>
              <p className="font-medium">
                {currentArv.start_date
                  ? new Date(currentArv.start_date).toLocaleDateString("vi-VN")
                  : "2024-03-10"}
              </p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Tuân thủ:</span>
              <p className="font-medium text-green-600">
                {currentArv.adherence || "Khá (90-95%)"}
              </p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Tác dụng phụ:</span>
              <p className="font-medium">
                {currentArv.side_effects || "Không"}
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800 text-sm">
              <span className="font-medium">
                Chưa có thông tin phác đồ ARV.
              </span>
              Vui lòng cập nhật trong quá trình khám.
            </p>
          </div>
        )}
      </div>

      {/* Kết quả xét nghiệm gần nhất */}
      <div>
        <h3 className="text-lg font-semibold text-green-800 mb-4 border-b pb-2">
          Kết quả xét nghiệm gần nhất
        </h3>
        {latestTestResults ? (
          <div className="grid grid-cols-2 gap-4">
            {/* Sàng lọc HIV */}
            {latestTestResults.sang_loc ? (
              <div>
                <span className="text-sm text-gray-600">Sàng lọc HIV:</span>
                <p className="font-medium">
                  {latestTestResults.sang_loc.result_value}
                  <span
                    className={`ml-2 text-xs px-2 py-1 rounded ${
                      latestTestResults.sang_loc.result_value
                        ?.toLowerCase()
                        .includes("dương")
                        ? "bg-red-100 text-red-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {latestTestResults.sang_loc.result_value
                      ?.toLowerCase()
                      .includes("dương")
                      ? "Phát hiện"
                      : "Âm tính"}
                  </span>
                </p>
                <span className="text-xs text-gray-500">
                  {latestTestResults.sang_loc.test_date}
                </span>
                {latestTestResults.sang_loc.notes && (
                  <p className="text-xs text-gray-600 mt-1">
                    {latestTestResults.sang_loc.notes}
                  </p>
                )}
              </div>
            ) : (
              <div>
                <span className="text-sm text-gray-600">Sàng lọc HIV:</span>
                <p className="font-medium text-gray-400">Chưa có kết quả</p>
              </div>
            )}

            {/* Khẳng định HIV */}
            {latestTestResults.khang_dinh ? (
              <div>
                <span className="text-sm text-gray-600">Khẳng định HIV:</span>
                <p className="font-medium">
                  {latestTestResults.khang_dinh.result_value}
                  <span
                    className={`ml-2 text-xs px-2 py-1 rounded ${
                      latestTestResults.khang_dinh.result_value
                        ?.toLowerCase()
                        .includes("dương")
                        ? "bg-red-100 text-red-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {latestTestResults.khang_dinh.result_value
                      ?.toLowerCase()
                      .includes("dương")
                      ? "Xác nhận"
                      : "Âm tính"}
                  </span>
                </p>
                <span className="text-xs text-gray-500">
                  {latestTestResults.khang_dinh.test_date}
                </span>
                {latestTestResults.khang_dinh.notes && (
                  <p className="text-xs text-gray-600 mt-1">
                    {latestTestResults.khang_dinh.notes}
                  </p>
                )}
              </div>
            ) : (
              <div>
                <span className="text-sm text-gray-600">Khẳng định HIV:</span>
                <p className="font-medium text-gray-400">Chưa có kết quả</p>
              </div>
            )}

            {/* CD4 */}
            {latestTestResults.cd4 ? (
              <div>
                <span className="text-sm text-gray-600">Số lượng CD4:</span>
                <p className="font-medium">
                  {latestTestResults.cd4.result_value}{" "}
                  {latestTestResults.cd4.unit}
                  <span
                    className={`ml-2 text-xs px-2 py-1 rounded ${
                      parseInt(latestTestResults.cd4.result_value) >= 500
                        ? "bg-green-100 text-green-800"
                        : parseInt(latestTestResults.cd4.result_value) >= 200
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {parseInt(latestTestResults.cd4.result_value) >= 500
                      ? "Tốt"
                      : parseInt(latestTestResults.cd4.result_value) >= 200
                      ? "Trung bình"
                      : "Thấp"}
                  </span>
                </p>
                <span className="text-xs text-gray-500">
                  {latestTestResults.cd4.test_date}
                </span>
                {latestTestResults.cd4.notes && (
                  <p className="text-xs text-gray-600 mt-1">
                    {latestTestResults.cd4.notes}
                  </p>
                )}
              </div>
            ) : (
              <div>
                <span className="text-sm text-gray-600">Số lượng CD4:</span>
                <p className="font-medium text-gray-400">Chưa có kết quả</p>
              </div>
            )}

            {/* Viral Load */}
            {latestTestResults.viral_load ? (
              <div>
                <span className="text-sm text-gray-600">Tải lượng virus:</span>
                <p className="font-medium">
                  {latestTestResults.viral_load.result_value}{" "}
                  {latestTestResults.viral_load.unit}
                  <span
                    className={`ml-2 text-xs px-2 py-1 rounded ${
                      parseInt(latestTestResults.viral_load.result_value) < 50
                        ? "bg-green-100 text-green-800"
                        : parseInt(latestTestResults.viral_load.result_value) <
                          1000
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {parseInt(latestTestResults.viral_load.result_value) < 50
                      ? "Không phát hiện"
                      : parseInt(latestTestResults.viral_load.result_value) <
                        1000
                      ? "Thấp"
                      : "Cao"}
                  </span>
                </p>
                <span className="text-xs text-gray-500">
                  {latestTestResults.viral_load.test_date}
                </span>
                {latestTestResults.viral_load.notes && (
                  <p className="text-xs text-gray-600 mt-1">
                    {latestTestResults.viral_load.notes}
                  </p>
                )}
              </div>
            ) : (
              <div>
                <span className="text-sm text-gray-600">Tải lượng virus:</span>
                <p className="font-medium text-gray-400">Chưa có kết quả</p>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-gray-600 text-sm text-center">
              <span className="font-medium">Chưa có kết quả xét nghiệm.</span>
              Vui lòng yêu cầu xét nghiệm trong quá trình khám.
            </p>
          </div>
        )}
      </div>

      {/* Lịch sử khám gần đây */}
      {patientData.examHistory && patientData.examHistory.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-purple-800 mb-4 border-b pb-2">
            Lịch sử khám gần đây
          </h3>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {patientData.examHistory.slice(0, 3).map((exam, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-3 text-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-800">
                      {exam.diagnosis || "Khám định kỳ"}
                    </p>
                    <p className="text-gray-600 text-xs mt-1">
                      {exam.treatment_plan || "Tiếp tục điều trị"}
                    </p>
                  </div>
                  <span className="text-xs text-gray-500">
                    {exam.exam_date
                      ? new Date(exam.exam_date).toLocaleDateString("vi-VN")
                      : ""}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientInfoCard;
