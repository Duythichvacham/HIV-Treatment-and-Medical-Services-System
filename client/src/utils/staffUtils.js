/**
 * Staff Utility Functions
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

export const getTestTypeColor = (serviceId, serviceName = '') => {
  const name = serviceName.toLowerCase();
  if (serviceId === 4 || name.includes('sàng lọc')) {
    return 'bg-yellow-100 text-yellow-700';
  }
  if (serviceId === 5 || name.includes('khẳng định')) {
    return 'bg-red-100 text-red-700';
  }
  if (serviceId === 3 || name.includes('định kỳ')) {
    return 'bg-purple-100 text-purple-700';
  }
  return 'bg-gray-100 text-gray-700';
};

export const getStatusBadgeStyle = (status) => {
  switch (status) {
    case 'requested':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'in_progress':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'completed':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'cancelled':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const calculateAge = (birthDate) => {
  if (!birthDate) return null;
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const filterTestsBySearch = (tests, searchTerm) => {
  if (!searchTerm.trim()) return tests;
  
  const searchLower = searchTerm.toLowerCase();
  return tests.filter(test => {
    return (
      (test.patient_name || test.name || '').toLowerCase().includes(searchLower) ||
      (test.code || '').toLowerCase().includes(searchLower) ||
      (test.service_name || test.test || '').toLowerCase().includes(searchLower) ||
      (test.type_name || test.type || '').toLowerCase().includes(searchLower) ||
      (test.doctor_name || test.doctor || '').toLowerCase().includes(searchLower)
    );
  });
};

export const validateLabResult = (result, testType) => {
  const errors = [];
  
  if (!result || typeof result !== 'object') {
    errors.push('Kết quả xét nghiệm không hợp lệ');
    return { isValid: false, errors };
  }
  
  // Validate based on test type
  if (testType === 'HIV') {
    if (!result.value || !['Positive', 'Negative', 'Indeterminate'].includes(result.value)) {
      errors.push('Kết quả HIV phải là Positive, Negative hoặc Indeterminate');
    }
  }
  
  if (testType === 'CD4') {
    const cd4Value = parseFloat(result.value);
    if (isNaN(cd4Value) || cd4Value < 0 || cd4Value > 2000) {
      errors.push('Giá trị CD4 phải từ 0-2000 cells/μL');
    }
  }
  
  if (testType === 'Viral Load') {
    const viralLoad = parseFloat(result.value);
    if (isNaN(viralLoad) || viralLoad < 0) {
      errors.push('Viral Load phải là số dương');
    }
  }
  
  if (!result.notes || result.notes.trim().length < 10) {
    errors.push('Ghi chú phải có ít nhất 10 ký tự');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const sortTestsByPriority = (tests) => {
  if (!Array.isArray(tests)) return [];
  
  const priorityOrder = {
    'urgent': 1,
    'high': 2, 
    'normal': 3,
    'low': 4
  };
  
  return tests.sort((a, b) => {
    const aPriority = priorityOrder[a.priority] || 999;
    const bPriority = priorityOrder[b.priority] || 999;
    
    if (aPriority !== bPriority) {
      return aPriority - bPriority;
    }
    
    // Secondary sort by created date (newest first)
    const aDate = new Date(a.created_at || a.createdAt);
    const bDate = new Date(b.created_at || b.createdAt);
    return bDate - aDate;
  });
};

export const calculateStatistics = (tests, timeframe = 'today') => {
  if (!Array.isArray(tests)) {
    return {
      total: 0,
      completed: 0,
      pending: 0,
      inProgress: 0,
      completionRate: 0
    };
  }
  
  const now = new Date();
  let startDate;
  
  switch (timeframe) {
    case 'today':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    default:
      startDate = new Date(0);
  }
  
  const filteredTests = tests.filter(test => {
    const testDate = new Date(test.created_at || test.createdAt);
    return testDate >= startDate;
  });
  
  const total = filteredTests.length;
  const completed = filteredTests.filter(test => test.status === 'completed').length;
  const pending = filteredTests.filter(test => test.status === 'requested').length;
  const inProgress = filteredTests.filter(test => test.status === 'in_progress').length;
  
  return {
    total,
    completed,
    pending,
    inProgress,
    completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
  };
};

export const generateReportData = (tests, options = {}) => {
  const {
    groupBy = 'date'
  } = options;
  
  if (!Array.isArray(tests)) return null;
  
  const stats = calculateStatistics(tests, 'month');
  
  let groupedData = {};
  if (groupBy === 'date') {
    groupedData = tests.reduce((acc, test) => {
      const date = formatDate(test.created_at || test.createdAt);
      if (!acc[date]) acc[date] = [];
      acc[date].push(test);
      return acc;
    }, {});
  } else if (groupBy === 'type') {
    groupedData = tests.reduce((acc, test) => {
      const type = test.service_name || test.type_name || 'Unknown';
      if (!acc[type]) acc[type] = [];
      acc[type].push(test);
      return acc;
    }, {});
  }
  
  return {
    summary: stats,
    groupedData,
    metadata: {
      generatedAt: new Date().toISOString(),
      totalTests: tests.length,
      timeframe: 'Last 30 days'
    }
  };
};

export const formatLabValue = (value, testType, unit = '') => {
  if (value === null || value === undefined) return '—';
  
  // Special formatting for different test types
  switch (testType?.toLowerCase()) {
    case 'cd4':
      return `${parseInt(value)} cells/μL`;
    case 'viral load': {
      const numValue = parseFloat(value);
      if (numValue < 50) return '< 50 copies/mL (Undetectable)';
      return `${numValue.toLocaleString()} copies/mL`;
    }
    case 'hiv':
      return value;
    default:
      return unit ? `${value} ${unit}` : value;
  }
};

export const getTestUrgencyColor = (priority, createdAt) => {
  const hoursSinceCreated = (new Date() - new Date(createdAt)) / (1000 * 60 * 60);
  
  if (priority === 'urgent' || hoursSinceCreated > 48) {
    return 'bg-red-100 text-red-800 border-red-200';
  }
  if (priority === 'high' || hoursSinceCreated > 24) {
    return 'bg-orange-100 text-orange-800 border-orange-200';
  }
  if (priority === 'normal') {
    return 'bg-blue-100 text-blue-800 border-blue-200';
  }
  return 'bg-gray-100 text-gray-800 border-gray-200';
};
