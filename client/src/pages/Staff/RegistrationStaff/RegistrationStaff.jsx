import React from "react";
import { FileText } from "lucide-react";
import { useRegistrationStaff } from "../../../hooks/useAppointment";
import { getCurrentDate, formatDateVietnamese } from "../../../utils/dateUtil";
import {
  StatisticsCards,
  TabNavigation,
  SearchBar,
  RequestCard,
  HistoryCard,
  EmptyState,
  ErrorMessage,
  LoadingSpinner,
} from "../../../components/registration/RegistrationComponents";

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
        {error && <ErrorMessage error={error} onRetry={fetchData} />}

        {/* Loading Spinner */}
        {loading && <LoadingSpinner />}

        {/* Tab Navigation */}
        <div className="space-y-6">
          <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

          {/* Process Tab */}
          {activeTab === "process" && (
            <div className="space-y-6">
              {/* Statistics Cards */}
              <StatisticsCards stats={stats} formatCurrency={formatCurrency} />

              {/* Search Bar */}
              <div className="bg-white rounded-lg shadow-sm border p-4">
                <SearchBar
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  placeholder="Tìm kiếm theo tên bệnh nhân, số điện thoại, dịch vụ..."
                />
              </div>

              {/* Test Requests List */}
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Danh sách đơn xét nghiệm chờ xử lý
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Tổng cộng {filteredRequests.length} đơn
                  </p>
                </div>

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
