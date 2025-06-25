import React from 'react';
import { useLocation, Link } from 'react-router-dom';

const LabResult = () => {
  const { state } = useLocation();
  const { note, results, patient, testType, room } = state || {};

  // Debug để xem dữ liệu
  console.log('LabResult state:', state);
  console.log('LabResult note:', note);
  console.log('LabResult results:', results);

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
  
  // Thời gian trả kết quả: lấy thời gian tạo kết quả mới nhất
  const resultTime = latestResults.length > 0 ? new Date(latestResults[latestResults.length - 1].created_at).toLocaleString() : '-';
  
  // Thời gian nhận mẫu: test_datetime là thời gian bắt đầu xét nghiệm
  const sampleTime = note.test_datetime ? new Date(note.test_datetime).toLocaleString() : '-';

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow p-6">
        <Link to="/lab-staff" className="text-gray-600 hover:underline mb-4 inline-block">← Quay lại Dashboard</Link>
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Kết quả xét nghiệm</h1>

        {/* Thông tin Bệnh nhân */}
        <div className="mb-6">
          <h2 className="text-xl font-medium mb-2">Thông tin Bệnh nhân</h2>
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
            <div><b>Tên:</b> {note?.patient_name || '-'}</div>
            <div><b>Tuổi:</b> {age}</div>
            <div><b>Năm sinh:</b> {birthYear}</div>
            <div><b>Địa chỉ:</b> {note?.address || '-'}</div>
            <div><b>Phòng:</b> {note?.room_name || '-'}</div>
            <div><b>Bác sĩ chỉ định:</b> {note?.source === 'self_booking' ? 'Bệnh nhân tự đăng ký' : (note?.doctor_name || '-')}</div>
            <div><b>Người thực hiện:</b> {note?.created_by_id || '-'}</div>
            <div><b>Thời gian nhận mẫu:</b> {sampleTime}</div>
            <div><b>Thời gian trả kết quả:</b> {resultTime}</div>
          </div>
        </div>

        {/* Bảng Chi tiết Kết quả */}
         <div>
            <h2 className="text-xl font-medium mb-2">Chi tiết Kết quả</h2>
          <table className="w-full border-collapse text-sm text-gray-700">
             <thead>
               <tr className="bg-gray-100">
                <th className="border px-3 py-2 text-left">STT</th>
                <th className="border px-3 py-2 text-left">Loại Xét nghiệm</th>
                <th className="border px-3 py-2 text-left">Giá trị Tham chiếu</th>
                <th className="border px-3 py-2 text-left">Kết quả</th>
                <th className="border px-3 py-2 text-left">Đơn vị</th>
               </tr>
             </thead>
             <tbody>
               {latestResults.map((r, idx) => (
                 <tr key={r.result_id} className="odd:bg-white even:bg-gray-50">
                  <td className="border px-3 py-2">{idx + 1}</td>
                  <td className="border px-3 py-2">{r.test_type_name || '-'}</td>
                  <td className="border px-3 py-2">{r.reference_range || '-'}</td>
                  <td className="border px-3 py-2">{r.result_value || '-'}</td>
                  <td className="border px-3 py-2">{r.unit || '-'}</td>
                 </tr>
               ))}
             </tbody>
           </table>
          {/* Ghi chú chung dưới bảng */}
          {note.notes && (
            <div className="mt-4 text-sm text-gray-600"><b>Ghi chú:</b> {note.notes}</div>
          )}
         </div>
       </div>
     </div>
  );
};

export default LabResult;

