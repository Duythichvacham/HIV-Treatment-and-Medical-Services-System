import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api/v1';

const LabResult = () => {
  const { state } = useLocation();
  const { note, patient, testType, room } = state || {};
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      if (!note?.test_note_id) return setLoading(false);
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_BASE}/lab/test-results/${note.test_note_id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setResults(res.data.data || []);
      } catch (err) {
        setResults([]);
      }
      setLoading(false);
    };
    fetchResults();
  }, [note?.test_note_id]);

  if (!note || (!results && !loading)) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-red-600 font-bold">
        Không có dữ liệu kết quả.
      </div>
    );
  }

  // Lấy thông tin từ note (ưu tiên backend mới)
  const age = note?.dob ? new Date().getFullYear() - new Date(note.dob).getFullYear() : '-';
  const birthYear = note?.dob ? new Date(note.dob).getFullYear() : '-';
  const sampleTime = note?.test_datetime ? new Date(note.test_datetime).toLocaleString() : '-';
  const resultTime = note?.created_at ? new Date(note.created_at).toLocaleString() : '-';

  // Xác định loại phiếu
  const type = (note?.test_type_name || note?.service_name || '').toLowerCase();
  const isScreening = type.includes('sàng lọc');
  const isConfirm = type.includes('khẳng định');
  const isCD4 = type.includes('cd4');
  const isViral = type.includes('viral');

  // Lọc kết quả
  const cd4Result = results.find(r => (r.test_type_name || '').toLowerCase().includes('cd4'));
  const viralResult = results.find(r => (r.test_type_name || '').toLowerCase().includes('viral'));
  // Kết luận (nếu có)
  const conclusion = note?.review || note?.result_value || results[0]?.result_value || '-';

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

        {/* Kết quả xét nghiệm */}
        <div>
          <h2 className="text-xl font-medium mb-2">Chi tiết Kết quả</h2>
          {/* Sàng lọc: chỉ hiện kết luận, ẩn bảng */}
          {isScreening ? (
            <div className="mt-6 text-lg font-bold text-center">
              Kết luận: <span className={conclusion === 'Dương tính' ? 'text-red-600' : 'text-green-600'}>{conclusion}</span>
            </div>
          ) : (
            <>
              {/* Khẳng định hoặc CD4/Viral Load */}
              {(isConfirm || isCD4 || isViral) && (
                <table className="w-full border-collapse text-sm text-gray-700">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border px-3 py-2 text-left">Chỉ số</th>
                      <th className="border px-3 py-2 text-left">Kết quả</th>
                      <th className="border px-3 py-2 text-left">Đơn vị</th>
                      <th className="border px-3 py-2 text-left">Giá trị Tham chiếu</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cd4Result && (
                      <tr>
                        <td className="border px-3 py-2">CD4</td>
                        <td className="border px-3 py-2">{cd4Result.result_value || '-'}</td>
                        <td className="border px-3 py-2">{cd4Result.unit || '-'}</td>
                        <td className="border px-3 py-2">{cd4Result.reference_range || '-'}</td>
                      </tr>
                    )}
                    {viralResult && (
                      <tr>
                        <td className="border px-3 py-2">Viral Load</td>
                        <td className="border px-3 py-2">{viralResult.result_value || '-'}</td>
                        <td className="border px-3 py-2">{viralResult.unit || '-'}</td>
                        <td className="border px-3 py-2">{viralResult.reference_range || '-'}</td>
                      </tr>
                    )}
                    {/* Nếu là khẳng định, thêm dòng kết luận */}
                    {isConfirm && (
                      <tr>
                        <td colSpan={4} className="font-bold text-center bg-gray-50">
                          Kết luận: <span className={conclusion === 'Dương tính' ? 'text-red-600' : 'text-green-600'}>{conclusion}</span>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </>
          )}
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

