import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const API_BASE = 'http://localhost:5000VITE_API_API_PREFIX';

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
  const [dynamicResults, setDynamicResults] = useState({});

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
        if (res.data.data && res.data.data.notes) {
          setNote(res.data.data.notes);
        }
        if (res.data.data && res.data.data.test_types) {
          const initial = {};
          res.data.data.test_types.forEach(tt => {
            initial[tt.test_type_id] = '';
          });
          setDynamicResults(initial);
        }
      } catch (err) {
        setTestDetail(null);
      }
    };
    fetchTestNoteDetail();
    // eslint-disable-next-line
  }, [data.test_note_id, data.id]);

  // Xử lý nhập động cho từng test_type
  const handleDynamicChange = (test_type_id, value) => {
    setDynamicResults(prev => ({ ...prev, [test_type_id]: value }));
  };

  const handleDraft = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const test_note_id = data.test_note_id || data.id;
      if (!test_note_id) {
        alert('Không tìm thấy mã phiếu xét nghiệm!');
        return;
      }
      await axios.patch(`${API_BASE}/lab/test-notes/${test_note_id}/notes`, {
        notes: note
      }, { headers });
      alert('Lưu tạm thành công!');
    } catch (err) {
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
      if (note.trim()) {
        await axios.patch(`${API_BASE}/lab/test-notes/${test_note_id}/notes`, {
          notes: note
        }, { headers });
      }
      // Nếu là TestRequest (doctor_request) và có test_types
      if (testDetail?.source === 'doctor_request' && Array.isArray(testDetail.test_types)) {
        const results = testDetail.test_types.map(tt => ({
          test_type_id: tt.test_type_id,
          result_value: dynamicResults[tt.test_type_id],
          unit: tt.unit || '',
          reference_range: tt.normal_range || '',
        }));
        if (results.some(r => !r.result_value)) {
          alert('Vui lòng nhập đầy đủ kết quả cho tất cả các loại xét nghiệm!');
          setSubmitting(false);
          return;
        }
        await axios.post(`${API_BASE}/lab/test-results/bulk`, {
          test_note_id,
          results,
          notes: note
        }, { headers });
        // Gửi email kết quả xét nghiệm
        try {
          await axios.post(`${API_BASE}/lab/send-test-result`, { test_note_id }, { headers });
          alert('Gửi kết quả thành công và đã gửi email cho bệnh nhân!');
        } catch (emailErr) {
          alert('Gửi kết quả thành công nhưng gửi email thất bại! ' + (emailErr?.response?.data?.message || ''));
        }
        navigate('/lab-staff');
        setSubmitting(false);
        return;
      }
      // Nếu là self_booking hoặc các loại khác
      if (serviceId === 3) {
        await axios.post(`${API_BASE}/lab/test-results`, {
          test_note_id,
          test_type_id: 1,
          result_value: cd4Value,
          unit: 'cells/mm³',
          notes: note
        }, { headers });
        await axios.post(`${API_BASE}/lab/test-results`, {
          test_note_id,
          test_type_id: 2,
          result_value: viralLoadValue,
          unit: 'copies/ml',
          notes: note
        }, { headers });
      } else if (serviceId === 4) {
        await axios.post(`${API_BASE}/lab/test-results`, {
          test_note_id,
          test_type_id: 3,
          result_value: screeningResult === 'positive' ? 'Dương tính' : 'Âm tính',
          unit: '',
          notes: note
        }, { headers });
      } else if (serviceId === 5) {
        await axios.post(`${API_BASE}/lab/test-results`, {
          test_note_id,
          test_type_id: 4,
          result_value: review, // "Dương tính" hoặc "Âm tính"
          unit: '',
          notes: note
        }, { headers });
      } else {
        alert('Loại xét nghiệm không hợp lệ!');
        setSubmitting(false);
        return;
      }
      // Gửi email kết quả xét nghiệm cho các loại còn lại
      try {
        await axios.post(`${API_BASE}/lab/send-test-result`, { test_note_id }, { headers });
        alert('Gửi kết quả thành công và đã gửi email cho bệnh nhân!');
      } catch (emailErr) {
        alert('Gửi kết quả thành công nhưng gửi email thất bại! ' + (emailErr?.response?.data?.message || ''));
      }
      navigate('/lab-staff');
    } catch (err) {
      alert('Không thể gửi kết quả! ' + (err?.response?.data?.message || ''));
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-50 py-10 px-2">
      <div className="max-w-4xl mx-auto">
        <Link to="/lab-staff" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-semibold text-base mb-8 transition-colors">
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
          Quay lại hàng đợi
        </Link>
        <div className="bg-white rounded-3xl shadow-2xl border border-blue-200 p-10 md:p-14 flex flex-col gap-10">
          <h1 className="text-4xl font-extrabold text-blue-900 mb-2 tracking-tight text-center drop-shadow-lg">Xử lý mẫu xét nghiệm</h1>
          {/* Thông tin mẫu */}
          <section className="bg-blue-50 rounded-2xl border border-blue-100 shadow-sm p-6 mb-2">
            <h2 className="text-2xl font-bold text-blue-800 mb-4 flex items-center gap-2">
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="#2563eb" strokeWidth="2" d="M12 20v-6m0 0V4m0 10H6m6 0h6"/></svg>
              Thông tin mẫu
            </h2>
            <div className="flex flex-col gap-2 text-lg text-gray-700 mb-4">
              <div><span className="font-semibold">{testDetail?.patient_name || data.name || '—'}</span></div>
              <div>{testDetail?.patient_code || data.code || '—'}</div>
              <div>{testDetail?.age ? `${testDetail.age} tuổi` : (data.age ? `${data.age} tuổi` : '—')}</div>
              <div>{
                testDetail?.gender === 'male' ? 'Nam' :
                testDetail?.gender === 'female' ? 'Nữ' :
                data.gender === 'male' ? 'Nam' :
                data.gender === 'female' ? 'Nữ' :
                '—'
              }</div>
            </div>
            <div className="font-semibold mt-2 mb-1 text-blue-700">Thông tin xét nghiệm</div>
            {Array.isArray(testDetail?.service_names) && testDetail.service_names.length > 0 ? (
              <div className="flex flex-wrap gap-2 mb-1">
                {testDetail.service_names.map(name => (
                  <span key={name} className="inline-block bg-gradient-to-r from-blue-200 to-blue-100 text-blue-900 px-4 py-1 rounded-full text-sm font-semibold shadow">{name}</span>
                ))}
              </div>
            ) : (
              <span className="inline-block bg-gradient-to-r from-blue-200 to-blue-100 text-blue-900 px-4 py-1 rounded-full text-sm font-semibold mb-1 shadow">
                {testDetail?.service_name || testDetail?.test_name || data.service_name || data.test || data.type || 'test'}
              </span>
            )}
            {testDetail && testDetail.source === 'doctor_request' && (
              <div className="text-gray-500 mb-1 italic">BS chỉ định: {testDetail.doctor_name || 'Không rõ'}</div>
            )}
            {testDetail && testDetail.source === 'self_booking' && (
              <div className="text-gray-500 mb-1 italic">Bệnh nhân tự đăng ký</div>
            )}
            <div className="text-green-700 font-semibold mt-1">{testDetail?.status_text || data.status_text || 'Đang xử lý'}</div>
          </section>
          {/* Nhập kết quả */}
          <section className="bg-white rounded-2xl border border-blue-100 shadow p-8">
            <h2 className="text-2xl font-bold text-blue-800 mb-6 flex items-center gap-2">
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="#2563eb" strokeWidth="2" d="M12 20v-6m0 0V4m0 10H6m6 0h6"/></svg>
              Nhập kết quả xét nghiệm
            </h2>
            <div className="space-y-8">
              {testDetail?.source === 'doctor_request' && Array.isArray(testDetail.test_types) && testDetail.test_types.length > 0 ? (
                <>
                  {testDetail.test_types.map(tt => (
                    <div key={tt.test_type_id} className="mb-2">
                      <label className="block text-base font-semibold mb-2 text-gray-700">{tt.name} {tt.unit ? `(${tt.unit})` : ''} <span className="text-red-500">*</span></label>
                      {(tt.name.toLowerCase().includes('sàng lọc') || tt.name.toLowerCase().includes('khẳng định') || tt.service_id === 4 || tt.service_id === 5) ? (
                        <select
                          className="w-full border border-blue-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all shadow bg-blue-50 text-lg"
                          value={dynamicResults[tt.test_type_id] || ''}
                          onChange={e => handleDynamicChange(tt.test_type_id, e.target.value)}
                          required
                        >
                          <option value="">Chọn kết quả</option>
                          <option value="negative">Âm tính</option>
                          <option value="positive">Dương tính</option>
                        </select>
                      ) : (
                        <input
                          type="text"
                          className="w-full border border-blue-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all shadow bg-blue-50 text-lg"
                          value={dynamicResults[tt.test_type_id] || ''}
                          onChange={e => handleDynamicChange(tt.test_type_id, e.target.value)}
                          placeholder={`Nhập kết quả ${tt.name}`}
                          required
                        />
                      )}
                      {tt.reference_range && (
                        <div className="text-xs text-gray-500 mt-1">Khoảng tham chiếu: {tt.reference_range}</div>
                      )}
                    </div>
                  ))}
                </>
              ) : (
                <>
                  {(() => {
                    const serviceId = Number(testDetail?.service_id || data.service_id);
                    const serviceName = (testDetail?.service_name || data.service_name || '').toLowerCase();
                    if (serviceId === 3 || (serviceName.includes('cd4') && serviceName.includes('viral'))) {
                      return (
                        <>
                          <div className="mb-2">
                            <label className="block text-base font-semibold mb-2 text-gray-700">Giá trị CD4 (cells/µL) <span className="text-red-500">*</span></label>
                            <input
                              type="number"
                              className="w-full border border-blue-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all shadow bg-blue-50 text-lg"
                              value={cd4Value}
                              onChange={(e) => setCd4Value(e.target.value)}
                              placeholder="Nhập giá trị CD4"
                              required
                            />
                          </div>
                          <div className="mb-2">
                            <label className="block text-base font-semibold mb-2 text-gray-700">Giá trị Viral Load (copies/mL) <span className="text-red-500">*</span></label>
                            <input
                              type="number"
                              className="w-full border border-blue-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all shadow bg-blue-50 text-lg"
                              value={viralLoadValue}
                              onChange={(e) => setViralLoadValue(e.target.value)}
                              placeholder="Nhập giá trị Viral Load"
                              required
                            />
                          </div>
                        </>
                      );
                    }
                    if (serviceId === 4 || serviceName.includes('sàng lọc')) {
                      return (
                        <div className="mb-2">
                          <label className="block text-base font-semibold mb-2 text-gray-700">Kết quả sàng lọc <span className="text-red-500">*</span></label>
                          <select
                            className="w-full border border-blue-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all shadow bg-blue-50 text-lg"
                            value={screeningResult}
                            onChange={e => setScreeningResult(e.target.value)}
                            required
                          >
                            <option value="">Chọn kết quả</option>
                            <option value="negative">Âm tính</option>
                            <option value="positive">Dương tính</option>
                          </select>
                        </div>
                      );
                    }
                    if (serviceId === 5 || serviceName.includes('khẳng định')) {
                      return (
                        <div className="mb-2">
                          <label className="block text-base font-semibold mb-2 text-gray-700">Kết luận khẳng định <span className="text-red-500">*</span></label>
                          <select
                            className="w-full border border-blue-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all shadow bg-blue-50 text-lg"
                            value={review}
                            onChange={(e) => setReview(e.target.value)}
                            required
                          >
                            <option value="">Chọn kết luận</option>
                            <option value="Dương tính">Dương tính</option>
                            <option value="Âm tính">Âm tính</option>
                          </select>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </>
              )}
              <div>
                <label className="block text-base font-semibold mb-2 text-gray-700">Ghi chú thêm</label>
                <textarea
                  className="w-full border border-blue-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all shadow bg-blue-50 text-lg"
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ghi chú thêm về quá trình xét nghiệm..."
                />
              </div>
              <div className="flex flex-col md:flex-row justify-between mt-10 gap-4">
                <button
                  className="px-8 py-3 border-2 border-blue-400 rounded-full font-bold bg-gradient-to-r from-blue-200 to-blue-100 text-blue-900 hover:from-blue-300 hover:to-blue-200 hover:border-blue-600 transition-all shadow-lg text-lg"
                  onClick={handleDraft}
                >
                  Lưu tạm
                </button>
                <button
                  className="px-8 py-3 bg-gradient-to-r from-blue-700 to-blue-500 text-white rounded-full font-bold hover:from-blue-800 hover:to-blue-600 transition-all shadow-xl text-lg"
                  onClick={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? 'Đang gửi...' : 'Gửi kết quả'}
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default LabProcess;
