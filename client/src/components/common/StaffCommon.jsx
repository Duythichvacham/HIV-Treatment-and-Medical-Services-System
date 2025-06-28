import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  User, 
  Calendar, 
  FileText, 
  TestTube,
  AlertCircle,
  CheckCircle,
  RefreshCcw,
  Search
} from 'lucide-react';

/**
 * Reusable Loading Spinner Component
 */
export const LoadingSpinner = ({ size = 'default', text = 'Đang tải...' }) => {
  const sizeClasses = {
    small: 'h-4 w-4',
    default: 'h-8 w-8',
    large: 'h-12 w-12'
  };

  return (
    <div className="flex justify-center items-center py-8">
      <div className={`animate-spin rounded-full border-b-2 border-blue-600 ${sizeClasses[size]}`}></div>
      <span className="ml-3 text-gray-600">{text}</span>
    </div>
  );
};

/**
 * Error Message Component
 */
export const ErrorMessage = ({ error, onRetry }) => (
  <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
    <div className="flex items-center">
      <AlertCircle className="h-5 w-5 text-red-600" />
      <div className="ml-3">
        <p className="text-sm text-red-800">{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Thử lại
          </button>
        )}
      </div>
    </div>
  </div>
);

/**
 * Success Message Component
 */
export const SuccessMessage = ({ message, onClose }) => (
  <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <CheckCircle className="h-5 w-5 text-green-600" />
        <p className="ml-3 text-sm text-green-800">{message}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-green-600 hover:text-green-800"
        >
          ×
        </button>
      )}
    </div>
  </div>
);

/**
 * Empty State Component
 */
export const EmptyState = ({ 
  icon: Icon = FileText, 
  title, 
  description, 
  action 
}) => (
  <div className="text-center py-12 text-gray-500">
    <Icon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
    <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600 mb-4">{description}</p>
    {action}
  </div>
);

/**
 * Search Input Component
 */
export const SearchInput = ({ 
  value, 
  onChange, 
  placeholder = "Tìm kiếm...",
  className = ""
}) => (
  <div className={`relative ${className}`}>
    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    />
  </div>
);

/**
 * Refresh Button Component
 */
export const RefreshButton = ({ onClick, loading = false }) => (
  <button
    onClick={onClick}
    disabled={loading}
    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
  >
    <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
    {loading ? 'Đang tải...' : 'Làm mới'}
  </button>
);

/**
 * Status Badge Component
 */
export const StatusBadge = ({ status, type = 'default' }) => {
  const statusColors = {
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
    default: 'bg-gray-100 text-gray-800'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[type]}`}>
      {status}
    </span>
  );
};

/**
 * Card Container Component
 */
export const CardContainer = ({ children, className = "" }) => (
  <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
    {children}
  </div>
);

/**
 * Stats Card Component
 */
export const StatsCard = ({ 
  title, 
  value, 
  icon: Icon, 
  color = 'blue',
  description 
}) => {
  const colorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    yellow: 'text-yellow-600',
    red: 'text-red-600',
    purple: 'text-purple-600'
  };

  return (
    <CardContainer>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-3xl font-bold ${colorClasses[color]}`}>{value}</p>
          {description && (
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          )}
        </div>
        <Icon className={`h-8 w-8 ${colorClasses[color]}`} />
      </div>
    </CardContainer>
  );
};

/**
 * Date Picker Component
 */
export const DatePicker = ({ 
  value, 
  onChange, 
  label = "Chọn ngày:",
  className = ""
}) => (
  <div className={`flex items-center gap-3 ${className}`}>
    <label className="font-medium text-gray-700">{label}</label>
    <input
      type="date"
      className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-200"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

/**
 * Utility Functions
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

export const formatDateTime = (dateTime) => {
  if (!dateTime) return "—";
  return new Date(dateTime).toLocaleString("vi-VN");
};

export const formatDate = (date) => {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("vi-VN");
};

export const formatTime = (time) => {
  if (!time) return "—";
  return new Date(time).toLocaleTimeString("vi-VN", {
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Auto Refresh Hook
 */
export const useAutoRefresh = (callback, interval = 30000, dependencies = []) => {
  useEffect(() => {
    const timer = setInterval(callback, interval);
    return () => clearInterval(timer);
  }, dependencies);
};

/**
 * Local Storage Hook
 */
export const useLocalStorage = (key, defaultValue) => {
  const [value, setValue] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return defaultValue;
    }
  });

  const setStoredValue = (newValue) => {
    try {
      setValue(newValue);
      localStorage.setItem(key, JSON.stringify(newValue));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [value, setStoredValue];
};

export default {
  LoadingSpinner,
  ErrorMessage,
  SuccessMessage,
  EmptyState,
  SearchInput,
  RefreshButton,
  StatusBadge,
  CardContainer,
  StatsCard,
  DatePicker,
  formatCurrency,
  formatDateTime,
  formatDate,
  formatTime,
  useAutoRefresh,
  useLocalStorage
};
