import { useState } from "react";
import {
  Users,
  Calendar,
  DollarSign,
  Activity,
  FileText,
  Pill,
} from "lucide-react";
import UserManagement from "./components/users/UserManagement";
import ServiceManagement from "./components/services/ServiceManagement";
import BlogManagement from "./components/blogs/BlogManagement";
import WorkingShiftManagement from "./components/workingShifts/WorkingShiftManagement";
import ARVRegimenManagement from "./components/arvRegimens/ARVRegimenManagement";
import SidebarNavigation from "../../components/common/SidebarNavigation";
import RevenueChart from "./components/revenue/RevenueChart";

const ManagerDashboard = () => {
  const [activeTab, setActiveTab] = useState("users");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Tabs configuration
  const tabs = [
    { id: "users", label: "Người dùng", icon: Users },
    { id: "services", label: "Dịch vụ", icon: Activity },
    { id: "blogs", label: "Blog", icon: FileText },
    { id: "arv-regimens", label: "ARV Regimens", icon: Pill },
    { id: "schedule", label: "Lịch làm việc", icon: Calendar },
    { id: "revenue", label: "Doanh thu", icon: DollarSign },
    { id: "system", label: "Hệ thống", icon: Activity },
  ];

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case "users":
        return <UserManagement />;
      case "services":
        return <ServiceManagement />;
      case "blogs":
        return <BlogManagement />;
      case "arv-regimens":
        return <ARVRegimenManagement />;
      case "schedule":
        return <WorkingShiftManagement />;
      case "revenue":
        return <RevenueChart />;
      case "system":
        return (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Quản lý Hệ thống
            </h3>
            <p className="text-gray-600">Chức năng đang được phát triển...</p>
          </div>
        );
      default:
        return <UserManagement />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar Navigation */}
      <SidebarNavigation
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content */}
      <div
        className={`flex flex-col transition-all duration-300 pt-16 ${
          sidebarCollapsed ? "ml-16" : "ml-64"
        }`}
      >
        {/* Content Area */}
        <div className="min-h-screen overflow-y-auto">
          <div className="px-6 py-6">{renderTabContent()}</div>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
