import React, { useState, useEffect, useCallback } from "react";
import {
  Calendar,
  DollarSign,
  FileText,
  Clock,
  User,
  Stethoscope,
  TestTube,
  Receipt,
  Search,
} from "lucide-react";
import PaymentModal from "../../components/common/PaymentModal";
import {
  getPendingTestRequests,
  approveTestRequest,
  getRegistrationStatistics,
  getPaymentHistory,
} from "../../services/api";
import { getCurrentDate, formatDateVietnamese } from "../../utils/dateUtil";

const RegistrationStaff = () => {
  const [testRequests, setTestRequests] = useState([]);
  const [completedRequests, setCompletedRequests] = useState([]);
  const [stats, setStats] = useState({
    pending_requests: 0,
    today_revenue: 0,
    processed_today: 0,
  });
  const [activeTab, setActiveTab] = useState("process");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Lấy ngày hiện tại để hiển thị
  const today = getCurrentDate();
  const todayFormatted = formatDateVietnamese(today);

  // Fetch data khi component mount và khi tab thay đổi
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Luôn fetch statistics
      const statsResponse = await getRegistrationStatistics();
      setStats(statsResponse.data);

      if (activeTab === "process") {
        // Fetch pending test requests
        const pendingResponse = await getPendingTestRequests();
        setTestRequests(pendingResponse.data || []);
      } else if (activeTab === "history") {
        // Fetch payment history
        const historyResponse = await getPaymentHistory();
        setCompletedRequests(historyResponse.data || []);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Không thể tải dữ liệu. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleProcessPayment = async (requestIndex) => {
    const request = testRequests[requestIndex];

    try {
      setLoading(true);
      await approveTestRequest(request.appointment_id);

      // Cập nhật UI
      setTestRequests((prev) =>
        prev.filter((_, index) => index !== requestIndex)
      );
      setStats((prev) => ({
        ...prev,
        pending_requests: prev.pending_requests - 1,
        processed_today: prev.processed_today + 1,
        today_revenue: prev.today_revenue + (request.total_price || 0),
      }));

      alert("Đã thu tiền thành công!\nPhiếu xét nghiệm đang được in...");
    } catch (err) {
      console.error("Error processing payment:", err);
      alert("Có lỗi xảy ra khi xử lý thanh toán. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };
  const formatDateTime = (dateTime) => {
    return new Date(dateTime).toLocaleString("vi-VN");
  };

  // Filter completed requests based on search term
  const filteredCompletedRequests = completedRequests.filter(
    (request) =>
      request.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.doctor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.room_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.queue_number?.toString().includes(searchTerm)
  );

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
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="text-red-600">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Loading Spinner */}
        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Đang tải dữ liệu...</span>
          </div>
        )}

        {/* Tabs */}
        <div className="space-y-6">
          <div className="flex space-x-1 rounded-lg bg-gray-100 p-1 w-fit">
            <button
              onClick={() => setActiveTab("process")}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === "process"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <FileText size={16} />
              Xử lý đơn XN
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === "history"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <DollarSign size={16} />
              Lịch sử thanh toán
            </button>
          </div>
          {/* Process Tab */}
          {activeTab === "process" && (
            <div className="space-y-6">
              {/* Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Đơn chờ xử lý
                      </p>
                      <p className="text-3xl font-bold text-orange-600">
                        {stats.pending_requests}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        TestRequests status = 'requested'
                      </p>
                    </div>
                    <Clock className="h-8 w-8 text-orange-600" />
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Doanh thu hôm nay
                      </p>
                      <p className="text-3xl font-bold text-green-600">
                        {formatCurrency(stats.today_revenue)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Tổng tiền đã thu
                      </p>
                    </div>
                    <DollarSign className="h-8 w-8 text-green-600" />
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Số đơn đã xử lý
                      </p>
                      <p className="text-3xl font-bold text-blue-600">
                        {stats.processed_today}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Trong ngày hôm nay
                      </p>
                    </div>
                    <FileText className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
              </div>

              {/* Test Requests List */}
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <TestTube className="h-5 w-5" />
                    Danh sách đơn xét nghiệm chờ xử lý - Hôm nay (
                    {todayFormatted})
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Các đơn xét nghiệm từ bác sĩ cần thu tiền và duyệt trong
                    ngày
                  </p>
                </div>
                <div className="p-6">
                  {testRequests.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <TestTube className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>
                        Không có đơn xét nghiệm nào chờ xử lý hôm nay (
                        {todayFormatted})
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {testRequests.map((request, index) => (
                        <div
                          key={index}
                          className="bg-white border border-l-4 border-l-orange-500 rounded-lg p-6 shadow-sm"
                        >
                          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-start">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-blue-600" />
                                <span className="font-semibold text-gray-900">
                                  {request.patient_name}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Stethoscope className="h-4 w-4" />
                                <span>{request.doctor_name}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Calendar className="h-4 w-4" />
                                <span>
                                  {formatDateTime(request.request_date)}
                                </span>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <h4 className="font-medium text-gray-900">
                                Dịch vụ xét nghiệm:
                              </h4>
                              <div className="space-y-1">
                                {request.services.map(
                                  (service, serviceIndex) => (
                                    <div
                                      key={serviceIndex}
                                      className="flex justify-between items-center text-sm"
                                    >
                                      <span className="text-gray-700">
                                        {service.service_name}
                                      </span>
                                      <span className="font-medium text-gray-900">
                                        {formatCurrency(service.service_price)}
                                      </span>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>

                            <div className="space-y-2">
                              <div className="bg-gray-50 p-3 rounded-lg">
                                <div className="text-sm text-gray-600">
                                  Tổng tiền:
                                </div>
                                <div className="text-lg font-bold text-green-600">
                                  {formatCurrency(request.total_price)}
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col gap-2">
                              <PaymentModal
                                request={request}
                                requestIndex={index}
                                onPaymentComplete={handleProcessPayment}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}{" "}
          {/* History Tab */}
          {activeTab === "history" && (
            <div className="space-y-6">
              {/* Search Bar */}
              <div className="bg-white rounded-lg shadow-sm border p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm theo tên bệnh nhân, bác sĩ, phòng hoặc số thứ tự..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <Receipt className="h-5 w-5" />
                    Lịch sử thanh toán hôm nay ({todayFormatted})
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Danh sách các đơn xét nghiệm đã thanh toán thành công trong
                    ngày
                  </p>
                  <div className="mt-4 flex items-center gap-4 text-sm">
                    <span className="text-gray-600">Tổng thu:</span>
                    <span className="font-semibold text-green-600">
                      {formatCurrency(
                        filteredCompletedRequests.reduce(
                          (sum, request) => sum + (request.total_price || 0),
                          0
                        )
                      )}
                    </span>
                    <span className="text-gray-600">•</span>
                    <span className="text-gray-600">
                      {filteredCompletedRequests.length} đơn đã thanh toán
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  {filteredCompletedRequests.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Receipt className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>
                        {searchTerm
                          ? "Không tìm thấy kết quả phù hợp"
                          : `Chưa có đơn nào được thanh toán hôm nay (${todayFormatted})`}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredCompletedRequests.map((request, index) => (
                        <div
                          key={index}
                          className="bg-white border border-l-4 border-l-green-500 rounded-lg p-6 shadow-sm"
                        >
                          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-start">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-blue-600" />
                                <span className="font-semibold text-gray-900">
                                  {request.patient_name}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Stethoscope className="h-4 w-4" />
                                <span>{request.doctor_name}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Calendar className="h-4 w-4" />
                                <span>
                                  {formatDateTime(request.payment_date)}
                                </span>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <h4 className="font-medium text-gray-900">
                                Dịch vụ xét nghiệm:
                              </h4>
                              <div className="space-y-1">
                                {request.services.map(
                                  (service, serviceIndex) => (
                                    <div
                                      key={serviceIndex}
                                      className="flex justify-between items-center text-sm"
                                    >
                                      <span className="text-gray-700">
                                        {service.service_name}
                                      </span>
                                      <span className="font-medium text-gray-900">
                                        {formatCurrency(service.service_price)}
                                      </span>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>

                            <div className="space-y-2">
                              <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                                <div className="text-sm text-green-800">
                                  Tổng tiền:
                                </div>
                                <div className="text-lg font-bold text-green-600">
                                  {formatCurrency(request.total_price)}
                                </div>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                                <div className="text-sm text-blue-800">
                                  Thanh toán:
                                </div>
                                <div className="font-medium text-blue-900">
                                  {request.payment_method || "Tiền mặt"}
                                </div>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                <div className="text-sm text-gray-600">
                                  Phòng:
                                </div>
                                <div className="font-medium text-gray-900">
                                  {request.room_name || "N/A"}
                                </div>
                                <div className="text-sm text-gray-600 mt-1">
                                  STT: {request.queue_number || "N/A"}
                                </div>
                              </div>
                              <div className="flex justify-center">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1.5"></div>
                                  Đã thanh toán
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
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
