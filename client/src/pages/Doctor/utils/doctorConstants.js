// Doctor Dashboard Constants
export const APPOINTMENT_STATUS = {
  REQUESTED: "requested",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};

export const TABS = {
  QUEUE: "queue",
  CONSULT: "consult",
};

export const EXAM_MODES = {
  EDIT: "edit",
  VIEW: "view",
};

export const EXAM_TABS = {
  CURRENT: "current",
  HISTORY: "history",
};

export const QUEUE_TYPES = {
  WAITING: "waiting",
  EXAMINING: "examining",
  COMPLETED: "completed",
};

export const VITAL_SIGNS_DEFAULTS = {
  heartRate: "",
  bloodPressure: "",
  temperature: "",
  weight: "",
  height: "",
  bmi: "",
};

export const PAGINATION_DEFAULTS = {
  page: 1,
  limit: 10,
};

export const API_ENDPOINTS = {
  APPOINTMENTS: {
    // New unified endpoint for all appointment queries
    BASE: "VITE_API_API_PREFIX/doctor/appointments",
    // Legacy endpoints (for backward compatibility)
    QUEUE: (doctorId) => `VITE_API_API_PREFIX/doctor/appointments/queue/${doctorId}`,
    IN_PROGRESS: (doctorId) =>
      `VITE_API_API_PREFIX/doctor/appointments/in_progress/${doctorId}`,
    COMPLETED: (doctorId) =>
      `VITE_API_API_PREFIX/doctor/appointments/completed/${doctorId}`,
    UPDATE_STATUS: (appointmentId) =>
      `VITE_API_API_PREFIX/appointments/${appointmentId}/status`,
  },

  EXAMS: {
    CURRENT: (patientId) => `VITE_API_API_PREFIX/exams/current/${patientId}`,
    SAVE: (appointmentId) => `VITE_API_API_PREFIX/exams/${appointmentId}`,
  },
  TESTS: {
    AVAILABLE: "VITE_API_API_PREFIX/services/tests/available",
    ONGOING: (patientId) => `VITE_API_API_PREFIX/patients/${patientId}/ongoing-tests`,
    CREATE_REQUEST: "VITE_API_API_PREFIX/test-requests",
  },
  PRESCRIPTIONS: {
    ARV_REGIMENS: "VITE_API_API_PREFIX/arv-regimens",
    CREATE: "VITE_API_API_PREFIX/prescriptions",
  },
  SLOTS: {
    LIST: "VITE_API_API_PREFIX/slots",
    STATS: (doctorId) => `VITE_API_API_PREFIX/doctor/${doctorId}/slots-stats`,
  },
};
