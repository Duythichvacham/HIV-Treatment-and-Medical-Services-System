import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import AppointmentSuccessModal from './AppointmentSuccessModal';
import AppointmentConfirmModal from './AppointmentConfirmModal';

const AppointmentForm = ({ serviceType, serviceName, duration, price, user }) => {
  const [reason, setReason] = useState('');
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [slots, setSlots] = useState([]);
  // Additional for doctor visit type
  const isDoctor = serviceType.startsWith('doctor_');
  const [visitType, setVisitType] = useState('');
  const isLoggedIn = !!user;
  const location = useLocation();
  // Disable past dates
  const today = new Date().toISOString().split('T')[0];
  // Key for persisting form state during login redirect
  const storageKey = `appointmentForm_${serviceType}`;
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [appointmentData, setAppointmentData] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Mock prepare data for confirm
    const room = isDoctor ? `Phòng khám` : `Phòng xét nghiệm`;
    const doctorOrStaff = isDoctor ? user.name : 'Nhân viên xét nghiệm';
    setAppointmentData({ serviceName, date, time: timeSlot, fee: price, isDoctor, room, doctorOrStaff });
    setIsConfirmOpen(true);
    // Clear saved form
    sessionStorage.removeItem(storageKey);
  };

  // Restore saved form state on mount
  useEffect(() => {
    const saved = sessionStorage.getItem(storageKey);
    if (saved) {
      try {
        const { reason: r, date: d, timeSlot: t, visitType: v } = JSON.parse(saved);
        if (r) setReason(r);
        if (d) setDate(d);
        if (t) setTimeSlot(t);
        if (isDoctor && v) setVisitType(v);
      } catch (err) {
        console.error('Failed to parse saved appointment form', err);
      }
    }
  }, [storageKey, isDoctor]);

  // Persist form state on change
  useEffect(() => {
    const data = isDoctor
      ? { reason, date, timeSlot, visitType }
      : { reason, date, timeSlot };
    sessionStorage.setItem(storageKey, JSON.stringify(data));
  }, [reason, date, timeSlot, storageKey, isDoctor, visitType]);

  useEffect(() => {
    if (!date) {
      setSlots([]);
      return;
    }
    // Mock fetch slots: 6 max each hour
    const times = ['08:00-09:00','09:00-10:00','10:00-11:00','11:00-12:00','13:00-14:00','14:00-15:00 ','15:00-16:00','16:00-17:00'];
    const list = times.map(label => ({
      label,
      // mock available count
      available: Math.floor(Math.random() * 6) > 0
    }));
    setSlots(list);
    // Do not clear previously selected timeSlot, to preserve user selection
  }, [date]);

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
          <div>
            <div className="text-sm text-gray-500">Thời gian</div>
            <div className="font-semibold">{duration}</div>
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

        {/* Visit Type for doctor */}
        {isDoctor && (
          <div>
            <label className="block text-gray-700 mb-1">Hình thức khám <span className="text-red-500">*</span></label>
            <select
              required
              value={visitType}
              onChange={(e) => setVisitType(e.target.value)}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring"
            >
              <option value="">-- Chọn hình thức --</option>
              <option value="Trực tiếp">Khám trực tiếp</option>
              <option value="Trực tuyến">Khám trực tuyến</option>
            </select>
          </div>
        )}

        <div>
          <label className="block text-gray-700 mb-1">Chọn ngày khám <span className="text-red-500">*</span></label>
          <input
            type="date"
            required
            min={today}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring disabled:bg-gray-100"
          />
        </div>

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
              <>  <option value="">-- Chọn khung giờ khám --</option>
                {slots.map(s => (
                  <option key={s.label} value={s.label} disabled={!s.available}>
                    {s.label}{!s.available && ' (Hết slot)'}
                  </option>
                ))}
              </>
            )}
          </select>
        </div>

        <div>
          {isLoggedIn ? (
            <button
              type="submit"
              className="bg-green-600 text-white w-full px-6 py-2 rounded-full hover:bg-green-700 transition disabled:opacity-50"
              disabled={!date || !timeSlot || (isDoctor && !visitType)}
            >
              Xác nhận đặt lịch
            </button>
          ) : (
            <Link
              to="/login/patient"
              state={{ from: location.pathname }}
              onClick={() => {
                // Persist latest form data before redirecting to login
                const data = isDoctor
                  ? { reason, date, timeSlot, visitType }
                  : { reason, date, timeSlot };
                sessionStorage.setItem(storageKey, JSON.stringify(data));
              }}
              className="block text-center bg-green-600 text-white w-full px-6 py-2 rounded-full hover:bg-green-700 transition"
            >
              Đăng nhập để đặt lịch
            </Link>
          )}
        </div>
      </form>
      {appointmentData && (
        <>
          <AppointmentConfirmModal
            isOpen={isConfirmOpen}
            onCancel={() => setIsConfirmOpen(false)}
            onConfirm={() => { setIsConfirmOpen(false); setIsReceiptOpen(true); }}
            data={appointmentData}
          />
          <AppointmentSuccessModal
            isOpen={isReceiptOpen}
            onClose={() => setIsReceiptOpen(false)}
            appointmentData={{ ...appointmentData, queueNumber: Math.floor(Math.random()*20+1), code: `A${Date.now()}` }}
          />
        </>
      )}
    </section>
  );
};

export default AppointmentForm;
