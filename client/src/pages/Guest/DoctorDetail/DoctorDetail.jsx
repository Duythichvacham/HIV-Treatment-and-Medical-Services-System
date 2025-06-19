import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import AppointmentForm from '../../../components/common/AppointmentForm';

// Mock data for doctors (simulate DB records)
const doctors = [
  {
    id: '1',
    name: 'TS.BS Nguyễn Văn A',
    email: 'nguyenvana@example.com',
    phone: '0912345678',
    image: 'https://randomuser.me/api/portraits/men/32.jpg',
    degrees: 'Tiến sĩ Y học - Đại học Y Hà Nội',
    experience: 15,
    price: '300.000đ',
    description: 'TS.BS Nguyễn Văn A có hơn 15 năm kinh nghiệm trong điều trị HIV/AIDS, chuyên nghiên cứu về đánh giá hiệu quả liệu pháp ARV và tư vấn toàn diện cho bệnh nhân.',
    patients: 2000,
    workingSchedule: [
      { day: 'Thứ 2', time: '8:00 - 17:00' },
      { day: 'Thứ 3', time: '8:00 - 17:00' },
      { day: 'Thứ 4', time: '8:00 - 17:00' },
      { day: 'Thứ 5', time: '8:00 - 17:00' },
      { day: 'Thứ 6', time: '8:00 - 17:00' },
      { day: 'Thứ 7', time: 'Nghỉ' },
      { day: 'Chủ nhật', time: 'Nghỉ' }
    ]
  },
  {
    id: '2',
    name: 'BS.CKI Trần Thị B',
    email: 'tranthib@example.com',
    phone: '0912345679',
    image: 'https://randomuser.me/api/portraits/women/44.jpg',
    degrees: 'Bác sĩ chuyên khoa I - Bệnh viện Bạch Mai',
    experience: 12,
    price: '250.000đ',
    description: 'BS.CKI Trần Thị B có kinh nghiệm 12 năm trong chẩn đoán và điều trị HIV/AIDS, nổi tiếng với kỹ năng khám lâm sàng và tư vấn tâm lý cho bệnh nhân.',
    patients: 1800,
    workingSchedule: [
      { day: 'Thứ 2', time: '8:00 - 12:00' },
      { day: 'Thứ 4', time: '8:00 - 12:00' },
      { day: 'Thứ 6', time: '8:00 - 12:00' },
      { day: 'Thứ 7', time: 'Nghỉ' },
      { day: 'Chủ nhật', time: 'Nghỉ' }
    ]
  },
  {
    id: '3',
    name: 'BS Lê Văn C',
    email: 'levanc@example.com',
    phone: '0912345680',
    image: 'https://randomuser.me/api/portraits/men/45.jpg',
    degrees: 'Thạc sĩ Tâm lý học - Đại học Sư phạm Hà Nội',
    experience: 8,
    price: '200.000đ',
    description: 'BS Lê Văn C chuyên tâm lý HIV/AIDS, hỗ trợ bệnh nhân vượt qua căng thẳng và tăng cường tuân thủ điều trị thông qua các buổi tư vấn chuyên sâu.',
    patients: 1500,
    workingSchedule: [
      { day: 'Thứ 3', time: '14:00 - 18:00' },
      { day: 'Thứ 5', time: '14:00 - 18:00' },
      { day: 'Thứ 7', time: 'Nghỉ' },
      { day: 'Chủ nhật', time: 'Nghỉ' }
    ]
  },
  {
    id: '4',
    name: 'BS Phạm Thị D',
    email: 'phamthid@example.com',
    phone: '0912345681',
    image: 'https://randomuser.me/api/portraits/women/65.jpg',
    degrees: 'Bác sĩ Y học - Đại học Y Dược TP.HCM',
    experience: 10,
    price: '220.000đ',
    description: 'BS Phạm Thị D có thành tích xuất sắc trong lĩnh vực xét nghiệm HIV và tư vấn liệu pháp ARV, cam kết chất lượng và an toàn cho bệnh nhân.',
    patients: 1700,
    workingSchedule: [
      { day: 'Thứ 2', time: '7:00 - 16:00' },
      { day: 'Thứ 3', time: '7:00 - 16:00' },
      { day: 'Thứ 4', time: '7:00 - 16:00' },
      { day: 'Thứ 5', time: '7:00 - 16:00' },
      { day: 'Thứ 6', time: '7:00 - 16:00' },
      { day: 'Thứ 7', time: 'Nghỉ' },
      { day: 'Chủ nhật', time: 'Nghỉ' }
    ]
  }
];

const DoctorDetail = ({ user }) => {
  const { id } = useParams();
  const doctor = doctors.find((d) => d.id === id);
  const [activeTab, setActiveTab] = useState('Thông tin');

  if (!doctor) {
    return <div className="p-6">Bác sĩ không tồn tại.</div>;
  }

  return (
    <div className="px-4 py-8 max-w-7xl mx-auto">
      <Link to="/" className="text-gray-500 hover:underline inline-block mb-6">&larr; Quay lại</Link>
      {/* Header Card */}
      <section className="bg-white p-6 rounded-lg shadow mb-8 flex justify-between items-start">
        <div className="flex items-start">
          <img src={doctor.image} alt={doctor.name} className="w-32 h-32 rounded-lg object-cover shadow" />
          <div className="ml-6">
            <h1 className="text-3xl font-bold text-green-800">{doctor.name}</h1>
            <div className="text-gray-600 mt-1">{doctor.degrees}</div>
            {/* Removed email, phone and patient count for privacy */}
            <div className="mt-4 flex items-center">
              <div className="flex items-center text-green-600">
                <span className="mr-1">🎖️</span>
                <span className="font-medium">{doctor.experience} năm</span>
                <span className="ml-1">kinh nghiệm</span>
              </div>
            </div>
            <div className="mt-4 text-xl font-semibold text-green-700">{doctor.price} <span className="text-gray-500 text-sm">/ lần khám</span></div>
            <p className="mt-4 text-gray-700 leading-relaxed max-w-xl">{doctor.description}</p>
          </div>
        </div>
      </section>
      {/* Tabs and Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow">
            <div className="flex border-b">
              {['Thông tin','Lịch làm việc'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-3 text-center font-medium ${activeTab===tab ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-600'}`}
                >{tab}</button>
              ))}
            </div>
            <div className="p-6">
              {activeTab === 'Thông tin' && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Thông tin chi tiết</h2>
                  <ul className="text-gray-700 space-y-2">
                    <li><strong>Học vị:</strong> {doctor.degrees}</li>
                    <li><strong>Kinh nghiệm:</strong> {doctor.experience} năm</li>
                  </ul>
                </div>
              )}
              {activeTab === 'Lịch làm việc' && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Lịch làm việc</h2>
                  <ul className="text-gray-700 space-y-2">
                    {doctor.workingSchedule.map((ws,i) => (
                      <li key={i} className="flex justify-between"><span>{ws.day}</span><span className={`font-medium ${ws.time==='Nghỉ'?'text-red-500':'text-green-600'}`}>{ws.time}</span></li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Appointment Form Section */}
        <div>
          <AppointmentForm
            serviceType={`doctor_${doctor.id}`}
            serviceName={`Khám bác sĩ ${doctor.name}`}
            duration="Theo lịch"
            price={doctor.price}
            user={user}
          />
        </div>
      </div>
    </div>
  );
};

export default DoctorDetail;
