import React, { useState, useEffect } from "react";
import {
  Users,
  Calendar,
  DollarSign,
  Activity,
  Plus,
  FileText,
} from "lucide-react";
import StatsCard from "../../components/common/StatsCard";
import UserManagement from "./components/users/UserManagement";
import ServiceManagement from "./components/services/ServiceManagement";
import BlogManagement from "./components/blogs/BlogManagement";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import TabNavigation from "../../components/common/TabNavigation";
import ErrorAlert from "../../components/common/ErrorAlert";
import { getUsers, getManagerServices, getAllBlogs } from "../../services/api";

const ManagerDashboard = () => {
  const [activeTab, setActiveTab] = useState("users");
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Tabs configuration
  const tabs = [
    { id: "users", label: "Người dùng", icon: Users },
    { id: "appointments", label: "Lịch hẹn", icon: Calendar },
    { id: "services", label: "Dịch vụ", icon: Activity },
    { id: "blogs", label: "Blog", icon: FileText },
    { id: "schedule", label: "Lịch làm việc", icon: Calendar },
    { id: "revenue", label: "Doanh thu", icon: DollarSign },
    { id: "system", label: "Hệ thống", icon: Activity },
  ];
  const fetchStatistics = async () => {
    try {
      setLoading(true);

      // Lấy dữ liệu users từ API có sẵn
      const usersResponse = await getUsers();
      const usersData = usersResponse.data || [];

      // Lấy dữ liệu services từ API
      const servicesData = await getManagerServices();
      const services = servicesData.data || [];
      const totalServices = services.length;
      const activeServices = services.filter(
        (service) => service.is_active
      ).length;

      // Lấy dữ liệu blogs từ API
      const blogsData = await getAllBlogs();
      const blogs = blogsData || [];
      const totalBlogs = blogs.length;
      const publishedBlogs = blogs.filter(
        (blog) => blog.published === 1
      ).length;

      // Tính toán statistics từ dữ liệu users
      const totalUsers = usersData.length;
      const activeUsers = usersData.filter(
        (user) => user.status === "active"
      ).length;

      // Mock data cho các thống kê khác (chưa có API)
      const mockStats = {
        totalUsers,
        activeUsers,
        totalAppointments: 2, // Mock data
        completedAppointments: 1, // Mock data
        totalRevenue: 120000, // Mock data
        revenueYear: 2025,
        totalServices,
        activeServices,
        totalBlogs,
        publishedBlogs,
      };

      setStats(mockStats);
    } catch (err) {
      console.error("Error fetching statistics:", err);
      setError("Không thể tải dữ liệu thống kê");
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics data
  useEffect(() => {
    fetchStatistics();
  }, []);

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case "users":
        return <UserManagement />;
      case "appointments":
        return (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Quản lý Lịch hẹn
            </h3>
            <p className="text-gray-600">Chức năng đang được phát triển...</p>
          </div>
        );
      case "services":
        return <ServiceManagement />;
      case "blogs":
        return <BlogManagement />;
      case "schedule":
        return (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Quản lý Lịch làm việc
            </h3>
            <p className="text-gray-600">Chức năng đang được phát triển...</p>
          </div>
        );
      case "revenue":
        return (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Quản lý Doanh thu
            </h3>
            <p className="text-gray-600">Chức năng đang được phát triển...</p>
          </div>
        );
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

  if (loading) {
    return <LoadingSpinner message="Đang tải dashboard..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Dashboard Quản lý
          </h1>
          <p className="text-gray-600">Quản lý tổng thể hệ thống HIV Care</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-8">
            <StatsCard
              title="Tổng người dùng"
              value={stats.totalUsers}
              subtitle={`${stats.activeUsers} đang hoạt động`}
              icon={<Users className="w-6 h-6" />}
              iconColor="text-blue-500"
              iconBg="bg-blue-50"
            />
            <StatsCard
              title="Tổng lịch hẹn"
              value={stats.totalAppointments}
              subtitle={`${stats.completedAppointments} hoàn thành`}
              icon={<Calendar className="w-6 h-6" />}
              iconColor="text-green-500"
              iconBg="bg-green-50"
            />
            <StatsCard
              title="Tổng doanh thu"
              value={`${new Intl.NumberFormat("vi-VN").format(
                stats.totalRevenue
              )} ₫`}
              subtitle={`Năm ${stats.revenueYear}`}
              icon={<DollarSign className="w-6 h-6" />}
              iconColor="text-purple-500"
              iconBg="bg-purple-50"
            />
            <StatsCard
              title="Tổng dịch vụ"
              value={stats.totalServices}
              subtitle={`${stats.activeServices} đang hoạt động`}
              icon={<Activity className="w-6 h-6" />}
              iconColor="text-orange-500"
              iconBg="bg-orange-50"
            />
            <StatsCard
              title="Tổng bài viết"
              value={stats.totalBlogs}
              subtitle={`${stats.publishedBlogs} đã xuất bản`}
              icon={<FileText className="w-6 h-6" />}
              iconColor="text-indigo-500"
              iconBg="bg-indigo-50"
            />
          </div>
        )}

        {/* Tab Navigation */}
        <TabNavigation
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* Tab Content */}
        <div className="mt-6">
          {error ? (
            <ErrorAlert error={error} onRetry={fetchStatistics} />
          ) : (
            renderTabContent()
          )}
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
