import React from 'react';
import { useLocation, Link } from 'react-router-dom';

const LabResult = () => {
  const { state } = useLocation();
  const { note, results, patient, serviceName, testType, room } = state || {};

  if (!note || !results) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-red-600 font-bold">
        Không có dữ liệu kết quả.
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow p-6">
        <Link to="/lab-staff" className="text-gray-600 hover:underline mb-4 inline-block">← Quay lại Dashboard</Link>
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Kết quả xét nghiệm</h1>

        {/* Thông tin bệnh nhân */}
        {patient && (
          <div className="mb-6">
            <h2 className="text-xl font-medium mb-2">Thông tin bệnh nhân</h2>
            <div className="space-y-1 text-sm text-gray-700">
              <div><b>Họ tên:</b> {patient.name}</div>
              <div><b>Mã BN:</b> {patient.code}</div>
              <div><b>Ngày sinh:</b> {patient.dob || '-'}</div>
              <div><b>Giới tính:</b> {patient.gender || '-'}</div>
            </div>
          </div>
        )}

        {/* Thông tin phiếu xét nghiệm */}
        <div className="mb-6">
          <h2 className="text-xl font-medium mb-2">Thông tin phiếu xét nghiệm</h2>
          <div className="space-y-1 text-sm text-gray-700">
            <div><b>Mã phiếu:</b> {note.test_note_id}</div>
            <div><b>Mã yêu cầu:</b> {note.request_id || '-'}</div>
            <div><b>Mã lịch hẹn:</b> {note.appointment_id || '-'}</div>
            <div><b>Người tạo:</b> {note.created_by_id}</div>
            <div><b>Thời gian thực hiện:</b> {new Date(note.test_datetime).toLocaleString()}</div>
          </div>
        </div>

        {/* Thông tin xét nghiệm */}
        <div className="mb-6">
          <h2 className="text-xl font-medium mb-2">Thông tin xét nghiệm</h2>
          <div className="space-y-1 text-sm text-gray-700">
            <div><b>Loại xét nghiệm:</b> {testType || note.type}</div>
            <div><b>Dịch vụ:</b> {serviceName || note.serviceName}</div>
            <div><b>Người thực hiện:</b> {note.created_by_id}</div>
            <div><b>Thời gian thực hiện:</b> {new Date(note.test_datetime).toLocaleString()}</div>
            <div><b>Phòng:</b> {room || note.room}</div>
          </div>
        </div>

        {/* Kết quả xét nghiệm */}
        <div>
          <h2 className="text-xl font-medium mb-2">Chi tiết kết quả</h2>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-3 py-2 text-left">Mã kết quả</th>
                <th className="border px-3 py-2 text-left">Giá trị</th>
                <th className="border px-3 py-2 text-left">Đơn vị</th>
                <th className="border px-3 py-2 text-left">Khoảng tham chiếu</th>
                <th className="border px-3 py-2 text-left">Ghi chú</th>
                <th className="border px-3 py-2 text-left">Thời gian</th>
              </tr>
            </thead>
            <tbody>
              {results.map(r => (
                <tr key={r.result_id} className="odd:bg-white even:bg-gray-50">
                  <td className="border px-3 py-2">{r.result_id}</td>
                  <td className="border px-3 py-2">{r.result_value}</td>
                  <td className="border px-3 py-2">{r.unit || '-'}</td>
                  <td className="border px-3 py-2">{r.reference_range || '-'}</td>
                  <td className="border px-3 py-2">{r.notes || '-'}</td>
                  <td className="border px-3 py-2">{new Date(r.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LabResult;
