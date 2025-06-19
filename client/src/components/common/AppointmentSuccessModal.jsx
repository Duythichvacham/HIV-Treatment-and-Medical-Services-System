import React from 'react';
import { createPortal } from 'react-dom';

const AppointmentSuccessModal = ({ isOpen, onClose, appointmentData }) => {
  if (!isOpen) return null;
  const {
    code,
    queueNumber,
    serviceName,
    room,
    doctorOrStaff,
    date,
    time,
    fee,
    isDoctor
  } = appointmentData;

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white w-11/12 md:w-2/3 lg:w-1/2 rounded-xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center bg-blue-600 px-6 py-4">
          <h2 className="text-white text-lg font-semibold">Phiếu Khám Bệnh</h2>
          <button onClick={onClose} className="text-white hover:text-gray-200">✕</button>
        </div>
        {/* Body */}
        <div className="p-6 space-y-6">
          <div className="text-gray-700 grid grid-cols-2 gap-4">
            <div><strong className="font-medium">Số thứ tự:</strong> {queueNumber}</div>
            <div><strong className="font-medium">Dịch vụ:</strong> {serviceName}</div>
            <div><strong className="font-medium">Phòng:</strong> {room}</div>
            <div><strong className="font-medium">{isDoctor ? 'Bác sĩ' : 'Nhân viên'}:</strong> {doctorOrStaff}</div>
            <div><strong className="font-medium">Ngày:</strong> {date}</div>
            <div><strong className="font-medium">Giờ:</strong> {time}</div>
            <div className="col-span-2"><strong className="font-medium">Phí khám:</strong> <span className="text-green-600">{fee}</span></div>
          </div>
          <div className="bg-yellow-50 p-4 rounded text-sm text-gray-700">
            <ul className="list-disc list-inside space-y-1">
              <li>Đến trước giờ hẹn ít nhất 15 phút.</li>
              <li>Mang theo CCCD/CMND và thẻ bảo hiểm.</li>
              <li>Giữ lại phiếu để check-in.</li>
              <li>Liên hệ Hotline nếu cần hỗ trợ.</li>
            </ul>
          </div>
          <div className="flex justify-end space-x-4">
            <button onClick={() => window.print()} className="px-5 py-2 border border-gray-300 rounded-md hover:bg-gray-100">In phiếu</button>
            <button onClick={onClose} className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Đóng</button>
          </div>
        </div>
      </div>
    </div>, document.body
  );
};

export default AppointmentSuccessModal;
