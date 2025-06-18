import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';

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

  const handleDraft = () => {
    // TODO: lưu tạm kết quả
    alert('Lưu tạm thành công!');
  };

  const handleSubmit = () => {
    // TODO: gửi kết quả
    alert('Gửi kết quả thành công!');
    navigate('/lab-staff');
  };

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow p-6">
        {/* Header trang xử lý mẫu */}
        <div className="flex items-center mb-6">
          <Link
            to="/lab-staff"
            className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-100 text-gray-700 text-sm"
          >
            <span className="text-lg">←</span>
            <span className="ml-2">Quay lại hàng đợi</span>
          </Link>
          <h1 className="text-2xl font-semibold text-gray-900 ml-6">Xử lý mẫu xét nghiệm</h1>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          {/* Thông tin mẫu */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Thông tin mẫu</h2>
            <div className="text-lg font-bold mb-1">{data.name || '—'}</div>
            <div className="text-sm text-gray-500 mb-1">{data.code || '—'}</div>
            {data.age && data.gender && (
              <div className="text-sm text-gray-700 mb-1">{data.age} tuổi - {data.gender}</div>
            )}
            {data.time && (
              <div className="text-sm text-gray-700 mb-4">Hẹn lúc: {data.time}</div>
            )}
            <div className="mb-4">
              <div className="text-sm font-medium">Thông tin xét nghiệm</div>
              <div className="mt-2">
                <span className="inline-block bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs">{data.type || ''}</span>
              </div>
            </div>
            <div className="text-xs text-gray-500">BS chỉ định: <b>{data.doctor || '—'}</b></div>
            <div className="mt-2 text-xs text-green-600">Đang xử lý</div>
          </div>

          {/* Form nhập kết quả */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Nhập kết quả xét nghiệm</h2>
            <div className="space-y-4">
              {data.type === 'Sàng lọc' ? (
                <div>
                  <label className="block text-sm font-medium mb-1">Kết quả * (Âm tính/Dương tính)</label>
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
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">Kết quả Viral Load *</label>
                    <select
                      className="w-full border rounded px-3 py-2"
                      value={viralResult}
                      onChange={(e) => setViralResult(e.target.value)}
                      required
                    >
                      <option value="">Chọn kết quả Viral Load</option>
                      <option value="high">Tải lượng virus cao</option>
                      <option value="low">Tải lượng virus thấp</option>
                      <option value="undetectable">Không phát hiện được virus</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Giá trị Viral Load (copies/mL)</label>
                    <input
                      type="number"
                      className="w-full border rounded px-3 py-2"
                      value={viralLoadValue}
                      onChange={(e) => setViralLoadValue(e.target.value)}
                      placeholder="Nhập giá trị Viral Load"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Kết quả CD4 *</label>
                    <select
                      className="w-full border rounded px-3 py-2"
                      value={cd4Result}
                      onChange={(e) => setCd4Result(e.target.value)}
                      required
                    >
                      <option value="">Chọn kết quả CD4</option>
                      <option value="normal">Bình thường</option>
                      <option value="low">Thấp</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Giá trị CD4 (cells/µL)</label>
                    <input
                      type="number"
                      className="w-full border rounded px-3 py-2"
                      value={cd4Value}
                      onChange={(e) => setCd4Value(e.target.value)}
                      placeholder="Nhập giá trị CD4"
                    />
                  </div>
                </>
              )}
              
              <div>
                <label className="block text-sm font-medium mb-1">Đánh giá kết quả</label>
                <textarea
                  className="w-full border rounded px-3 py-2"
                  rows={3}
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  placeholder="Đánh giá và nhận xét về kết quả..."
                />
              </div>
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
                >
                  Gửi kết quả
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
