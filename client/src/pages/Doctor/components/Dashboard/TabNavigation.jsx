import React from "react";
import { User, MessageCircle } from "lucide-react";
import { TABS } from "../../utils/doctorConstants";

const TabNavigation = ({ activeTab, onTabChange }) => {
  const tabs = [
    {
      id: TABS.QUEUE,
      label: "Hàng đợi khám",
      icon: User,
    },
    {
      id: TABS.CONSULT,
      label: "Tư vấn trực tuyến",
      icon: MessageCircle,
    },
  ];

  return (
    <div className="flex gap-2 mb-6">
      {tabs.map((tab) => {
        const IconComponent = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all duration-200 ${
              isActive
                ? "bg-white text-blue-700 shadow-md border border-blue-200"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
            onClick={() => onTabChange(tab.id)}
          >
            <IconComponent className="w-5 h-5" />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};

export default TabNavigation;
