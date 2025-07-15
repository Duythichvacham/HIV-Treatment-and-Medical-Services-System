import { FileText, Clock, DollarSign, Receipt } from "lucide-react";
import { useRegistrationStaff } from "../../../hooks/appointments/useAppointment";
import { getCurrentDate, formatDateVietnamese } from "../../../utils/dateUtil";
import {
  TabNavigation,
  RequestCard,
  HistoryCard,
} from "../../../components/registration/RegistrationComponents";
import ErrorAlert from "../../../components/common/ErrorAlert";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import EmptyState from "../../../components/common/EmptyState";
import TableHeader from "../../../components/common/TableHeader";
import SearchAndFilter from "../../../components/common/SearchAndFilter";
import StatsCard from "../../../components/common/StatsCard";
const RegistrationStaff = () => {
  const {
    // State
    stats,
    activeTab,
    searchTerm,
    loading,
    error,

    // Actions
    setActiveTab,
    setSearchTerm,
    fetchData,
    handleProcessPayment,

    // Computed
    getFilteredRequests,
    formatCurrency,
    formatDateTime,
  } = useRegistrationStaff();

  // Get current date for display
  const today = getCurrentDate();
  const todayFormatted = formatDateVietnamese(today);

  // Get filtered requests based on current tab
  const filteredRequests = getFilteredRequests();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Quản lý Xét nghiệm - Registration Staff
          </h1>
          <p className="text-gray-600">
            Xử lý đơn xét nghiệm và thu tiền từ bệnh nhân - Ngày{" "}
            {todayFormatted}
          </p>
        </div>

        {/* Error Message */}
        {error && <ErrorAlert error={error} onRetry={fetchData} />}

        {/* Loading Spinner */}
        {loading && <LoadingSpinner />}

        {/* Tab Navigation */}
        <div className="space-y-6">
          <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

          {/* Process Tab */}
          {activeTab === "process" && (
            <div className="space-y-6">
              {/* Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatsCard
                  title="Đơn chờ xử lý"
                  value={stats.pending_requests}
                  icon={<Clock className="h-6 w-6" />}
                  iconColor="text-orange-600"
                  iconBg="bg-orange-50"
                />
                <StatsCard
                  title="Doanh thu hôm nay"
                  value={formatCurrency(stats.today_revenue)}
                  subtitle="Tổng tiền thu được hôm nay"
                  icon={<DollarSign className="h-6 w-6" />}
                  iconColor="text-green-600"
                  iconBg="bg-green-50"
                />
                <StatsCard
                  title="Đã xử lý hôm nay"
                  value={stats.processed_today}
                  subtitle="Số đơn đã hoàn thành hôm nay"
                  icon={<Receipt className="h-6 w-6" />}
                  iconColor="text-blue-600"
                  iconBg="bg-blue-50"
                />
              </div>
              <SearchAndFilter
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                placeholder="Tìm kiếm theo tên bệnh nhân, số điện thoại, dịch vụ..."
              />

              {/* Test Requests List */}
              <div className="bg-white rounded-lg shadow-sm border">
                <TableHeader
                  title="Danh sách đơn xét nghiệm chờ xử lý"
                  subtitle={`Tổng cộng ${filteredRequests.length} đơn`}
                />

                <div className="p-6">
                  {filteredRequests.length === 0 ? (
                    <EmptyState
                      icon={FileText}
                      title="Không có đơn xét nghiệm nào"
                      description="Hiện tại không có đơn xét nghiệm nào cần xử lý"
                    />
                  ) : (
                    <div className="grid gap-6">
                      {filteredRequests.map((request, index) => (
                        <RequestCard
                          key={request.appointment_id || index}
                          request={request}
                          index={index}
                          formatCurrency={formatCurrency}
                          onProcessPayment={handleProcessPayment}
                          isProcessing={loading}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* History Tab */}
          {activeTab === "history" && (
            <div className="space-y-6">
              {/* Search Bar */}
              <div className="bg-white rounded-lg shadow-sm border p-4">
                <SearchBar
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  placeholder="Tìm kiếm trong lịch sử thanh toán..."
                />
              </div>

              {/* Payment History List */}
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Lịch sử thanh toán
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Tổng cộng {filteredRequests.length} giao dịch
                  </p>
                </div>

                <div className="p-6">
                  {filteredRequests.length === 0 ? (
                    <EmptyState
                      icon={FileText}
                      title="Chưa có giao dịch nào"
                      description="Lịch sử thanh toán sẽ hiển thị ở đây"
                    />
                  ) : (
                    <div className="grid gap-6">
                      {filteredRequests.map((request, index) => (
                        <HistoryCard
                          key={request.payment_id || index}
                          request={request}
                          formatCurrency={formatCurrency}
                          formatDateTime={formatDateTime}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegistrationStaff;
