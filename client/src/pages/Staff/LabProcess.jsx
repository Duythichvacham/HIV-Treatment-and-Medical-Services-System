import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api/v1';

const LabProcess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const data = location.state || {};
  const [screeningResult, setScreeningResult] = useState('');
  const [viralResult, setViralResult] = useState('');
  const [viralLoadValue, setViralLoadValue] = useState('');
  const [cd4Result, setCd4Result] = useState('');
  const [cd4Value, setCd4Value] = useState('');
  const [review, setReview] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [testDetail, setTestDetail] = useState(null);

  useEffect(() => {
    const fetchTestNoteDetail = async () => {
      try {
        const token = localStorage.getItem('token');
        const test_note_id = data.test_note_id || data.id;
        if (!test_note_id) return;
        
        const res = await axios.get(`${API_BASE}/lab/test-notes/${test_note_id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setTestDetail(res.data.data);
        
        // Load notes hiện tại nếu có
        if (res.data.data && res.data.data.notes) {
          setNote(res.data.data.notes);
          console.log('DEBUG: Đã load notes hiện tại:', res.data.data.notes);
        }
      } catch (err) {
        console.error('DEBUG: Lỗi load TestNote detail:', err);
        setTestDetail(null);
      }
    };
    fetchTestNoteDetail();
    // eslint-disable-next-line
  }, [data.test_note_id, data.id]);

  const handleDraft = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const test_note_id = data.test_note_id || data.id;
      
      if (!test_note_id) {
        alert('Không tìm thấy mã phiếu xét nghiệm!');
        return;
      }
      
      // Cập nhật notes trong TestNote
      await axios.patch(`${API_BASE}/lab/test-notes/${test_note_id}/notes`, {
        notes: note
      }, { headers });
      
      alert('Lưu tạm thành công!');
    } catch (err) {
      console.error('DEBUG: Lỗi lưu tạm:', err);
      alert('Không thể lưu tạm! ' + (err?.response?.data?.message || ''));
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const test_note_id = data.test_note_id || data.id;
      const serviceId = Number(testDetail?.service_id || data.service_id);
      
      // Cập nhật notes trong TestNote trước khi tạo kết quả
      if (note.trim()) {
        await axios.patch(`${API_BASE}/lab/test-notes/${test_note_id}/notes`, {
          notes: note
        }, { headers });
        console.log('DEBUG: Đã cập nhật notes cho TestNote:', test_note_id);
      }
      
      // Gửi dữ liệu theo từng loại service
      if (serviceId === 3) {
        // CD4
        await axios.post(`${API_BASE}/lab/test-results`, {
          test_note_id,
          test_type_id: 1,
          result_value: cd4Value,
          unit: 'cells/mm³',
          reference_range: '500-1500',
          notes: note
        }, { headers });
        // Viral Load
        await axios.post(`${API_BASE}/lab/test-results`, {
          test_note_id,
          test_type_id: 2,
          result_value: viralLoadValue,
          unit: 'copies/ml',
          reference_range: '<50',
          notes: note
        }, { headers });
      } else if (serviceId === 4) {
        // Sàng lọc
        await axios.post(`${API_BASE}/lab/test-results`, {
          test_note_id,
          test_type_id: 3,
          result_value: screeningResult === 'positive' ? 'Dương tính' : 'Âm tính',
          unit: '',
          reference_range: '',
          notes: note
        }, { headers });
      } else if (serviceId === 5) {
        // Khẳng định: gửi 1 lần duy nhất với object result_value, unit, reference_range cho từng chỉ số
        await axios.post(`${API_BASE}/lab/test-results`, {
          test_note_id,
          result_value: {
            cd4: cd4Value,
            viral_load: viralLoadValue,
            confirm: review
          },
          unit: {
            cd4: 'cells/mm³',
            viral_load: 'copies/ml',
            confirm: ''
          },
          reference_range: {
            cd4: '500-1500',
            viral_load: '<50',
            confirm: ''
          },
          notes: note
        }, { headers });
      } else {
        alert('Loại xét nghiệm không hợp lệ!');
        setSubmitting(false);
        return;
      }
      
      console.log('DEBUG: Đã gửi kết quả xét nghiệm thành công');
      alert('Gửi kết quả thành công!');
      navigate('/lab-staff');
    } catch (err) {
      console.error('DEBUG: Lỗi gửi kết quả:', err);
      alert('Không thể gửi kết quả! ' + (err?.response?.data?.message || ''));
    }
    setSubmitting(false);
  };

  return (
    <div className="container mx-auto py-6">
      <Link to="/lab-staff" className="text-gray-600 hover:underline mb-4 inline-block">← Quay lại hàng đợi</Link>
      <h1 className="text-2xl font-bold mb-4">Xử lý mẫu xét nghiệm</h1>
      <div className="bg-white rounded-xl shadow p-6 max-w-2xl mx-auto">
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Thông tin mẫu</h2>
          <div className="text-gray-700 mb-1">{testDetail?.patient_name || data.name || '—'}</div>
          <div className="text-gray-500 mb-1">{testDetail?.patient_code || data.code || '—'}</div>
          <div className="text-gray-500 mb-1">{testDetail?.age ? `${testDetail.age} tuổi` : (data.age ? `${data.age} tuổi` : '—')} - {testDetail?.gender || data.gender || '—'}</div>
          <div className="font-semibold mt-2 mb-1">Thông tin xét nghiệm</div>
          <span className="inline-block bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-semibold mb-1">
            {testDetail?.service_name || testDetail?.test_name || data.service_name || data.test || data.type || 'test'}
          </span>
          {/* Hiển thị nguồn mẫu */}
          {testDetail && testDetail.source === 'doctor_request' && (
            <div className="text-gray-500 mb-1">
              BS chỉ định: {testDetail.doctor_name || 'Không rõ'}
            </div>
          )}
          {testDetail && testDetail.source === 'self_booking' && (
            <div className="text-gray-500 mb-1">
              Bệnh nhân tự đăng ký
            </div>
          )}
          <div className="text-green-600 font-semibold">{testDetail?.status_text || data.status_text || 'Đang xử lý'}</div>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Nhập kết quả xét nghiệm</h2>
            <div className="space-y-4">
              {(() => {
                const serviceId = Number(testDetail?.service_id || data.service_id);
                const serviceName = (testDetail?.service_name || data.service_name || '').toLowerCase();
                // CD4 + Viral Load (service_id = 3)
                if (serviceId === 3 || (serviceName.includes('cd4') && serviceName.includes('viral'))) {
                  return (
                    <>
                      <div>
                        <label className="block text-sm font-medium mb-1">Giá trị CD4 (cells/µL) *</label>
                        <input
                          type="number"
                          className="w-full border rounded px-3 py-2"
                          value={cd4Value}
                          onChange={(e) => setCd4Value(e.target.value)}
                          placeholder="Nhập giá trị CD4"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Giá trị Viral Load (copies/mL) *</label>
                        <input
                          type="number"
                          className="w-full border rounded px-3 py-2"
                          value={viralLoadValue}
                          onChange={(e) => setViralLoadValue(e.target.value)}
                          placeholder="Nhập giá trị Viral Load"
                          required
                        />
                      </div>
                    </>
                  );
                }
                // Sàng lọc (service_id = 4)
                if (serviceId === 4 || serviceName.includes('sàng lọc')) {
                  return (
                    <div>
                      <label className="block text-sm font-medium mb-1">Kết quả sàng lọc *</label>
                      <select
                        className="w-full border rounded px-3 py-2"
                        value={screeningResult}
                        onChange={(e) => setScreeningResult(e.target.value)}
                        required
                      >
                        <option value="">Chọn kết quả</option>
                        <option value="positive">Dương tính</option>
                        <option value="negative">Âm tính</option>
                      </select>
                    </div>
                  );
                }
                // Khẳng định (service_id = 5): CD4 + Viral Load + Dropdown kết luận
                if (serviceId === 5 || serviceName.includes('khẳng định')) {
                  return (
                    <>
                      <div>
                        <label className="block text-sm font-medium mb-1">Giá trị CD4 (cells/µL) *</label>
                        <input
                          type="number"
                          className="w-full border rounded px-3 py-2"
                          value={cd4Value}
                          onChange={(e) => setCd4Value(e.target.value)}
                          placeholder="Nhập giá trị CD4"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Giá trị Viral Load (copies/mL) *</label>
                        <input
                          type="number"
                          className="w-full border rounded px-3 py-2"
                          value={viralLoadValue}
                          onChange={(e) => setViralLoadValue(e.target.value)}
                          placeholder="Nhập giá trị Viral Load"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Kết luận khẳng định *</label>
                        <select
                          className="w-full border rounded px-3 py-2"
                          value={review}
                          onChange={(e) => setReview(e.target.value)}
                          required
                        >
                          <option value="">Chọn kết luận</option>
                          <option value="Dương tính">Dương tính</option>
                          <option value="Âm tính">Âm tính</option>
                        </select>
                      </div>
                    </>
                  );
                }
                // Trường hợp khác (fallback)
                return null;
              })()}
              {/* Ghi chú thêm: luôn hiển thị */}
              <div>
                <label className="block text-sm font-medium mb-1">Ghi chú thêm</label>
                <textarea
                  className="w-full border rounded px-3 py-2"
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ghi chú thêm về quá trình xét nghiệm..."
                />
              </div>
              <div className="flex justify-between mt-6">
                <button
                  className="px-6 py-2 border border-gray-300 rounded font-semibold hover:bg-gray-100"
                  onClick={handleDraft}
                >
                  Lưu tạm
                </button>
                <button
                  className="px-6 py-2 bg-blue-900 text-white rounded font-semibold hover:bg-blue-800"
                  onClick={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? 'Đang gửi...' : 'Gửi kết quả'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LabProcess;
