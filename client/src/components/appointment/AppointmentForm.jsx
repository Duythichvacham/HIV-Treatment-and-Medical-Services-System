import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import AppointmentSuccessModal from "./AppointmentSuccessModal";
import AppointmentConfirmModal from "./AppointmentConfirmModal";
import {
  createAppointment,
  getSlots,
  checkExistingAppointment,
} from "../../services/api";

const AppointmentForm = ({ serviceType_id, serviceName, price, user }) => {
  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const isDoctor = serviceType_id && serviceType_id.startsWith("examinaton_");
  const isLoggedIn = !!user;
  const location = useLocation();
  const today = new Date().toISOString().split("T")[0];
  const storageKey = `appointmentForm_${serviceType_id}`;
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [appointmentData, setAppointmentData] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const slotObj = slots.find((s) => String(s.value) === String(timeSlot));
    const slotLabel = slotObj ? slotObj.label : "";
    console.log("DEBUG slots:", slots);
    console.log("DEBUG timeSlot:", timeSlot);
    console.log("DEBUG slotLabel:", slotLabel);
    if (isDoctor && !slotLabel) {
      setError("Vui lòng chọn khung giờ khám!");
      return;
    }

    // Kiểm tra lịch hẹn đã tồn tại trước khi đặt
    if (isLoggedIn && date) {
      try {
        setLoading(true);
        let serviceId = null;
        let doctorId = null;

        if (isDoctor) {
          doctorId = serviceType_id.replace("examinaton_", "");
          serviceId = 1; // Khám bệnh
        } else if (serviceType_id && serviceType_id.startsWith("test_")) {
          serviceId = serviceType_id.replace("test_", "");
        }

        if (serviceId) {
          const existingCheck = await checkExistingAppointment(
            serviceId,
            date,
            doctorId
          );

          if (existingCheck.hasExisting) {
            setError(
              existingCheck.message ||
                "Bạn đã có lịch hẹn tương tự. Vui lòng kiểm tra lại."
            );
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn("Cannot check existing appointment:", err);
        // Tiếp tục đặt lịch nếu không kiểm tra được
      } finally {
        setLoading(false);
      }
    }

    // Gọi API ngay khi submit form (giống như trang /appointment)
    await handleConfirmBooking();
  };

  // Hàm thực hiện gọi API khi user xác nhận ở modal
  const handleConfirmBooking = async () => {
    setLoading(true);
    setError(null);
    try {
      let doctor_id = null,
        service_id = null,
        room_id = null;
      if (serviceType_id && serviceType_id.startsWith("examinaton_")) {
        doctor_id = serviceType_id.replace("examinaton_", "");
        service_id = 1;
      } else if (serviceType_id && serviceType_id.startsWith("test_")) {
        service_id = serviceType_id.replace("test_", "");
      }
      const res = await createAppointment({
        doctor_id,
        slot_id: isDoctor ? timeSlot : null,
        service_id,
        room_id,
        bookingDate: date,
        serviceType: isDoctor ? "examinaton" : "test",
      });

      // Lấy appointment_id từ response
      const appointment_id =
        res?.appointment?.appointment_id || res?.appointment_id;

      console.log("🔍 DEBUG API Response:", JSON.stringify(res, null, 2));
      console.log("🔍 DEBUG appointment:", res?.appointment);
      console.log("🔍 DEBUG doctor_name:", res?.appointment?.doctor_name);

      // Tạo dữ liệu đầy đủ với appointmentId (giống như trang /appointment)
      const mappedData = {
        appointmentId: appointment_id,
        invoiceId: res?.invoice_id,
        queueNumber: res?.queue_info?.queue_number || res?.queue_number || 1,
        serviceName: serviceName,
        room: res?.appointment?.room_name || "Chưa xác định",
        doctorOrStaff: isDoctor
          ? res?.appointment?.doctor_name || "Chưa xác định"
          : "Nhân viên xét nghiệm",
        date: date,
        time: isDoctor
          ? slots.find((s) => String(s.value) === String(timeSlot))?.label || ""
          : "Không cần đặt giờ cụ thể",
        fee:
          typeof price === "number"
            ? `${Number(price).toLocaleString()}đ`
            : price,
        isDoctor: isDoctor,
      };

      console.log("🔍 DEBUG mappedData:", mappedData);

      setAppointmentData(mappedData);
      setIsConfirmOpen(true); // Show payment confirmation modal

      // Reset form after successful booking
      setDate("");
      setTimeSlot("");
      sessionStorage.removeItem(storageKey);
    } catch (err) {
      let msg = "Đặt lịch thất bại. Vui lòng thử lại!";
      if (err?.response?.data?.message) {
        msg = err.response.data.message;
      } else if (err?.message) {
        msg = err.message;
      }
      setError(msg);
      console.error("DEBUG lỗi đặt lịch:", err);
    } finally {
      setLoading(false);
    }
  };

  // // Hàm xử lý thanh toán (giống như trang /appointment)
  // const handlePaymentConfirmation = async (paymentMethod = "cash") => {
  //   if (!appointmentData?.appointmentId) {
  //     setError("Không tìm thấy thông tin đặt lịch");
  //     return false;
  //   }

  //   try {
  //     setLoading(true);
  //     await confirmAppointmentPayment(
  //       appointmentData.appointmentId,
  //       paymentMethod
  //     );
  //     console.log(
  //       "✅ Payment confirmed for appointment:",
  //       appointmentData.appointmentId
  //     );

  //     // Chuyển sang modal thành công sau khi thanh toán
  //     setIsConfirmOpen(false);
  //     setIsReceiptOpen(true);

  //     return true;
  //   } catch (err) {
  //     console.error("❌ Payment confirmation error:", err);
  //     setError("Có lỗi xảy ra khi xác nhận thanh toán");
  //     setAppointmentData(null);
  //     return false;
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // Restore saved form state on mount (chỉ khi là guest)
  useEffect(() => {
    if (!isLoggedIn) {
      const saved = sessionStorage.getItem(storageKey);
      if (saved) {
        try {
          const { date: d, timeSlot: t } = JSON.parse(saved);
          if (d) setDate(d);
          if (t) setTimeSlot(t);
        } catch (err) {
          console.error("Failed to parse saved appointment form", err);
        }
      }
    }
  }, [storageKey, isLoggedIn]);

  // Persist form state on change
  useEffect(() => {
    const data = { date, timeSlot };
    sessionStorage.setItem(storageKey, JSON.stringify(data));
  }, [date, timeSlot, storageKey]);

  // Format time string to HH:mm
  function formatTime(timeStr) {
    if (!timeStr) return "";
    // Nếu là dạng '08:00:00' thì chỉ lấy 5 ký tự đầu
    if (/^\d{2}:\d{2}/.test(timeStr)) return timeStr.slice(0, 5);
    // Nếu là ISO string hoặc Date object thì parse thủ công
    if (typeof timeStr === "string" && timeStr.includes("T")) {
      // Lấy phần HH:mm từ chuỗi ISO
      const match = timeStr.match(/T(\d{2}:\d{2})/);
      if (match) return match[1];
    }
    try {
      const d = new Date(timeStr);
      if (!isNaN(d.getTime())) {
        return (
          d.getHours().toString().padStart(2, "0") +
          ":" +
          d.getMinutes().toString().padStart(2, "0")
        );
      }
    } catch {
      console.error("Invalid date format:", timeStr);
    }
    return "";
  }

  // Hàm format an toàn cho giờ slot
  function formatTimeStr(t) {
    if (!t) return "";
    if (/^\d{2}:\d{2}/.test(t)) return t.slice(0, 5);
    if (typeof t === "string" && t.includes("T")) {
      const match = t.match(/T(\d{2}:\d{2})/);
      if (match) return match[1];
    }
    return "";
  }

  useEffect(() => {
    if (!date || !isDoctor) {
      setSlots([]);
      return;
    }
    // Gọi API lấy slot thực tế
    const fetchSlots = async () => {
      try {
        const doctorId = serviceType_id.replace("examinaton_", "");
        console.log("Gọi getSlots với:", date, doctorId); // Log tham số truyền lên
        const slotData = await getSlots(date, doctorId);
        console.log("Kết quả slotData:", slotData); // Log kết quả trả về
        // Map lại dữ liệu slot cho đúng format FE cần, format giờ phút
        setSlots(
          slotData.map((s) => ({
            label: `${formatTime(s.start_time)} - ${formatTime(s.end_time)} (${
              s.available_spots
            } chỗ trống)`,
            value: s.slot_id,
            available: s.available_spots > 0,
          }))
        );
      } catch (err) {
        setSlots([]);
        console.error("Lỗi khi lấy slot:", err); // Log lỗi nếu có
      }
    };
    fetchSlots();
  }, [date, isDoctor, serviceType_id]);

  return (
    <section className="bg-white p-6 rounded-lg shadow mb-6">
      <h2 className="text-2xl font-semibold mb-1">Đặt lịch ngay</h2>
      <div className="text-sm text-gray-500 mb-4">{serviceName}</div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <div className="text-sm text-gray-500">Giá dịch vụ</div>
            <div className="font-semibold">{price}</div>
          </div>
        </div>

        <div>
          <label className="block text-gray-700 mb-1">
            Chọn ngày khám <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            required
            min={today}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring disabled:bg-gray-100"
          />{" "}
        </div>

        {isDoctor && (
          <div>
            <label className="block text-gray-700 mb-1">
              Chọn khung giờ khám <span className="text-red-500">*</span>
            </label>
            <select
              required
              disabled={!date}
              value={timeSlot}
              onChange={(e) => setTimeSlot(e.target.value)}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring disabled:bg-gray-100"
            >
              {!date ? (
                <option value="">Vui lòng chọn ngày trước</option>
              ) : (
                <>
                  <option value="">-- Chọn khung giờ khám --</option>
                  {slots.map((s) => (
                    <option
                      key={s.value}
                      value={s.value}
                      disabled={!s.available}
                    >
                      {s.label}
                      {!s.available && " (Hết slot)"}
                    </option>
                  ))}
                </>
              )}
            </select>
          </div>
        )}

        <div>
          {isLoggedIn ? (
            <button
              type="submit"
              className="bg-green-600 text-white w-full px-6 py-2 rounded-full hover:bg-green-700 transition disabled:opacity-50"
              disabled={!date || (isDoctor && !timeSlot) || loading}
            >
              {loading ? "Đang xử lý..." : "Đặt lịch ngay"}
            </button>
          ) : (
            <Link
              to="/login/patient"
              state={{ from: location.pathname }}
              onClick={() => {
                const data = { date, timeSlot };
                sessionStorage.setItem(storageKey, JSON.stringify(data));
              }}
              className="block text-center bg-green-600 text-white w-full px-6 py-2 rounded-full hover:bg-green-700 transition"
            >
              Đăng nhập để đặt lịch
            </Link>
          )}
        </div>
      </form>
      {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
      {appointmentData && (
        <>
          <AppointmentConfirmModal
            isOpen={isConfirmOpen}
            onCancel={() => {
              setIsConfirmOpen(false);
              setAppointmentData(null);
            }}
            onConfirm={() => {
              setIsConfirmOpen(false);
              setIsReceiptOpen(true);
            }}
            data={appointmentData}
          />

          <AppointmentSuccessModal
            isOpen={isReceiptOpen}
            onClose={() => {
              setIsReceiptOpen(false);
              setAppointmentData(null);
            }}
            appointmentData={appointmentData}
          />
        </>
      )}
    </section>
  );
};

export default AppointmentForm;
