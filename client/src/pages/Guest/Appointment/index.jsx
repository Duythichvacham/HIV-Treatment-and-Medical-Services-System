import React, { useState } from "react";
import { User, FileText, MessageCircle } from "lucide-react";
import ExamAppointment from "./AppointmentTypes/ExamAppointment";
import TestAppointment from "./AppointmentTypes/TestAppointment";
import ConsultAppointment from "./AppointmentTypes/ConsultAppointment";

const Appointment = () => {
  const [activeTab, setActiveTab] = useState("exam");

  const tabs = [
    { id: "exam", label: "Đặt lịch khám bác sĩ", icon: User },
    { id: "test", label: "Đặt lịch xét nghiệm", icon: FileText },
    { id: "consult", label: "Đặt lịch tư vấn", icon: MessageCircle },
  ];

  // Render tab content based on activeTab
  const renderTabContent = () => {
    switch (activeTab) {
      case "exam":
        return <ExamAppointment />;
      case "test":
        return <TestAppointment />;
      case "consult":
        return <ConsultAppointment />;
      default:
        return <ExamAppointment />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Đặt lịch khám và xét nghiệm
          </h1>
          <p className="text-gray-600">
            Đặt lịch khám bác sĩ, thực hiện xét nghiệm hoặc tư vấn trực tuyến
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="flex border-b border-gray-200">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-4 font-medium text-sm border-b-2 ${
                    activeTab === tab.id
                      ? "border-purple-500 text-purple-600 bg-purple-50"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Render the active tab content */}
        {renderTabContent()}
      </div>
    </div>
  );
};

export default Appointment;
