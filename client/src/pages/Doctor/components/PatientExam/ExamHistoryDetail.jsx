import React from "react";
import {
  X,
  Calendar,
  User,
  Heart,
  Thermometer,
  Weight,
  Ruler,
  FileText,
  Pill,
  TestTube,
  Clock,
  MapPin,
} from "lucide-react";

const ExamHistoryDetail = ({ examDetail, onClose }) => {
  if (!examDetail) return null;

  const {
    thong_tin_co_ban,
    thong_tin_kham_lam_sang,
    thong_tin_don_thuoc,
    chi_tiet_thuoc,
    ket_qua_xet_nghiem,
  } = examDetail;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center rounded-t-xl">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Chi tiết buổi khám
            </h2>
            <p className="text-sm text-gray-600">
              {thong_tin_co_ban?.ngay_kham} - {thong_tin_co_ban?.gio_kham}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Thông tin cơ bản */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Thông tin buổi khám
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 text-blue-600 mr-2" />
                  <span className="font-medium">Ngày khám:</span>
                  <span className="ml-2">{thong_tin_co_ban?.ngay_kham}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 text-blue-600 mr-2" />
                  <span className="font-medium">Giờ khám:</span>
                  <span className="ml-2">{thong_tin_co_ban?.gio_kham}</span>
                </div>
                <div className="flex items-center">
                  <User className="h-4 w-4 text-blue-600 mr-2" />
                  <span className="font-medium">Bác sĩ:</span>
                  <span className="ml-2">{thong_tin_co_ban?.bac_si}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center">
                  <FileText className="h-4 w-4 text-blue-600 mr-2" />
                  <span className="font-medium">Dịch vụ:</span>
                  <span className="ml-2">{thong_tin_co_ban?.dich_vu}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 text-blue-600 mr-2" />
                  <span className="font-medium">Phòng khám:</span>
                  <span className="ml-2">{thong_tin_co_ban?.phong_kham}</span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium">STT:</span>
                  <span className="ml-2">{thong_tin_co_ban?.so_thu_tu}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Thông tin khám lâm sàng */}
          {thong_tin_kham_lam_sang && (
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-green-900 mb-3 flex items-center">
                <Heart className="h-5 w-5 mr-2" />
                Thông tin khám lâm sàng
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Weight className="h-4 w-4 text-green-600 mr-2" />
                    <span className="font-medium">Cân nặng:</span>
                    <span className="ml-2">
                      {thong_tin_kham_lam_sang.can_nang || "Chưa có thông tin"}{" "}
                      kg
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Ruler className="h-4 w-4 text-green-600 mr-2" />
                    <span className="font-medium">Chiều cao:</span>
                    <span className="ml-2">
                      {thong_tin_kham_lam_sang.chieu_cao || "Chưa có thông tin"}{" "}
                      cm
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium">BMI:</span>
                    <span className="ml-2">
                      {thong_tin_kham_lam_sang.bmi || "Chưa có thông tin"}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  {(() => {
                    // Parse vitals from JSON string or use individual fields
                    let vitals = {};
                    if (thong_tin_kham_lam_sang.vitals) {
                      try {
                        vitals =
                          typeof thong_tin_kham_lam_sang.vitals === "string"
                            ? JSON.parse(thong_tin_kham_lam_sang.vitals)
                            : thong_tin_kham_lam_sang.vitals;
                      } catch (e) {
                        console.error("Error parsing vitals:", e);
                      }
                    }

                    return (
                      <>
                        <div className="flex items-center">
                          <Heart className="h-4 w-4 text-green-600 mr-2" />
                          <span className="font-medium">Mạch:</span>
                          <span className="ml-2">
                            {vitals.heart_rate ||
                              thong_tin_kham_lam_sang.nhip_tim ||
                              thong_tin_kham_lam_sang.heart_rate ||
                              "Chưa có thông tin"}{" "}
                            {vitals.heart_rate ||
                            thong_tin_kham_lam_sang.nhip_tim ||
                            thong_tin_kham_lam_sang.heart_rate
                              ? "bpm"
                              : ""}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="font-medium">Huyết áp:</span>
                          <span className="ml-2">
                            {vitals.blood_pressure ||
                              thong_tin_kham_lam_sang.huyet_ap ||
                              thong_tin_kham_lam_sang.blood_pressure ||
                              "Chưa có thông tin"}{" "}
                            {vitals.blood_pressure ||
                            thong_tin_kham_lam_sang.huyet_ap ||
                            thong_tin_kham_lam_sang.blood_pressure
                              ? "mmHg"
                              : ""}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Thermometer className="h-4 w-4 text-green-600 mr-2" />
                          <span className="font-medium">Nhiệt độ:</span>
                          <span className="ml-2">
                            {vitals.temperature ||
                              thong_tin_kham_lam_sang.nhiet_do ||
                              thong_tin_kham_lam_sang.temperature ||
                              "Chưa có thông tin"}
                            {vitals.temperature ||
                            thong_tin_kham_lam_sang.nhiet_do ||
                            thong_tin_kham_lam_sang.temperature
                              ? "°C"
                              : ""}
                          </span>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>

              {thong_tin_kham_lam_sang.dau_hieu_lam_sang && (
                <div className="mt-4">
                  <span className="font-medium text-green-900">
                    Dấu hiệu lâm sàng:
                  </span>
                  <p className="mt-1 text-gray-700">
                    {thong_tin_kham_lam_sang.dau_hieu_lam_sang}
                  </p>
                </div>
              )}

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {thong_tin_kham_lam_sang.chan_doan_chinh && (
                  <div>
                    <span className="font-medium text-green-900">
                      Chẩn đoán chính:
                    </span>
                    <p className="mt-1 text-gray-700">
                      {thong_tin_kham_lam_sang.chan_doan_chinh}
                    </p>
                  </div>
                )}
                {thong_tin_kham_lam_sang.chan_doan_phu && (
                  <div>
                    <span className="font-medium text-green-900">
                      Chẩn đoán phụ:
                    </span>
                    <p className="mt-1 text-gray-700">
                      {thong_tin_kham_lam_sang.chan_doan_phu}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Thông tin đơn thuốc */}
          {thong_tin_don_thuoc && (
            <div className="bg-purple-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-purple-900 mb-3 flex items-center">
                <Pill className="h-5 w-5 mr-2" />
                Thông tin đơn thuốc
              </h3>

              {thong_tin_don_thuoc.ten_phac_do && (
                <div className="mb-4 p-3 bg-purple-100 rounded-lg">
                  <span className="font-medium text-purple-900">
                    Phác đồ ARV:
                  </span>
                  <p className="text-purple-800">
                    {thong_tin_don_thuoc.ten_phac_do}
                  </p>
                  {thong_tin_don_thuoc.thanh_phan_phac_do && (
                    <p className="text-sm text-purple-700">
                      Thành phần: {thong_tin_don_thuoc.thanh_phan_phac_do}
                    </p>
                  )}
                </div>
              )}

              {/* Chi tiết thuốc ARV */}
              {chi_tiet_thuoc?.thuoc_arv &&
                chi_tiet_thuoc.thuoc_arv.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium text-purple-900 mb-2">
                      Thuốc ARV:
                    </h4>
                    <div className="space-y-2">
                      {chi_tiet_thuoc.thuoc_arv.map((thuoc, index) => (
                        <div
                          key={index}
                          className="p-2 bg-white rounded border"
                        >
                          <div className="font-medium">{thuoc.ten_thuoc}</div>
                          <div className="text-sm text-gray-600">
                            Liều lượng: {thuoc.lieu_luong} | Tần suất:{" "}
                            {thuoc.tan_suat} | Thời gian: {thuoc.so_ngay_dung}{" "}
                            ngày
                          </div>
                          {thuoc.huong_dan_su_dung && (
                            <div className="text-sm text-gray-600">
                              Hướng dẫn: {thuoc.huong_dan_su_dung}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Chi tiết thuốc hỗ trợ */}
              {chi_tiet_thuoc?.thuoc_ho_tro &&
                chi_tiet_thuoc.thuoc_ho_tro.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium text-purple-900 mb-2">
                      Thuốc hỗ trợ:
                    </h4>
                    <div className="space-y-2">
                      {chi_tiet_thuoc.thuoc_ho_tro.map((thuoc, index) => (
                        <div
                          key={index}
                          className="p-2 bg-white rounded border"
                        >
                          <div className="font-medium">{thuoc.ten_thuoc}</div>
                          <div className="text-sm text-gray-600">
                            Liều lượng: {thuoc.lieu_luong} | Tần suất:{" "}
                            {thuoc.tan_suat} | Thời gian: {thuoc.so_ngay_dung}{" "}
                            ngày
                          </div>
                          {thuoc.huong_dan_su_dung && (
                            <div className="text-sm text-gray-600">
                              Hướng dẫn: {thuoc.huong_dan_su_dung}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Lời khuyên và kế hoạch */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {thong_tin_don_thuoc.loi_khuyen_tu_van && (
                  <div>
                    <span className="font-medium text-purple-900">
                      Lời khuyên tư vấn:
                    </span>
                    <p className="mt-1 text-gray-700">
                      {thong_tin_don_thuoc.loi_khuyen_tu_van}
                    </p>
                  </div>
                )}
                {thong_tin_don_thuoc.ke_hoach_tai_kham && (
                  <div>
                    <span className="font-medium text-purple-900">
                      Kế hoạch tái khám:
                    </span>
                    <p className="mt-1 text-gray-700">
                      {thong_tin_don_thuoc.ke_hoach_tai_kham}
                    </p>
                  </div>
                )}
              </div>

              {thong_tin_don_thuoc.ghi_chu_bac_si && (
                <div className="mt-4">
                  <span className="font-medium text-purple-900">
                    Ghi chú bác sĩ:
                  </span>
                  <p className="mt-1 text-gray-700">
                    {thong_tin_don_thuoc.ghi_chu_bac_si}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Kết quả xét nghiệm */}
          {ket_qua_xet_nghiem && ket_qua_xet_nghiem.length > 0 && (
            <div className="bg-orange-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-orange-900 mb-3 flex items-center">
                <TestTube className="h-5 w-5 mr-2" />
                Kết quả xét nghiệm liên quan
              </h3>
              <div className="space-y-3">
                {ket_qua_xet_nghiem.map((test, index) => (
                  <div key={index} className="p-3 bg-white rounded border">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">{test.ten_xet_nghiem}</div>
                        <div className="text-sm text-gray-600">
                          Ngày: {test.ngay_xet_nghiem}
                        </div>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          test.trang_thai === "completed"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {test.trang_thai === "completed"
                          ? "Hoàn thành"
                          : "Đang xử lý"}
                      </span>
                    </div>
                    <div className="mt-2 text-sm">
                      <div>
                        <span className="font-medium">Kết quả:</span>{" "}
                        {test.ket_qua}
                      </div>
                      <div>
                        <span className="font-medium">Chỉ số bình thường:</span>{" "}
                        {test.chi_so_binh_thuong}
                      </div>
                      {test.ghi_chu_xet_nghiem && (
                        <div>
                          <span className="font-medium">Ghi chú:</span>{" "}
                          {test.ghi_chu_xet_nghiem}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200 rounded-b-xl">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamHistoryDetail;
