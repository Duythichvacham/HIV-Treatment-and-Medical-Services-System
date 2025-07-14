import { createPortal } from "react-dom";

const AppointmentConfirmModal = ({
  isOpen,
  onCancel,
  data,
  // onConfirm,
  onVnpayPayment,
}) => {
  if (!isOpen || !data) return null;

  // Đảm bảo lấy đúng dữ liệu, fallback nếu thiếu
  const serviceName = data.serviceName || data.service_name || "";
  const date = data.date || data.bookingDate || "";
  // Ưu tiên slotLabel, nhưng loại bỏ số chỗ trống nếu có
  let time = data.slotLabel || "";
  if (time) {
    // Loại bỏ phần (x chỗ trống) nếu có
    time = time.replace(/\s*\([^)]*chỗ trống[^)]*\)/, "").trim();
  }
  if (!time && typeof data.time === "string" && isNaN(Number(data.time)))
    time = data.time;
  const fee = data.fee || data.price || "";
  const isDoctor =
    typeof data.isDoctor !== "undefined"
      ? data.isDoctor
      : data.doctorOrStaff
      ? true
      : false;
  let doctorOrStaff =
    data.doctorOrStaff || data.doctor_name || data.staff_name || "";
  if (isDoctor && doctorOrStaff && doctorOrStaff.startsWith("patient"))
    doctorOrStaff = "";
  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white w-11/12 md:w-1/2 rounded-xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center bg-green-600 px-6 py-4">
          <h2 className="text-white text-lg font-semibold">
            Xác nhận đặt lịch
          </h2>
          <button onClick={onCancel} className="text-white hover:text-gray-200">
            ✕
          </button>
        </div>
        <div className="p-6 space-y-6">
          {" "}
          <div className="text-gray-700 mb-4 grid grid-cols-2 gap-4">
            {serviceName && (
              <div>
                <strong>Dịch vụ:</strong> {serviceName}
              </div>
            )}
            {fee && (
              <div>
                <strong>Phí:</strong>{" "}
                <span className="text-green-600">{fee}</span>
              </div>
            )}
            {date && (
              <div>
                <strong>Ngày:</strong> {date}
              </div>
            )}
            {time && (
              <div>
                <strong>Giờ:</strong> {time}
              </div>
            )}
          </div>
          <div className="flex justify-end space-x-4">
            <button
              onClick={onCancel}
              className="px-5 py-2 border border-red-600 text-red-600 rounded-md hover:bg-red-50"
            >
              Hủy
            </button>
            <button
              // onclick={onConfirm} // dùng khi bypass
              onClick={onVnpayPayment}
              className="px-5 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Xác nhận
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
export default AppointmentConfirmModal;
