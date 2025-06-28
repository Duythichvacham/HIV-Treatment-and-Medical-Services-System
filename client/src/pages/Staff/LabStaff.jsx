import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getAllLabTests, getCurrentLabStaffShift } from '../../services/api';
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

// Hàm format thời gian đẹp
function formatDateTime(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return isoString;
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  const hour = d.getHours().toString().padStart(2, '0');
  const min = d.getMinutes().toString().padStart(2, '0');
  return `${day}/${month}/${year} ${hour}:${min}`;
}

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
    <div className="text-xs text-gray-400 mb-1">Đặt lúc: {formatDateTime(data.bookTime)}</div>
    {data.phone && <div className="text-sm text-gray-700 mb-1">📞 {data.phone}</div>}
    <div className="flex flex-wrap gap-2 my-2">
      <span className={`px-2 py-1 rounded text-xs ${data.type === 'Sàng lọc' ? 'bg-yellow-100 text-yellow-700' : data.type === 'Khẳng định' ? 'bg-red-100 text-red-700' : 'bg-purple-100 text-purple-700'}`}>{data.type_name}</span>
    </div>
    {/* Hiển thị tải lượng CD4 và Viral Load gần nhất */}
    <div className="text-xs text-gray-600 mb-1">
      CD4 gần nhất: <b>{data.latest_cd4 !== undefined && data.latest_cd4 !== null ? data.latest_cd4 : 'Chưa có'}</b> | 
      Viral Load gần nhất: <b>{data.latest_viral_load !== undefined && data.latest_viral_load !== null ? data.latest_viral_load : 'Chưa có'}</b>
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
  const [hasShift, setHasShift] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Sử dụng API mới để lấy tất cả dữ liệu một lần
      // Thêm lab_staff_id filter nếu user có lab_staff_id
      const lab_staff_id = user?.id;
      const allTests = await getAllLabTests(null, selectedDate, lab_staff_id);
      
      // Phân loại dữ liệu theo status
      const queue = allTests.filter(test => test.status === 'requested');
      const inProgress = allTests.filter(test => test.status === 'in_progress');
      const done = allTests.filter(test => test.status === 'completed');
      
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
    const fetchShift = async () => {
      if (user?.id && selectedDate) {
        try {
          const shift = await getCurrentLabStaffShift(user.id, selectedDate);
          setHasShift(!!shift);
        } catch (e) {
          setHasShift(false);
        }
      }
    };
    fetchShift();
    // eslint-disable-next-line
  }, [selectedDate]);

  const handleStart = async (card) => {
    if (!hasShift) {
      alert('Bạn không được phân công ca làm việc trong ngày này!');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      // 1. Đổi status sang in_progress
      if (card.source === 'doctor_request') {
        const url = `${API_BASE}/test-requests/${card.id}/status`;
        await axios.patch(url, { status: 'in_progress' }, { headers });
      } else if (card.source === 'self_booking') {
        const url = `${API_BASE}/appointments/${card.appointment_id}/status`;
        await axios.post(url, { status: 'in_progress' }, { headers });
      } else {
        alert('Không xác định được loại mẫu xét nghiệm!');
        return;
      }

      // 2. Tạo TestNote (nếu chưa có, backend sẽ trả về bản ghi cũ nếu đã tồn tại)
      const payload = { created_by_id: user.id };
      if (card.source === 'doctor_request') {
        payload.test_request_id = card.id;
        if (card.appointment_id) payload.appointment_id = card.appointment_id;
      } else if (card.source === 'self_booking') {
        payload.appointment_id = card.appointment_id;
      }
      const res = await axios.post(`${API_BASE}/lab/test-notes`, payload, { headers });
      const test_note_id = res.data.data.test_note_id;

      // 3. Cập nhật lại thời gian bắt đầu xét nghiệm
      await axios.patch(`${API_BASE}/lab/test-notes/${test_note_id}/datetime`, {
        test_datetime: new Date().toISOString()
      }, { headers });

      // 4. Cập nhật lại danh sách
      await fetchData();
    } catch (err) {
      alert('Không thể bắt đầu xét nghiệm! ' + (err?.response?.data?.message || ''));
    }
  };

  const handleProcess = async (card) => {
    if (!hasShift) {
      alert('Bạn không được phân công ca làm việc trong ngày này!');
      return;
    }
    // Không tạo mới TestNote nữa!
    // Chỉ lấy test_note_id từ card và chuyển sang trang nhập kết quả
    const test_note_id = card.test_note_id;
    if (!test_note_id) {
      alert('Không tìm thấy phiếu xét nghiệm!');
      return;
    }
    navigate('/lab-process', { state: { ...card, test_note_id } });
  };

  const handleViewResult = async (card) => {
    const test_note_id = card.test_note_id || card.id;
    if (!test_note_id) {
      alert('Không tìm thấy mã phiếu xét nghiệm!');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      // Lấy chi tiết phiếu xét nghiệm
      const noteRes = await axios.get(`${API_BASE}/lab/test-notes/${test_note_id}`, { headers });
      // Lấy kết quả xét nghiệm từ API riêng
      const resultsRes = await axios.get(`${API_BASE}/lab/test-results/${test_note_id}`, { headers });
      
      const note = noteRes.data.data;
      const results = resultsRes.data.data || [];
      
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
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-4">Quản lý xét nghiệm</h1>
      {/* Nếu không có ca làm việc và có lab_staff_id thì báo */}
      {user?.id && !hasShift && !loading && (
        <div className="text-center text-red-600 font-semibold text-lg my-8">
          Bạn không được phân công ca làm việc trong ngày này. Chỉ xem được danh sách bệnh nhân.
        </div>
      )}
      <div className="max-w-7xl mx-auto">
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
                [...section.cards].sort((a, b) => (a.stt || 0) - (b.stt || 0)).map(card => (
                  <Card
                    key={
                      (card.test_note_id !== undefined && card.test_note_id !== null)
                        ? `note-${card.test_note_id}`
                        : (card.appointment_id !== undefined && card.appointment_id !== null)
                          ? `app-${card.appointment_id}`
                          : (card.id !== undefined && card.id !== null)
                            ? `id-${card.id}`
                            : Math.random()
                    }
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
