import React from 'react';
import { createPortal } from 'react-dom';

const AppointmentSuccessModal = ({ isOpen, onClose, appointmentData }) => {
  if (!isOpen) return null;
  // Destructure appointment data with unique local names to avoid redeclaration
  const {
    queueNumber: _queueNumber,
    serviceName: _serviceName,
    room: _room,
    doctorOrStaff: _doctorOrStaff,
    date: _date,
    time: _time,
    fee: _fee,
    isDoctor: _isDoctor
  } = appointmentData;

  const cleanTime = _time ? _time.replace(/\s*\([^)]*chỗ trống[^)]*\)/, '').trim() : '';

  return createPortal(
    // Backdrop with blur and fade-in
    <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-white w-11/12 md:w-2/3 lg:w-1/2 rounded-xl shadow-xl overflow-hidden">
        {/* Header with gradient */}
        <div className="flex justify-between items-center bg-gradient-to-r from-green-600 to-blue-600 px-6 py-4">
          <h2 className="text-white text-2xl font-semibold">Phiếu Khám Bệnh</h2>
          <button onClick={onClose} className="text-white hover:text-gray-200 text-2xl leading-none">×</button>
        </div>
        {/* Body */}
        <div className="p-8 space-y-8">
          <div className="text-gray-700 grid grid-cols-1 sm:grid-cols-2 gap-6 text-lg">
             <div><strong className="font-medium">Số thứ tự:</strong> {_queueNumber}</div>
             <div><strong className="font-medium">Dịch vụ:</strong> {_serviceName}</div>
             <div><strong className="font-medium">Phòng:</strong> {_room}</div>
             <div><strong className="font-medium">{_isDoctor ? 'Bác sĩ' : 'Nhân viên'}:</strong> {_doctorOrStaff}</div>
             <div><strong className="font-medium">Ngày:</strong> {_date}</div>
             <div><strong className="font-medium">Giờ:</strong> {cleanTime}</div>
             <div className="col-span-full sm:col-span-2"><strong className="font-medium">Phí khám:</strong> <span className="text-green-600">{_fee}</span></div>
           </div>
          <div className="bg-yellow-50 p-4 rounded-lg text-sm text-gray-700">
            <ul className="list-disc list-inside space-y-1">
              <li>Đến trước giờ hẹn ít nhất 15 phút.</li>
              <li>Mang theo CCCD/CMND và thẻ bảo hiểm.</li>
              <li>Giữ lại phiếu để check-in.</li>
              <li>Liên hệ Hotline nếu cần hỗ trợ.</li>
            </ul>
          </div>
          <div className="flex justify-end space-x-4">
            <button onClick={() => window.print()} className="flex items-center space-x-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-100 transition">
              <span className="text-lg">🖨️</span><span>In Phiếu</span>
            </button>
            <button onClick={onClose} className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>, document.body
  );
};

export default AppointmentSuccessModal;
