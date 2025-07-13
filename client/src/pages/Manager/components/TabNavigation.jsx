import React from "react";
import PropTypes from "prop-types";

/**
 * Component tab navigation cho Manager Dashboard
 * @param {object} props - Props của component
 * @param {Array} props.tabs - Danh sách tabs
 * @param {string} props.activeTab - Tab đang active
 * @param {Function} props.onTabChange - Hàm xử lý khi chuyển tab
 */
const TabNavigation = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border mb-6">
      <div className="flex border-b border-gray-200 overflow-x-auto">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center space-x-2 px-6 py-4 font-medium text-sm border-b-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600 bg-blue-50"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              <IconComponent className="h-5 w-5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

TabNavigation.propTypes = {
  tabs: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      icon: PropTypes.elementType.isRequired,
    })
  ).isRequired,
  activeTab: PropTypes.string.isRequired,
  onTabChange: PropTypes.func.isRequired,
};

export default TabNavigation;
