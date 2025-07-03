import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getLabQueue, getLabInProgress, getLabDone } from '../../services/api';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api/v1';

const demoData = {
  summary: [
    { label: 'XN Sàng lọc', value: 8, color: 'text-yellow-500', icon: '🧪' },
    { label: 'XN Khẳng định', value: 9, color: 'text-red-500', icon: '📄' },
    { label: 'XN Định kỳ', value: 10, color: 'text-purple-500', icon: '✔️' },
  ],
  sections: [
    {
      title: 'Chờ xét nghiệm', color: 'border-yellow-400', icon: '🕒', count: 2, cards: [
        {
          id: 1, name: 'Nguyễn Văn A', code: 'HIV001', age: 35, gender: 'Nam', time: '08:30', bookTime: '07:15:00 1/6/2024', phone: '0901234567',
          test: 'HIV sàng lọc', type: 'Sàng lọc', doctor: 'BS. Nguyễn Văn C',
        },
        {
          id: 2, name: 'Trần Thị B', code: 'HIV003', age: 42, gender: 'Nữ', time: '09:30', bookTime: '07:36:00 1/6/2024', phone: '0987654321',
          test: 'Tải lượng CD4', type: 'Định kỳ', doctor: 'BS. Nguyễn Thị E',
        },
      ]
    },
    {
      title: 'Đang xét nghiệm', color: 'border-blue-500', icon: '🔬', count: 2, cards: [
        {
          id: 3, name: 'Bệnh nhân ẩn danh', code: 'HIV002', age: 28, gender: 'Nữ', time: '09:00', bookTime: '08:45:00 1/6/2024', phone: '',
          test: 'Tải lượng HIV (Viral Load)', type: 'Khẳng định', doctor: 'BS. Trần Thị D',
        },
        {
          id: 4, name: 'Hoàng Văn E', code: 'HIV006', age: 45, gender: 'Nam', time: '11:00', bookTime: '10:00:00 1/6/2024', phone: '0321654987',
          test: 'Tải lượng CD4', type: 'Khẳng định', doctor: 'BS. Nguyễn Thị H',
        },
      ]
    },
    {
      title: 'Hoàn thành', color: 'border-green-500', icon: '✅', count: 2, cards: [
        {
          id: 5, name: 'Lê Văn C', code: 'HIV004', age: 39, gender: 'Nam', time: '10:00', bookTime: '09:15:00 1/6/2024', phone: '0123456789',
          test: 'HIV sàng lọc', type: 'Sàng lọc', doctor: 'BS. Phạm Thị F', result: 'Dương tính', doneTime: '11:30',
        },
        {
          id: 6, name: 'Phạm Thị D', code: 'HIV005', age: 31, gender: 'Nữ', time: '10:30', bookTime: '09:30:00 1/6/2024', phone: '0987123456',
          test: 'Tải lượng CD4', type: 'Định kỳ', doctor: 'BS. Nguyễn Thị G', result: 'Âm tính', doneTime: '12:00',
        },
      ]
    },
  ]
};

const Card = ({ data, section, onStart, onProcess, onResult }) => (
  <div className="bg-white rounded-xl p-5 shadow border mb-4">
    <div className="flex items-center mb-2">
      {/* Bỏ avatar tròn, chỉ hiển thị STT/id/code dạng text */}
      <div className="font-bold text-blue-700 mr-2">
        {data.stt !== undefined && data.stt !== null
          ? `STT: ${data.stt}`
          : (data.id || data.code)}
      </div>
      <div className="font-semibold text-lg">{data.patient_name || data.name}</div>
    </div>
    <div className="text-xs text-gray-500 mb-1">{data.code}</div>
    <div className="text-sm text-gray-700 mb-1">{data.age} tuổi - {data.gender}</div>
    {/* Không hiển thị time vì đăng ký xét nghiệm không có khung giờ */}
    <div className="text-xs text-gray-400 mb-1">Đặt lúc: {data.bookTime}</div>
    {data.phone && <div className="text-sm text-gray-700 mb-1">📞 {data.phone}</div>}
    <div className="flex flex-wrap gap-2 my-2">
      <span className={`px-2 py-1 rounded text-xs ${data.type === 'Sàng lọc' ? 'bg-yellow-100 text-yellow-700' : data.type === 'Khẳng định' ? 'bg-red-100 text-red-700' : 'bg-purple-100 text-purple-700'}`}>{data.type_name}</span>
    </div>
    <div className="text-xs text-gray-500 mb-1">
      {data.source === 'doctor_request' ? (
        <>Nguồn: <span className="font-semibold text-blue-700">Bác sĩ chỉ định</span>{data.doctor ? <> - BS: <b>{data.doctor}</b></> : null}</>
      ) : data.source === 'self_booking' ? (
        <><span className="font-semibold text-green-700">Bệnh nhân tự đăng ký</span></>
      ) : data.id ? (
        <>BS chỉ định: <b>{data.doctor}</b></>
      ) : (
        <b>Đăng kí xét nghiệm</b>
      )}
    </div>
    {section === 'Chờ xét nghiệm' && (
      <button onClick={() => onStart(data)} className="w-full mt-3 bg-gray-900 text-white py-2 rounded-lg font-semibold hover:bg-gray-800 transition">Bắt đầu xét nghiệm</button>
    )}
    {section === 'Đang xét nghiệm' && (
      <button onClick={() => onProcess(data)} className="w-full mt-3 bg-gray-200 text-gray-800 py-2 rounded-lg font-semibold hover:bg-gray-300 transition">Nhập kết quả</button>
    )}
    {section === 'Hoàn thành' && (
      <>
        <div className="bg-green-50 border border-green-200 rounded p-2 my-2 text-xs text-green-700">
          Kết quả: <b>{data.result}</b><br/>Hoàn thành: {data.doneTime}
        </div>
        <button
          onClick={() => onResult && onResult(data)}
          className="w-full mt-1 bg-white border border-green-400 text-green-700 py-2 rounded-lg font-semibold hover:bg-green-50 transition"
        >
          Xem kết quả
        </button>
      </>
    )}
  </div>
);

const LabStaff = () => {
  const [sections, setSections] = useState([
    { title: 'Chờ xét nghiệm', color: 'border-yellow-400', icon: '🕒', count: 0, cards: [] },
    { title: 'Đang xét nghiệm', color: 'border-blue-500', icon: '🔬', count: 0, cards: [] },
    { title: 'Hoàn thành', color: 'border-green-500', icon: '✅', count: 0, cards: [] },
  ]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(() => {
    return localStorage.getItem('lab_selected_date') || new Date().toISOString().slice(0, 10);
  });
  const navigate = useNavigate();
  const { user } = useAuth();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [queue, inProgress, done] = await Promise.all([
        getLabQueue(selectedDate),
        getLabInProgress(selectedDate),
        getLabDone(selectedDate),
      ]);
      console.log('DEBUG queue:', queue);
      console.log('DEBUG inProgress:', inProgress);
      console.log('DEBUG done:', done);
      setSections(prevSections => [
        { ...prevSections[0], cards: queue || [], count: (queue || []).length },
        { ...prevSections[1], cards: inProgress || [], count: (inProgress || []).length },
        { ...prevSections[2], cards: done || [], count: (done || []).length },
      ]);
    } catch (err) {
      console.error('Lỗi tải dữ liệu lab:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [selectedDate]);

  const handleStart = async (card) => {
    try {
      console.log('DEBUG handleStart card:', card);
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      if (card.source === 'doctor_request') {
        const url = `${API_BASE}/test-requests/${card.id}/status`;
        console.log('DEBUG PATCH:', url, { status: 'in_progress' });
        await axios.patch(url, { status: 'in_progress' }, { headers });
      } else if (card.source === 'self_booking') {
        const url = `${API_BASE}/appointments/${card.appointment_id}/status`;
        console.log('DEBUG POST:', url, { status: 'in_progress' }, 'appointment_id:', card.appointment_id);
        await axios.post(url, { status: 'in_progress' }, { headers });
      } else {
        alert('Không xác định được loại mẫu xét nghiệm!');
        return;
      }
      await fetchData();
    } catch (err) {
      console.error('DEBUG handleStart error:', err, err?.response?.data);
      alert('Không thể cập nhật trạng thái!');
    }
  };

  const handleProcess = (card) => {
    navigate('/lab-process', { state: card });
  };

  const handleViewResult = async (card) => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      // Lấy chi tiết phiếu xét nghiệm
      const noteRes = await axios.get(`${API_BASE}/lab/test-notes/${card.test_note_id || card.id}`, { headers });
      // Lấy kết quả xét nghiệm (giả định trả về trong noteRes.data.data.results hoặc cần gọi API khác)
      const note = noteRes.data.data;
      const results = note?.results || [];
      navigate('/lab-result', { state: { note, results } });
    } catch (err) {
      alert('Không thể lấy chi tiết kết quả!');
    }
  };

  if (!user || user.role !== 'Lab-Staff') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-red-600 font-bold text-xl">
        Bạn cần đăng nhập với vai trò Lab-Staff để truy cập trang này.
      </div>
    );
  }
  if (loading) return <div className="min-h-[60vh] flex items-center justify-center text-blue-600 font-bold text-xl">Đang tải dữ liệu...</div>;
  console.log('DEBUG sections:', sections);
  return (
    <div className="bg-blue-50 min-h-screen py-6 px-2 md:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Dashboard Nhân viên Xét nghiệm</h1>
        <div className="text-gray-600 mb-6">Quản lý mẫu xét nghiệm từ bác sĩ chỉ định và đăng ký xét nghiệm</div>
        {/* Chọn ngày */}
        <div className="mb-6 flex items-center gap-3">
          <label className="font-medium">Chọn ngày:</label>
          <input
            type="date"
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-200"
            value={selectedDate}
            onChange={e => {
              setSelectedDate(e.target.value);
              localStorage.setItem('lab_selected_date', e.target.value);
            }}
          />
        </div>
        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {demoData.summary.map((s, i) => (
            <div key={i} className="bg-white rounded-xl shadow p-5 flex items-center gap-4">
              <div className={`text-3xl ${s.color}`}>{s.icon}</div>
              <div>
                <div className="text-2xl font-bold">{s.value}</div>
                <div className="text-gray-700 font-medium text-sm">{s.label}</div>
              </div>
            </div>
          ))}
        </div>
        {/* Search */}
        <div className="mb-6">
          <input className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-200" placeholder="Tìm theo tên, mã bệnh nhân hoặc xét nghiệm..." />
        </div>        {/* Sections */}
        <div className="grid md:grid-cols-3 gap-6">
          {sections.map((section) => (
            <div key={section.title} className={`border-t-4 ${section.color} bg-white rounded-xl shadow p-4 flex-1 min-w-0`}>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">{section.icon}</span>
                <span className={`font-bold text-lg ${section.color.replace('border-', 'text-')}`}>{section.title} ({section.count})</span>
              </div>
              {section.cards.length === 0 ? (
                <div className="text-center text-gray-500 py-4">Không có mẫu xét nghiệm nào.</div>
              ) : (
                (section.title === 'Chờ xét nghiệm'
                  ? [...section.cards].sort((a, b) => new Date(a.bookTime) - new Date(b.bookTime))
                  : section.cards
                ).map(card => (
                  <Card
                    key={card.id}
                    data={card}
                    section={section.title}
                    onStart={handleStart}
                    onProcess={handleProcess}
                    onResult={handleViewResult}
                  />
                ))
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LabStaff;
