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
    BASE: `${import.meta.env.VITE_API_PREFIX}/doctor/appointments`,
    // Legacy endpoints (for backward compatibility)
    QUEUE: (doctorId) => `${import.meta.env.VITE_API_PREFIX}/doctor/appointments/queue/${doctorId}`,
    IN_PROGRESS: (doctorId) =>
      `${import.meta.env.VITE_API_PREFIX}/doctor/appointments/in_progress/${doctorId}`,
    COMPLETED: (doctorId) =>
      `${import.meta.env.VITE_API_PREFIX}/doctor/appointments/completed/${doctorId}`,
    UPDATE_STATUS: (appointmentId) =>
      `${import.meta.env.VITE_API_PREFIX}/appointments/${appointmentId}/status`,
  },

  EXAMS: {
    CURRENT: (patientId) => `${import.meta.env.VITE_API_PREFIX}/exams/current/${patientId}`,
    SAVE: (appointmentId) => `${import.meta.env.VITE_API_PREFIX}/exams/${appointmentId}`,
  },
  TESTS: {
    AVAILABLE: `${import.meta.env.VITE_API_PREFIX}/services/tests/available`,
    ONGOING: (patientId) => `${import.meta.env.VITE_API_PREFIX}/patients/${patientId}/ongoing-tests`,
    CREATE_REQUEST: `${import.meta.env.VITE_API_PREFIX}/test-requests`,
  },
  PRESCRIPTIONS: {
    ARV_REGIMENS: `${import.meta.env.VITE_API_PREFIX}/arv-regimens`,
    CREATE: `${import.meta.env.VITE_API_PREFIX}/prescriptions`,
  },
  SLOTS: {
    LIST: `${import.meta.env.VITE_API_PREFIX}/slots`,
    STATS: (doctorId) => `${import.meta.env.VITE_API_PREFIX}/doctor/${doctorId}/slots-stats`,
  },
};
