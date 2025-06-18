import React from 'react';

const specialties = [
  'Điều trị HIV/AIDS',
  'Xét nghiệm HIV',
  'Tư vấn tâm lý',
  'Dự phòng HIV',
  'HIV ở trẻ em',
  'HIV ở phụ nữ',
  'Nghiên cứu HIV',
];

const doctors = [
  {
    id: 1,
    name: 'TS.BS. Nguyễn Văn Minh',
    title: 'Giám đốc Y khoa',
    specialties: ['HIV/AIDS', 'Bệnh nhiễm trùng'],
    experience: '20+ năm kinh nghiệm',
    education: 'Tiến sỹ Y khoa - Đại học Y Hà Nội',
    schedule: 'Thứ 2-6: 8:00-17:00',
    image: 'https://randomuser.me/api/portraits/men/45.jpg',
  },
  {
    id: 2,
    name: 'BS.CKI. Trần Thị Hoa',
    title: 'Phó Giám đốc Chuyên môn',
    specialties: ['HIV/AIDS ở phụ nữ', 'HIV ở trẻ em'],
    experience: '15+ năm kinh nghiệm',
    education: 'BS.CK I - Đại học Y Dược TP.HCM',
    schedule: 'Thứ 2-6: 8:00-17:00',
    image: 'https://randomuser.me/api/portraits/women/65.jpg',
  },
  {
    id: 3,
    name: 'ThS.BS. Lê Hoàng Nam',
    title: 'Trưởng khoa Xét nghiệm',
    specialties: ['Xét nghiệm HIV', 'Sinh học phân tử'],
    experience: '12+ năm kinh nghiệm',
    education: 'Thạc sỹ Y học - Đại học Y Hà Nội',
    schedule: 'Thứ 2-6: 7:00-16:00',
    image: 'https://randomuser.me/api/portraits/men/75.jpg',
  },
];

const ChuyenGia = () => {
  return (
    <div className="pb-16">
      {/* Hero */}
      <section className="bg-gradient-to-r from-purple-500 to-green-500 text-white py-20 px-4 text-center">
        <h1 className="text-4xl font-bold mb-4">Đội Ngũ Chuyên Gia</h1>
        <p className="text-lg mb-6">Gặp gỡ đội ngũ bác sĩ và chuyên gia hàng đầu về HIV/AIDS, cam kết mang đến dịch vụ chăm sóc tốt nhất cho bạn.</p>
        <button className="bg-white text-gray-800 px-6 py-2 rounded-full font-semibold hover:bg-gray-100 transition">{doctors.length} chuyên gia giàu kinh nghiệm</button>
      </section>

      {/* Specialties */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto text-center mb-10">
          <h2 className="text-3xl font-bold mb-2">Chuyên Khoa</h2>
          <p className="text-gray-600">Các lĩnh vực chuyên môn của đội ngũ bác sĩ</p>
        </div>
        <div className="max-w-5xl mx-auto flex flex-wrap justify-center gap-4">
          {specialties.map((s, idx) => (
            <span key={idx} className="px-4 py-2 border rounded-full text-sm text-gray-700 hover:bg-gray-100 transition cursor-pointer">{s}</span>
          ))}
        </div>
      </section>

      {/* Doctors */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto text-center mb-10">
          <h2 className="text-3xl font-bold mb-2">Bác Sĩ & Chuyên Gia</h2>
          <p className="text-gray-600">Đội ngũ chuyên gia giàu kinh nghiệm, tận tâm chăm sóc sức khỏe của bạn</p>
        </div>
        <div className="max-w-6xl mx-auto grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 px-4">
          {doctors.map(doc => (
            <div key={doc.id} className="bg-white rounded-xl shadow overflow-hidden">
              <img src={doc.image} alt={doc.name} className="w-full h-48 object-cover" />
              <div className="p-6">
                <div className="inline-block bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full mb-2">{doc.title}</div>
                <h3 className="text-xl font-semibold mb-1">{doc.name}</h3>
                <p className="text-sm text-blue-600 mb-2">{doc.specialties.join(', ')}</p>
                <p className="text-gray-700 text-sm mb-2"><span className="font-semibold">{doc.experience}</span></p>
                <p className="text-gray-600 text-sm mb-2"><span className="font-semibold">{doc.education}</span></p>
                <p className="text-gray-600 text-sm mb-4">{doc.schedule}</p>
                <div className="flex justify-between items-center">
                  <button className="bg-gradient-to-r from-blue-500 to-green-500 text-white px-4 py-2 rounded-md font-semibold hover:opacity-90 transition">Xem chi tiết</button>
                  <button className="text-gray-600 hover:text-gray-800"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A2 2 0 0122 9.618v4.764a2 2 0 01-2.447 2.894L15 14m0 0v7l-6-3.5L3 21v-7m12 0L9 7" /></svg></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ChuyenGia;
