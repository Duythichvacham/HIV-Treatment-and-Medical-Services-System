// Utility functions for formatting data

export const formatDate = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString("vi-VN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const formatDateShort = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString("vi-VN");
};

export const formatTime = (time) => {
  if (!time) return "";
  return new Date(`1970-01-01T${time}`).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatDateTime = (datetime) => {
  if (!datetime) return "";
  return new Date(datetime).toLocaleString("vi-VN");
};

export const formatPatientCode = (patientId) => {
  if (!patientId) return "";
  return `HIV${String(patientId).padStart(3, "0")}`;
};

export const formatAge = (birthDate) => {
  if (!birthDate) return "";
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return `${age} tuổi`;
};

export const formatGender = (gender) => {
  const genderMap = {
    male: "Nam",
    female: "Nữ",
  };
  return genderMap[gender] || gender;
};

export const formatPhone = (phone) => {
  if (!phone) return "";
  // Format: 0xxx xxx xxx
  return phone.replace(/(\d{4})(\d{3})(\d{3})/, "$1 $2 $3");
};

export const formatBMI = (weight, height) => {
  if (!weight || !height) return "";
  const heightInMeters = height / 100;
  const bmi = weight / (heightInMeters * heightInMeters);
  return bmi.toFixed(1);
};

export const getBMIStatus = (bmi) => {
  if (!bmi) return "";
  const bmiValue = parseFloat(bmi);

  if (bmiValue < 18.5) return { status: "Thiếu cân", color: "text-blue-600" };
  if (bmiValue < 25) return { status: "Bình thường", color: "text-green-600" };
  if (bmiValue < 30) return { status: "Thừa cân", color: "text-yellow-600" };
  return { status: "Béo phì", color: "text-red-600" };
};

export const formatCurrency = (amount) => {
  if (!amount) return "0 ₫";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

export const getStatusColor = (status) => {
  const statusColors = {
    requested: "bg-orange-100 text-orange-800",
    in_progress: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };
  return statusColors[status] || "bg-gray-100 text-gray-800";
};

export const getStatusText = (status) => {
  const statusTexts = {
    requested: "Chờ khám",
    in_progress: "Đang khám",
    completed: "Hoàn thành",
    cancelled: "Đã hủy",
  };
  return statusTexts[status] || status;
};

export const getAdherenceColor = (adherence) => {
  const adherenceColors = {
    good: "text-green-600",
    average: "text-yellow-600",
    poor: "text-red-600",
  };
  return adherenceColors[adherence] || "text-gray-600";
};

export const getAdherenceText = (adherence) => {
  const adherenceTexts = {
    good: "Tốt (>95%)",
    average: "Trung bình (85-95%)",
    poor: "Kém (<85%)",
  };
  return adherenceTexts[adherence] || adherence;
};
