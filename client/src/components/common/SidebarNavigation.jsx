import PropTypes from "prop-types";
import { ChevronLeft, ChevronRight } from "lucide-react";
/**
 * Sidebar Navigation component
 * @param {object} props - Props của component
 * @param {Array} props.tabs - Danh sách navigation items
 * @param {string} props.activeTab - Tab đang active
 * @param {Function} props.onTabChange - Hàm xử lý khi chuyển tab
 * @param {boolean} props.collapsed - Trạng thái thu gọn sidebar
 * @param {Function} props.onToggleCollapse - Hàm toggle thu gọn
 */
const SidebarNavigation = ({
  tabs,
  activeTab,
  onTabChange,
  collapsed = false,
  onToggleCollapse,
}) => {
  return (
    <div
      className={`bg-white border-r border-gray-200 transition-all duration-300 flex flex-col fixed top-16 left-0 h-[calc(100vh-4rem)] z-10 ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Dashboard Header */}
      {!collapsed && (
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">H+</span>
            </div>
            <span className="font-semibold text-gray-900">HIV Care Center</span>
          </div>
        </div>
      )}

      {/* Header với toggle button */}
      <div className="p-3 border-b border-gray-200 flex items-center justify-between">
        {!collapsed && (
          <h2 className="text-sm font-medium text-gray-700">TỔNG QUAN</h2>
        )}
        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4 text-gray-600" />
          ) : (
            <ChevronLeft className="h-4 w-4 text-gray-600" />
          )}
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 overflow-y-auto py-4">
        <div className="space-y-1 px-2">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors group ${
                  isActive
                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                }`}
                title={collapsed ? tab.label : undefined}
              >
                {IconComponent && (
                  <IconComponent
                    className={`h-5 w-5 flex-shrink-0 ${
                      isActive
                        ? "text-blue-600"
                        : "text-gray-400 group-hover:text-gray-600"
                    }`}
                  />
                )}
                {!collapsed && (
                  <span className="font-medium text-sm truncate">
                    {tab.label}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Footer thông tin */}
      {!collapsed && (
        <div className="p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 text-center">
            HIV Care Center
          </div>
        </div>
      )}
    </div>
  );
};

SidebarNavigation.propTypes = {
  tabs: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      icon: PropTypes.elementType,
    })
  ).isRequired,
  activeTab: PropTypes.string.isRequired,
  onTabChange: PropTypes.func.isRequired,
  collapsed: PropTypes.bool,
  onToggleCollapse: PropTypes.func,
};

export default SidebarNavigation;
