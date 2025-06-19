import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
      <div className="bg-blue-600 text-white rounded-full w-7 h-7 flex items-center justify-center font-bold mr-2">{data.id}</div>
      <div className="font-semibold text-lg">{data.name}</div>
    </div>
    <div className="text-xs text-gray-500 mb-1">{data.code}</div>
    <div className="text-sm text-gray-700 mb-1">{data.age} tuổi - {data.gender}</div>
    <div className="text-sm text-gray-700 mb-1">Hẹn lúc: {data.time}</div>
    <div className="text-xs text-gray-400 mb-1">Đặt lúc: {data.bookTime}</div>
    {data.phone && <div className="text-sm text-gray-700 mb-1">📞 {data.phone}</div>}
    <div className="flex flex-wrap gap-2 my-2">
      <span className={`px-2 py-1 rounded text-xs ${data.type === 'Sàng lọc' ? 'bg-yellow-100 text-yellow-700' : data.type === 'Khẳng định' ? 'bg-red-100 text-red-700' : 'bg-purple-100 text-purple-700'}`}>{data.type}</span>
    </div>
    <div className="text-xs text-gray-500 mb-1">BS chỉ định: <b>{data.doctor}</b></div>
    {section === 'Chờ xét nghiệm' && (
      <button onClick={() => onStart(data.id)} className="w-full mt-3 bg-gray-900 text-white py-2 rounded-lg font-semibold hover:bg-gray-800 transition">Bắt đầu xét nghiệm</button>
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

const LabStaff = ({ user }) => {
  const [sections, setSections] = useState(demoData.sections);
  const navigate = useNavigate();

  const handleProcess = (card) => {
    navigate('/lab-process', { state: card });
  };

  const handleStart = (cardId) => {
    setSections(prev => {
      const pendingIndex = prev.findIndex(s => s.title === 'Chờ xét nghiệm');
      const inProgressIndex = prev.findIndex(s => s.title === 'Đang xét nghiệm');
      const pending = { ...prev[pendingIndex] };
      const inProg = { ...prev[inProgressIndex] };
      const card = pending.cards.find(c => c.id === cardId);
      if (!card) return prev;
      pending.cards = pending.cards.filter(c => c.id !== cardId);
      pending.count = pending.cards.length;
      inProg.cards = [...inProg.cards, card];
      inProg.count = inProg.cards.length;
      return prev.map((sec, idx) => idx === pendingIndex ? pending : idx === inProgressIndex ? inProg : sec);
    });
  };

  // View result: navigate to LabResult page with note & results
  const handleViewResult = (card) => {
    const note = {
      test_note_id: card.id,
      request_id: card.id,
      appointment_id: card.id,
      created_by_id: user.name || 'Lab-Staff',
      test_datetime: new Date().toISOString(),
    };
    const results = [
      {
        result_id: card.id,
        test_note_id: card.id,
        result_value: card.result,
        unit: card.type === 'Sàng lọc' ? '' : 'copies/mL',
        reference_range: '',
        notes: '',
        created_at: new Date().toISOString(),
      },
    ];
    navigate('/lab-result', { state: { note, results } });
  };
  
  if (!user || user.role !== 'Lab-Staff') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-red-600 font-bold text-xl">
        Bạn cần đăng nhập với vai trò Lab-Staff để truy cập trang này.
      </div>
    );
  }
  return (
    <div className="bg-blue-50 min-h-screen py-6 px-2 md:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Dashboard Nhân viên Xét nghiệm</h1>
        <div className="text-gray-600 mb-6">Quản lý mẫu xét nghiệm từ bác sĩ chỉ định và đăng ký xét nghiệm</div>
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
