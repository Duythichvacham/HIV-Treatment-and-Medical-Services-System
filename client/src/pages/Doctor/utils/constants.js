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
    BASE: "/api/v1/doctors/appointments",
    // Legacy endpoints (for backward compatibility)
    QUEUE: (doctorId) => `/api/v1/doctors/appointments/queue/${doctorId}`,
    IN_PROGRESS: (doctorId) =>
      `/api/v1/doctors/appointments/in_progress/${doctorId}`,
    COMPLETED: (doctorId) =>
      `/api/v1/doctors/appointments/completed/${doctorId}`,
    UPDATE_STATUS: (appointmentId) =>
      `/api/v1/appointments/${appointmentId}/status`,
  },
  PATIENTS: {
    DETAILS: (patientId) => `/api/v1/doctors/patients/${patientId}/details`,
    EXAM_HISTORY: (patientId) => `/api/v1/doctors/exam-history/${patientId}`,
  },
  EXAMS: {
    CURRENT: (patientId) => `/api/v1/doctors/current-exam/${patientId}`,
    SAVE: () => `/api/v1/doctors/save-exam-data`,
  },
  TESTS: {
    AVAILABLE: "/api/v1/doctors/available-tests",
    ONGOING: (patientId) => `/api/v1/doctors/ongoing-tests/${patientId}`,
    CREATE_REQUEST: "/api/v1/doctors/test-requests",
  },
  PRESCRIPTIONS: {
    ARV_REGIMENS: "/api/v1/arv-regimens/",
    CREATE: "/api/v1/doctors/prescriptions",
  },
  SLOTS: {
    LIST: "/api/v1/slots",
    STATS: (doctorId) => `/api/v1/doctors/${doctorId}/slots-stats`,
  },
};
