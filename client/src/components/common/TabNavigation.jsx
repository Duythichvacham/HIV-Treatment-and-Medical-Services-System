import React from "react";
import PropTypes from "prop-types";

/**
 * Reusable Tab Navigation component
 * @param {object} props - Props của component
 * @param {Array} props.tabs - Danh sách tabs
 * @param {string} props.activeTab - Tab đang active
 * @param {Function} props.onTabChange - Hàm xử lý khi chuyển tab
 * @param {string} props.variant - Style variant: 'default' | 'pills'
 */
const TabNavigation = ({
  tabs,
  activeTab,
  onTabChange,
  variant = "default",
}) => {
  if (variant === "pills") {
    return (
      <div className="flex space-x-1 rounded-lg bg-gray-100 p-1 w-fit">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {IconComponent && <IconComponent className="h-4 w-4" />}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  // Default variant
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
              {IconComponent && <IconComponent className="h-5 w-5" />}
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
      icon: PropTypes.elementType,
    })
  ).isRequired,
  activeTab: PropTypes.string.isRequired,
  onTabChange: PropTypes.func.isRequired,
  variant: PropTypes.oneOf(["default", "pills"]),
};

export default TabNavigation;
