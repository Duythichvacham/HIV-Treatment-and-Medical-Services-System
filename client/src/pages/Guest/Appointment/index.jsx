import React, { useState } from "react";
import { User, FileText, MessageCircle } from "lucide-react";
import ExamAppointment from "./AppointmentTypes/ExamAppointment";
import TestAppointment from "./AppointmentTypes/TestAppointment";
import ConsultAppointment from "./AppointmentTypes/ConsultAppointment";
import TabNavigation from "../../../components/common/TabNavigation";
const Appointment = () => {
  const [activeTab, setActiveTab] = useState("exam");

  const tabs = [
    { id: "exam", label: "Đặt lịch khám bác sĩ", icon: User },
    { id: "test", label: "Đặt lịch xét nghiệm", icon: FileText },
    // { id: "consult", label: "Đặt lịch tư vấn", icon: MessageCircle },
  ];

  // Render tab content based on activeTab
  const renderTabContent = () => {
    switch (activeTab) {
      case "exam":
        return <ExamAppointment />;
      case "test":
        return <TestAppointment />;
      // case "consult":
      //   return <ConsultAppointment />;
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
        {
          <TabNavigation
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        }

        {/* Render the active tab content */}
        {renderTabContent()}
      </div>
    </div>
  );
};

export default Appointment;
