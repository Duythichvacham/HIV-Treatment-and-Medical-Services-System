import React from "react";
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
  CheckCircle,
  XCircle,
} from "lucide-react";

/**
 * Statistics Cards Component
 */
export const StatisticsCards = ({ stats, formatCurrency }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">Đơn chờ xử lý</p>
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
          <p className="text-sm font-medium text-gray-600">Doanh thu hôm nay</p>
          <p className="text-3xl font-bold text-green-600">
            {formatCurrency(stats.today_revenue)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Tổng tiền thu được hôm nay
          </p>
        </div>
        <DollarSign className="h-8 w-8 text-green-600" />
      </div>
    </div>

    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">Đã xử lý hôm nay</p>
          <p className="text-3xl font-bold text-blue-600">
            {stats.processed_today}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Số đơn đã hoàn thành hôm nay
          </p>
        </div>
        <Receipt className="h-8 w-8 text-blue-600" />
      </div>
    </div>
  </div>
);

/**
 * Tab Navigation Component
 */
export const TabNavigation = ({ activeTab, onTabChange }) => (
  <div className="flex space-x-1 rounded-lg bg-gray-100 p-1 w-fit">
    <button
      onClick={() => onTabChange("process")}
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
      onClick={() => onTabChange("history")}
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
);

/**
 * Search Bar Component
 */
export const SearchBar = ({ searchTerm, onSearchChange, placeholder }) => (
  <div className="relative">
    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
      <Search className="h-5 w-5 text-gray-400" />
    </div>
    <input
      type="text"
      value={searchTerm}
      onChange={(e) => onSearchChange(e.target.value)}
      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
      placeholder={placeholder}
    />
  </div>
);

/**
 * Request Card Component
 */
export const RequestCard = ({
  request,
  index,
  formatCurrency,
  formatDateTime,
  onProcessPayment,
  isProcessing = false,
}) => (
  <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0">
          <TestTube className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {request.patient_name}
          </h3>
          <p className="text-sm text-gray-600">SĐT: {request.patient_phone}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-lg font-bold text-green-600">
          {formatCurrency(request.service_price)}
        </p>
        <p className="text-xs text-gray-500">ID: {request.appointment_id}</p>
      </div>
    </div>

    <div className="space-y-2 mb-4">
      <div className="flex justify-between text-sm">
        <span className="font-medium text-gray-600">Dịch vụ:</span>
        <span className="text-gray-900">{request.service_name}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="font-medium text-gray-600">Ngày đặt:</span>
        <span className="text-gray-900">
          {formatDateTime(request.booking_date)}
        </span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="font-medium text-gray-600">Trạng thái:</span>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          Chờ thanh toán
        </span>
      </div>
    </div>

    <div className="flex justify-end space-x-3">
      <button
        onClick={() => onProcessPayment(index, "cash")}
        disabled={isProcessing}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <DollarSign className="w-4 h-4 mr-2" />
        {isProcessing ? "Đang xử lý..." : "Thu tiền mặt"}
      </button>
      <button
        onClick={() => onProcessPayment(index, "card")}
        disabled={isProcessing}
        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Receipt className="w-4 h-4 mr-2" />
        {isProcessing ? "Đang xử lý..." : "Thu qua thẻ"}
      </button>
    </div>
  </div>
);

/**
 * History Card Component
 */
export const HistoryCard = ({ request, formatCurrency, formatDateTime }) => (
  <div className="bg-white border border-gray-200 rounded-lg p-6">
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0">
          <CheckCircle className="h-6 w-6 text-green-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {request.patient_name}
          </h3>
          <p className="text-sm text-gray-600">SĐT: {request.patient_phone}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-lg font-bold text-green-600">
          {formatCurrency(request.amount)}
        </p>
        <p className="text-xs text-gray-500">
          {request.payment_method === "cash" ? "Tiền mặt" : "Chuyển khoản"}
        </p>
      </div>
    </div>

    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="font-medium text-gray-600">Dịch vụ:</span>
        <span className="text-gray-900">{request.service_name}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="font-medium text-gray-600">Thanh toán lúc:</span>
        <span className="text-gray-900">
          {formatDateTime(request.payment_date)}
        </span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="font-medium text-gray-600">Trạng thái:</span>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Đã thanh toán
        </span>
      </div>
    </div>
  </div>
);

/**
 * Empty State Component
 */
export const EmptyState = ({ icon: IconComponent, title, description }) => {
  const Icon = IconComponent;
  return (
    <div className="text-center py-12">
      <Icon className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-2 text-sm font-medium text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
    </div>
  );
};

/**
 * Error Message Component
 */
export const ErrorMessage = ({ error, onRetry }) => (
  <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
    <div className="flex items-center">
      <div className="text-red-600">
        <XCircle className="w-5 h-5" />
      </div>
      <div className="ml-3 flex-1">
        <p className="text-sm text-red-800">{error}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="ml-3 bg-red-100 px-3 py-1 rounded text-sm font-medium text-red-800 hover:bg-red-200"
        >
          Thử lại
        </button>
      )}
    </div>
  </div>
);

/**
 * Loading Spinner Component
 */
export const LoadingSpinner = ({ message = "Đang tải dữ liệu..." }) => (
  <div className="flex justify-center items-center py-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    <span className="ml-3 text-gray-600">{message}</span>
  </div>
);
