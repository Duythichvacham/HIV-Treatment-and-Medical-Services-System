import { DollarSign, FileText, TestTube, CheckCircle } from "lucide-react";
import PaymentModal from "../common/PaymentModal";

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
 * Request Card Component
 */
export const RequestCard = ({
  request,
  index,
  formatCurrency,
  onProcessPayment,
}) => (
  <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3 flex-1">
        <div className="flex-shrink-0">
          <TestTube className="h-5 w-5 text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-gray-900 truncate">
            {request.patient_name}
          </h3>
          <p className="text-sm text-gray-600">{request.patient_phone}</p>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="text-right">
          <p className="text-lg font-bold text-green-600">
            {formatCurrency(request.total_price || 0)}
          </p>
          <p className="text-xs text-gray-500">
            {request.services?.length || 0} dịch vụ
          </p>
        </div>

        <PaymentModal
          request={request}
          requestIndex={index}
          onPaymentComplete={onProcessPayment}
        />
      </div>
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
          {formatCurrency(request.total_price || 0)}
        </p>
        <p className="text-xs text-gray-500">Tiền mặt</p>
      </div>
    </div>

    <div className="space-y-2 mb-4">
      <div>
        <span className="font-medium text-gray-600 text-sm">Dịch vụ:</span>
        <div className="mt-1 space-y-1">
          {request.services &&
            request.services.map((service, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span className="text-gray-900">{service.service_name}</span>
                <span className="text-gray-600">
                  {formatCurrency(service.service_price)}
                </span>
              </div>
            ))}
        </div>
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
