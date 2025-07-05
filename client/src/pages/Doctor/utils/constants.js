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
  heart_rate: "",
  blood_pressure: "",
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
    BASE: "/api/v1/doctor/appointments",
    // Legacy endpoints (for backward compatibility)
    QUEUE: (doctorId) => `/api/v1/doctor/appointments/queue/${doctorId}`,
    IN_PROGRESS: (doctorId) =>
      `/api/v1/doctor/appointments/in_progress/${doctorId}`,
    COMPLETED: (doctorId) =>
      `/api/v1/doctor/appointments/completed/${doctorId}`,
    UPDATE_STATUS: (appointmentId) =>
      `/api/v1/appointments/${appointmentId}/status`,
  },
  PATIENTS: {
    DETAILS: (patientId) => `/api/v1/patients/${patientId}/details`,
    EXAM_HISTORY: (patientId) => `/api/v1/patients/${patientId}/exam-history`,
  },
  EXAMS: {
    CURRENT: (patientId) => `/api/v1/exams/current/${patientId}`,
    SAVE: (appointmentId) => `/api/v1/exams/${appointmentId}`,
  },
  TESTS: {
    AVAILABLE: "/api/v1/services/tests/available",
    ONGOING: (patientId) => `/api/v1/patients/${patientId}/ongoing-tests`,
    CREATE_REQUEST: "/api/v1/test-requests",
  },
  PRESCRIPTIONS: {
    ARV_REGIMENS: "/api/v1/arv-regimens",
    CREATE: "/api/v1/prescriptions",
  },
  SLOTS: {
    LIST: "/api/v1/slots",
    STATS: (doctorId) => `/api/v1/doctor/${doctorId}/slots-stats`,
  },
};
