import React from 'react';
import { useLocation, Link } from 'react-router-dom';

// Hàm format thời gian
function formatDateTime(str) {
  if (!str) return "-";
  // Nếu là dạng "YYYY-MM-DD HH:mm:ss.SSS" hoặc "YYYY-MM-DD HH:mm:ss"
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/.test(str)) {
    const [date, time] = str.split(' ');
    const [year, month, day] = date.split('-');
    const [hour, min] = time.split(':');
    return `${hour}:${min} ${day}/${month}/${year}`;
  }
  // Nếu là dạng "HH:mm:ss DD/MM/YYYY" hoặc "HH:mm:ss DD/M/YYYY"
  if (/^\d{2}:\d{2}:\d{2} \d{1,2}\/\d{1,2}\/\d{4}$/.test(str)) {
    const [time, date] = str.split(' ');
    const [hour, min] = time.split(':');
    const [day, month, year] = date.split('/');
    const paddedDay = day.padStart(2, '0');
    const paddedMonth = month.padStart(2, '0');
    return `${hour}:${min} ${paddedDay}/${paddedMonth}/${year}`;
  }
  // Nếu là ISO format (YYYY-MM-DDTHH:mm:ss.sssZ)
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(str)) {
    const [date, time] = str.split('T');
    const [year, month, day] = date.split('-');
    const [hour, min] = time.split(':');
    return `${hour}:${min} ${day}/${month}/${year}`;
  }
  // Nếu là ISO hoặc dạng khác, fallback về cũ
  const d = new Date(str);
  if (isNaN(d.getTime())) return str;
  const day = d.getDate().toString().padStart(2, "0");
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const year = d.getFullYear();
  const hour = d.getHours().toString().padStart(2, "0");
  const min = d.getMinutes().toString().padStart(2, "0");
  return `${hour}:${min} ${day}/${month}/${year}`;
}

const LabResult = () => {
  const { state } = useLocation();
  const { note, results, patient, testType, room } = state || {};

  if (!note || !results || results.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-red-600 font-bold">
        Không có dữ liệu kết quả. Note: {!!note}, Results: {results?.length || 0}
      </div>
    );
  }

  // Tính tuổi và thời gian trả kết quả
  const age = note?.dob ? new Date().getFullYear() - new Date(note.dob).getFullYear() : '-';
  const birthYear = note?.dob ? new Date(note.dob).getFullYear() : '-';
  
  // Lọc kết quả mới nhất cho mỗi loại test (tránh duplicate)
  const latestResults = results.reduce((acc, result) => {
    const existing = acc.find(r => r.test_type_name === result.test_type_name);
    if (!existing || new Date(result.created_at) > new Date(existing.created_at)) {
      // Thay thế kết quả cũ bằng kết quả mới hơn
      const filtered = acc.filter(r => r.test_type_name !== result.test_type_name);
      return [...filtered, result];
    }
    return acc;
  }, []);
  
  // Thời gian trả kết quả: lấy thời gian tạo kết quả mới nhất (đã format từ backend)
  const resultTime = latestResults.length > 0 ? 
    latestResults[latestResults.length - 1].created_at : '-';
  
  // Thời gian nhận mẫu: test_datetime đã được format từ backend
  const sampleTime = note.test_datetime || '-';

  return (
    <div className="bg-gradient-to-br from-blue-50 to-white min-h-screen p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-8 border border-blue-100">
        <Link to="/lab-staff" className="text-blue-700 hover:underline mb-6 inline-block text-base font-medium transition-colors duration-150">← Quay lại Dashboard</Link>
        <h1 className="text-3xl font-bold text-blue-900 mb-8 tracking-tight">Kết quả xét nghiệm</h1>

        {/* Thông tin Bệnh nhân */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-3 text-blue-800">Thông tin Bệnh nhân</h2>
          <div className="grid grid-cols-2 gap-4 text-base text-gray-700 bg-blue-50 rounded-xl p-4 border border-blue-100 shadow-sm">
            <div><b>Tên:</b> {note?.patient_name || '-'}</div>
            <div><b>Tuổi:</b> {age}</div>
            <div><b>Năm sinh:</b> {birthYear}</div>
            <div><b>Địa chỉ:</b> {note?.address || '-'}</div>
            <div><b>Phòng:</b> {note?.room_name || '-'}</div>
            <div><b>Bác sĩ chỉ định:</b> {note?.source === 'self_booking' ? 'Bệnh nhân tự đăng ký' : (note?.doctor_name || '-')}</div>
            <div><b>Người thực hiện:</b> {note?.created_by_id || '-'}</div>
            <div><b>Thời gian nhận mẫu:</b> {formatDateTime(sampleTime)}</div>
            <div><b>Thời gian trả kết quả:</b> {formatDateTime(resultTime)}</div>
          </div>
        </div>

        {/* Bảng Chi tiết Kết quả */}
        <div>
          <h2 className="text-xl font-semibold mb-3 text-blue-800">Chi tiết Kết quả</h2>
          <div className="overflow-x-auto rounded-xl border border-blue-100 shadow-sm bg-blue-50">
            <table className="w-full border-collapse text-base text-gray-800">
              <thead>
                <tr className="bg-blue-100">
                  <th className="border px-4 py-3 text-left font-semibold">STT</th>
                  <th className="border px-4 py-3 text-left font-semibold">Loại Xét nghiệm</th>
                  <th className="border px-4 py-3 text-left font-semibold">Giá trị Tham chiếu</th>
                  <th className="border px-4 py-3 text-left font-semibold">Kết quả</th>
                  <th className="border px-4 py-3 text-left font-semibold">Đơn vị</th>
                </tr>
              </thead>
              <tbody>
                {latestResults.map((r, idx) => (
                  <tr key={r.result_id} className="odd:bg-white even:bg-blue-50 hover:bg-blue-100 transition-colors">
                    <td className="border px-4 py-2">{idx + 1}</td>
                    <td className="border px-4 py-2">{r.test_type_name || '-'}</td>
                    <td className="border px-4 py-2">{r.reference_range || '-'}</td>
                    <td className="border px-4 py-2 font-bold text-blue-900">{r.result_value || '-'}</td>
                    <td className="border px-4 py-2">{r.unit || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Ghi chú chung dưới bảng */}
          {note.notes && (
            <div className="mt-6 text-base text-gray-700 bg-blue-50 rounded-lg p-4 border border-blue-100 shadow-sm"><b>Ghi chú:</b> {note.notes}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LabResult;

