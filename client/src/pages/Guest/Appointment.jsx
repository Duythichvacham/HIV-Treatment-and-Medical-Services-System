import React, { useState } from 'react';
import { User, FileText, MessageCircle } from 'lucide-react';
import DoctorCard from '../../components/common/DoctorCard';
import ServiceCard from '../../components/common/ServiceCard';
import AppointmentForm from '../../components/common/AppointmentForm';
import { doctors, services } from '../../mockData/data';

const Appointment = ({ user }) => {
  const [activeTab, setActiveTab] = useState('doctor');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedService, setSelectedService] = useState(null);

  const tabs = [
    { id: 'doctor', label: 'Đặt lịch khám bác sĩ', icon: User },
    { id: 'test', label: 'Đặt lịch xét nghiệm', icon: FileText },
    { id: 'consult', label: 'Đặt lịch tư vấn', icon: MessageCircle }
  ];

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSelectedDoctor(null);
    setSelectedService(null);
  };

  const handleDoctorSelect = (doctor) => {
    setSelectedDoctor(doctor);
  };

  const handleServiceSelect = (service) => {
    setSelectedService(service);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold mb-4">
            Đặt lịch khám và xét nghiệm
          </h1>
          <p className="text-xl opacity-90">
            Đặt lịch khám bác sĩ, thực hiện xét nghiệm hoặc tư vấn trực tuyến
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-8">
          <div className="flex border-b border-gray-200">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center space-x-3 px-8 py-6 font-semibold text-sm border-b-3 transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Selection */}
          <div className="lg:col-span-2 space-y-6">
            {activeTab === 'doctor' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Chọn bác sĩ
                </h2>
                <p className="text-gray-600 mb-6">
                  Danh sách bác sĩ chuyên khoa HIV/AIDS
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {doctors.map((doctor) => (
                    <div
                      key={doctor.id}
                      className={`border-2 rounded-xl transition-all duration-300 cursor-pointer ${
                        selectedDoctor?.id === doctor.id
                          ? 'border-blue-400 bg-blue-50 shadow-lg'
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                      }`}
                      onClick={() => handleDoctorSelect(doctor)}
                    >
                      <DoctorCard
                        {...doctor}
                        
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'test' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Chọn dịch vụ xét nghiệm
                </h2>
                <p className="text-gray-600 mb-6">
                  Các dịch vụ xét nghiệm HIV có sẵn
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {services.map((service) => (
                    <div
                      key={service.id}
                      onClick={() => handleServiceSelect(service)}
                      className={`h-full flex flex-col rounded-xl transition duration-300 transform cursor-pointer ${
                        selectedService?.id === service.id
                          ? 'border-2 border-green-400 bg-green-50 shadow-lg scale-105'
                          : 'border border-gray-200 hover:border-green-300 hover:shadow-md hover:scale-105'
                      }`}
                    >
                      <ServiceCard
                        iconBg="bg-green-600"
                        iconColor="text-white"
                        icon={service.icon}
                        name={service.name}
                        subtitle={service.subtitle}
                        duration={service.duration}
                        price={service.price}
                        features={service.features}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'consult' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Tư vấn trực tuyến
                </h2>
                <div className="text-center py-12">
                  <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">
                    Tính năng tư vấn trực tuyến đang được phát triển
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Appointment Form */}
          <div className="lg:col-span-1">
            {activeTab === 'doctor' && selectedDoctor && (
              <div className="sticky top-24">
                <AppointmentForm
                  serviceType={`doctor_${selectedDoctor.id}`}
                  serviceName={selectedDoctor.name}
                  duration="Theo lịch"
                  price={selectedDoctor.price}
                  user={user}
                />
              </div>
            )}

            {activeTab === 'test' && selectedService && (
              <div className="sticky top-24">
                
                <AppointmentForm
                  serviceType={`service_${selectedService.id}`}
                  serviceName={selectedService.name}
                  duration={selectedService.duration}
                  price={selectedService.price}
                  user={user}
                />
              </div>
            )}

            {!selectedDoctor && !selectedService && (
              <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Chọn để đặt lịch
                </h3>
                <p className="text-gray-500">
                  {activeTab === 'doctor' ? 'Vui lòng chọn bác sĩ' : 'Vui lòng chọn dịch vụ'} để tiếp tục đặt lịch
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Appointment;
