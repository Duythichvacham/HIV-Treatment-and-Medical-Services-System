import api from "./api";

export const fetchLabResultDetail = async (appointment_id) => {
  try {
    console.log("appointment id lab test: ", appointment_id); // Debug
    const response = await api.get(
      `${import.meta.env.VITE_API_PREFIX}/lab/test/results?appointment_id=${appointment_id}`
    );
    console.log("Lab result detail:", response.data); // Debug
    return response.data;
  } catch (error) {
    console.error("Error fetching lab result detail:", error);
    throw error;
  }
};

export const fetchSelfRegisteredOrders = async ({ date }) => {
  try {
    const response = await api.get(
      `${import.meta.env.VITE_API_PREFIX}/lab/appointments/test?bookingDate=${date}`
    );
    console.log("Self-registered orders:", response.data); // Debug
    return response.data;
  } catch (error) {
    console.error("Error fetching self-registered orders:", error);
    return [];
  }
};

export const fetchDoctorOrders = async ({ date }) => {
  try {
    const response = await api.get(
      `${import.meta.env.VITE_API_PREFIX}/lab/appointments/test-request?bookingDate=${date}`
    );
    console.log("Doctor orders:", response.data); // Debug
    return response.data;
  } catch (error) {
    console.error("Error fetching doctor orders:", error);
    return [];
  }
};

export const updateLabAppointmentStatus = async (appointmentId, status) => {
  try {
    const response = await api.patch(
      `${import.meta.env.VITE_API_PREFIX}/appointments/${appointmentId}/status`,
      { status }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating lab appointment status:", error);
    throw error;
  }
};

export const updateTestRequestStatus = async (requestId, status) => {
  try {
    const response = await api.patch(
      `${import.meta.env.VITE_API_PREFIX}/test-request/${requestId}/status`,
      { status }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating test request status:", error);
    throw error;
  }
};

export const saveTestResults = async (payload) => {
  try {
    const response = await api.post(`${import.meta.env.VITE_API_PREFIX}/lab/test/results`, payload);
    return response.data;
  } catch (error) {
    console.error("Error saving test results:", error);
    throw error;
  }
};
