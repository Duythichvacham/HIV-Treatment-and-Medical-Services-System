import React from "react";
import { EXAM_TABS } from "../../utils/doctorConstants";

const ExamTabs = ({ activeTab, onTabChange, hasCurrentExam = true }) => {
  const tabs = [
    {
      id: EXAM_TABS.CURRENT,
      label: "Khám hiện tại",
      disabled: !hasCurrentExam,
    },
    {
      id: EXAM_TABS.HISTORY,
      label: "Lịch sử khám",
    },
  ];

  return (
    <div className="border-b border-gray-200 mb-6">
      <div className="flex space-x-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            disabled={tab.disabled}
            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === tab.id
                ? "border-blue-500 text-blue-600"
                : tab.disabled
                ? "border-transparent text-gray-400 cursor-not-allowed"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
            onClick={() => !tab.disabled && onTabChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ExamTabs;
