import React from 'react';
import { createPortal } from 'react-dom';

const AppointmentConfirmModal = ({ isOpen, onCancel, onConfirm, data }) => {
  if (!isOpen || !data) return null;
  // Đảm bảo lấy đúng dữ liệu, fallback nếu thiếu
  const serviceName = data.serviceName || data.service_name || '';
  const date = data.date || data.bookingDate || '';
  const time = data.time || data.timeSlot || data.slot_time || '';
  const fee = data.fee || data.price || '';
  const isDoctor = typeof data.isDoctor !== 'undefined' ? data.isDoctor : (data.doctorOrStaff ? true : false);
  const doctorOrStaff = data.doctorOrStaff || data.doctor_name || data.staff_name || '';
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=PAY_${Date.now()}`;
  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white w-11/12 md:w-1/2 rounded-xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center bg-green-600 px-6 py-4">
          <h2 className="text-white text-lg font-semibold">Xác nhận đặt lịch</h2>
          <button onClick={onCancel} className="text-white hover:text-gray-200">
            ✕
          </button>
        </div>
        <div className="p-6 space-y-6">
          <div className="text-gray-700 mb-4 grid grid-cols-2 gap-4">
            <div><strong>Dịch vụ:</strong> {serviceName}</div>
            <div><strong>Phí:</strong> <span className="text-green-600">{fee}</span></div>
            <div><strong>Ngày:</strong> {date}</div>
            <div><strong>Giờ:</strong> {time}</div>
            <div><strong>{isDoctor ? 'Bác sĩ' : 'Nhân viên'}:</strong> {doctorOrStaff}</div>
          </div>
          {/* QR Payment */}
          <div className="mb-4 text-center">
            <h3 className="font-medium mb-2">Quét mã QR để thanh toán</h3>
            <img src={qrUrl} alt="QR for payment" className="w-32 h-32 mx-auto" />
            <p className="text-sm text-gray-500 mt-2">Quét mã để thanh toán nhanh</p>
          </div>
          <div className="flex justify-end space-x-4">
            <button onClick={onCancel} className="px-5 py-2 border border-red-600 text-red-600 rounded-md hover:bg-red-50">Hủy</button>
            <button onClick={onConfirm} className="px-5 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">Thanh toán</button>
          </div>
        </div>
      </div>
    </div>, document.body
  );
};
export default AppointmentConfirmModal;
