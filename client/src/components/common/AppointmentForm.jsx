import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import AppointmentSuccessModal from './AppointmentSuccessModal';
import AppointmentConfirmModal from './AppointmentConfirmModal';
import { createAppointment, getSlots } from '../../services/api';

const AppointmentForm = ({ serviceType, serviceName, price, user }) => {
  const [reason, setReason] = useState('');
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const isDoctor = serviceType && serviceType.startsWith('doctor_');
  const isLoggedIn = !!user;
  const location = useLocation();
  const today = new Date().toISOString().split('T')[0];
  const storageKey = `appointmentForm_${serviceType}`;
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [appointmentData, setAppointmentData] = useState(null);
  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    const slotObj = slots.find(s => String(s.value) === String(timeSlot));
    const slotLabel = slotObj ? slotObj.label : '';
    console.log('DEBUG slots:', slots);
    console.log('DEBUG timeSlot:', timeSlot);
    console.log('DEBUG slotLabel:', slotLabel);
    if (isDoctor && !slotLabel) {
      setError('Vui lòng chọn khung giờ khám!');
      return;
    }
    setAppointmentData({
      serviceName,
      date,
      time: isDoctor ? slotLabel : "Trong giờ làm việc",
      fee: price,
      isDoctor,
      room: 1,
      doctorOrStaff: isDoctor ? user?.name : "Nhân viên xét nghiệm",
      slotLabel
    });
    setIsConfirmOpen(true);
  };

  // Hàm thực hiện gọi API khi user xác nhận ở modal
  const handleConfirmBooking = async () => {
    setLoading(true);
    setError(null);
    try {
      let doctor_id = null, service_id = null, room_id = null;
      if (serviceType && serviceType.startsWith('doctor_')) {
        doctor_id = serviceType.replace('doctor_', '');
        service_id = 1;
      } else if (serviceType && serviceType.startsWith('service_')) {
        service_id = serviceType.replace('service_', '');
      }
      const res = await createAppointment({
        doctor_id,
        slot_id: isDoctor ? timeSlot : null,
        service_id,
        room_id,
        bookingDate: date,
        reason,
        serviceType: isDoctor ? "doctor" : "service"
      });

      // Lấy appointment_id từ response
      const appointment_id = res?.appointment?.appointment_id || res?.appointment_id;
      // Gọi API lấy chi tiết lịch hẹn từ backend
      const token = localStorage.getItem('token');
      console.log('Token gửi lên BE:', token);

      const detailRes = await fetch(`/api/v1/appointments/${appointment_id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const detail = await detailRes.json();

      // Debug dữ liệu trả về từ backend
      console.log('DEBUG chi tiết lịch hẹn từ BE:', detail);

      // Map lại dữ liệu cho đúng format modal cần
      const mappedData = {
        queueNumber: detail.data?.queue_number,
        serviceName: detail.data?.service_name || serviceName,
        room: detail.data?.room_id,
        doctorOrStaff: detail.data?.doctor_name || detail.data?.staff_name || "Nhân viên xét nghiệm",
        date: detail.data?.bookingDate ? detail.data.bookingDate.slice(0, 10) : '', // chỉ lấy YYYY-MM-DD
        time: detail.data?.slot_label || "Trong giờ làm việc",
        fee: price,
        isDoctor,
      };

      // Debug dữ liệu truyền vào modal
      console.log('DEBUG dữ liệu truyền vào modal:', mappedData);

      setAppointmentData(mappedData);
      setIsConfirmOpen(false);
      setIsReceiptOpen(true);
      sessionStorage.removeItem(storageKey);
    } catch (err) {
      setError('Đặt lịch thất bại. Vui lòng thử lại!');
      console.error('DEBUG lỗi đặt lịch:', err);
    } finally {
      setLoading(false);
    }
  };

  // Restore saved form state on mount (chỉ khi là guest)
  useEffect(() => {
    if (!isLoggedIn) {
      const saved = sessionStorage.getItem(storageKey);
      if (saved) {
        try {
          const { reason: r, date: d, timeSlot: t } = JSON.parse(saved);
          if (r) setReason(r);
          if (d) setDate(d);
          if (t) setTimeSlot(t);
        } catch (err) {
          console.error('Failed to parse saved appointment form', err);
        }
      }
    }
  }, [storageKey, isLoggedIn]);

  // Khi đã đăng nhập, nếu có dữ liệu tạm trong sessionStorage thì xóa sau khi submit thành công
  useEffect(() => {
    if (isLoggedIn && appointmentData) {
      sessionStorage.removeItem(storageKey);
    }
  }, [isLoggedIn, appointmentData, storageKey]);

  // Persist form state on change
  useEffect(() => {
    const data = { reason, date, timeSlot };
    sessionStorage.setItem(storageKey, JSON.stringify(data));
  }, [reason, date, timeSlot, storageKey]);

  // Format time string to HH:mm
  function formatTime(timeStr) {
    if (!timeStr) return '';
    // Nếu là dạng '08:00:00' thì chỉ lấy 5 ký tự đầu
    if (/^\d{2}:\d{2}/.test(timeStr)) return timeStr.slice(0,5);
    // Nếu là ISO string hoặc Date object thì parse thủ công
    if (typeof timeStr === 'string' && timeStr.includes('T')) {
      // Lấy phần HH:mm từ chuỗi ISO
      const match = timeStr.match(/T(\d{2}:\d{2})/);
      if (match) return match[1];
    }
    try {
      const d = new Date(timeStr);
      if (!isNaN(d.getTime())) {
        return d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0');
      }
    } catch {}
    return timeStr;
  }

  useEffect(() => {
    if (!date || !isDoctor) {
      setSlots([]);
      return;
    }
    // Gọi API lấy slot thực tế
    const fetchSlots = async () => {
      try {
        const doctorId = serviceType.replace('doctor_', '');
        console.log('Gọi getSlots với:', date, doctorId); // Log tham số truyền lên
        const slotData = await getSlots(date, doctorId);
        console.log('Kết quả slotData:', slotData); // Log kết quả trả về
        // Map lại dữ liệu slot cho đúng format FE cần, format giờ phút
        setSlots(
          slotData.map(s => ({
            label: `${formatTime(s.start_time)} - ${formatTime(s.end_time)} (${s.available_spots} chỗ trống)`,
            value: s.slot_id,
            available: s.available_spots > 0
          }))
        );
      } catch (err) {
        setSlots([]);
        console.error('Lỗi khi lấy slot:', err); // Log lỗi nếu có
      }
    };
    fetchSlots();
  }, [date, isDoctor, serviceType]);

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
          <div className="sm:col-span-3">
            <label className="block text-gray-700 mb-1">Lý do khám <span className="text-red-500">*</span></label>
            <textarea
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring"
              placeholder="Mô tả triệu chứng hoặc lý do khám..."
            />
          </div>
        </div>

        <div>
          <label className="block text-gray-700 mb-1">Chọn ngày khám <span className="text-red-500">*</span></label>
          <input
            type="date"
            required
            min={today}
            value={date}            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring disabled:bg-gray-100"
          />        </div>

        {isDoctor && (
          <div>
            <label className="block text-gray-700 mb-1">Chọn khung giờ khám <span className="text-red-500">*</span></label>
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
                  {slots.map(s => (
                    <option key={s.value} value={s.value} disabled={!s.available}>
                      {s.label}{!s.available && ' (Hết slot)'}
                    </option>
                  ))}
                </>
              )}
            </select>
          </div>
        )}

        <div>
          {isLoggedIn ? (            <button
              type="submit"
              className="bg-green-600 text-white w-full px-6 py-2 rounded-full hover:bg-green-700 transition disabled:opacity-50"
              disabled={!date || (isDoctor && !timeSlot) || loading}
            >
              {loading ? 'Đang xử lý...' : 'Xác nhận đặt lịch'}
            </button>
          ) : (
            <Link
              to="/login/patient"
              state={{ from: location.pathname }}
              onClick={() => {
                const data = { reason, date, timeSlot };
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
            onCancel={() => setIsConfirmOpen(false)}
            onConfirm={handleConfirmBooking}
            data={appointmentData}
          />
          <AppointmentSuccessModal
            isOpen={isReceiptOpen}
            onClose={() => setIsReceiptOpen(false)}
            appointmentData={appointmentData}
          />
        </>
      )}
    </section>
  );
};

export default AppointmentForm;
