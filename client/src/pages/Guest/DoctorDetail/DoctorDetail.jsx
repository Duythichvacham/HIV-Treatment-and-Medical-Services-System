import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import AppointmentForm from '../../../components/common/AppointmentForm';
import { getDoctorById } from '../../../services/api';

const DoctorDetail = ({ user }) => {
  const { id } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('Thông tin');

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const data = await getDoctorById(id);
        if (!data) throw new Error('Not found');
        setDoctor(data);
      } catch (err) {
        setError('Không tìm thấy bác sĩ.');
      } finally {
        setLoading(false);
      }
    };
    fetchDoctor();
  }, [id]);

  if (loading) return <div className="p-6 text-center">Đang tải thông tin bác sĩ...</div>;
  if (error || !doctor) return <div className="p-6 text-center text-red-500">{error}</div>;

  return (
    <div className="px-4 py-8 max-w-7xl mx-auto">
      <Link to="/" className="text-gray-500 hover:underline inline-block mb-6">← Quay lại</Link>
      {/* Header Card */}
      <section className="bg-white p-6 rounded-lg shadow mb-8 flex justify-between items-start">
        <div className="flex items-start">
          <img src={doctor.avatar} alt={doctor.name} className="w-32 h-32 rounded-lg object-cover shadow" />
          <div className="ml-6">
            <h1 className="text-3xl font-bold text-green-800">{doctor.name}</h1>
            <div className="text-gray-600 mt-1">{doctor.degrees}</div>            <div className="mt-4 flex items-center">
              <div className="flex items-center text-green-600">
                <span className="mr-1">🎖️</span>
                <span className="font-medium">{doctor.experience} năm</span>
                <span className="ml-1">kinh nghiệm</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Tabs and Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow">
            <div className="flex border-b">
              <button
                onClick={() => setActiveTab('Thông tin')}
                className={`flex-1 py-3 text-center font-medium ${activeTab==='Thông tin' ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-600'}`}
              >Thông tin</button>
            </div>
            <div className="p-6">
              {activeTab === 'Thông tin' && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Thông tin chi tiết</h2>                  <ul className="text-gray-700 space-y-2">
                    <li><strong>Học vị:</strong> {doctor.degrees}</li>
                    <li><strong>Kinh nghiệm:</strong> {doctor.experience} năm</li>
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
            price={doctor.joinedAt} // or default price from API
            user={user}
          />
        </div>
      </div>
    </div>
  );
};

export default DoctorDetail;
