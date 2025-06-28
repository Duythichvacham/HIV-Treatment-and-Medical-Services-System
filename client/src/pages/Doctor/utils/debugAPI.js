// Debug utility để test API calls trực tiếp
import { appointmentApi } from "../services/appointmentApi";

export const debugAppointmentAPI = {
  // Test individual API calls
  testGetQueue: async (doctorId = 1, date = "2025-06-26") => {
    console.log("🧪 Testing getQueue...");
    try {
      const result = await appointmentApi.getQueue(doctorId, date);
      console.log("✅ getQueue success:", result);
      return result;
    } catch (error) {
      console.error("❌ getQueue error:", error);
      return null;
    }
  },

  testGetInProgress: async (doctorId = 1, date = "2025-06-26") => {
    console.log("🧪 Testing getInProgress...");
    try {
      const result = await appointmentApi.getInProgress(doctorId, date);
      console.log("✅ getInProgress success:", result);
      return result;
    } catch (error) {
      console.error("❌ getInProgress error:", error);
      return null;
    }
  },

  testGetCompleted: async (doctorId = 1, date = "2025-06-26") => {
    console.log("🧪 Testing getCompleted...");
    try {
      const result = await appointmentApi.getCompleted(doctorId, date);
      console.log("✅ getCompleted success:", result);
      return result;
    } catch (error) {
      console.error("❌ getCompleted error:", error);
      return null;
    }
  },

  testGetAllByDate: async (doctorId = 1, date = "2025-06-26") => {
    console.log("🧪 Testing getAllByDate...");
    try {
      const result = await appointmentApi.getAllByDate(doctorId, date);
      console.log("✅ getAllByDate success:", result);
      return result;
    } catch (error) {
      console.error("❌ getAllByDate error:", error);
      return null;
    }
  },

  // Test all APIs at once
  testAll: async (doctorId = 1, date = "2025-06-26") => {
    console.log("🧪 Testing all appointment APIs...");
    console.log("📅 Using doctorId:", doctorId, "date:", date);

    const results = {
      queue: await debugAppointmentAPI.testGetQueue(doctorId, date),
      inProgress: await debugAppointmentAPI.testGetInProgress(doctorId, date),
      completed: await debugAppointmentAPI.testGetCompleted(doctorId, date),
      allByDate: await debugAppointmentAPI.testGetAllByDate(doctorId, date),
    };

    console.log("📊 Final results summary:");
    console.log(
      "  Queue length:",
      Array.isArray(results.queue) ? results.queue.length : "Not array"
    );
    console.log(
      "  InProgress length:",
      Array.isArray(results.inProgress)
        ? results.inProgress.length
        : "Not array"
    );
    console.log(
      "  Completed length:",
      Array.isArray(results.completed) ? results.completed.length : "Not array"
    );
    console.log("  AllByDate structure:", results.allByDate);

    return results;
  },

  // Test raw API call
  testRawAPI: async (
    doctorId = 1,
    status = "requested",
    date = "2025-06-26"
  ) => {
    console.log("🧪 Testing raw API call...");
    try {
      const response = await fetch(
        `http://localhost:5000/api/v1/doctor/appointments?doctor_id=${doctorId}&status=${status}&bookingDate=${date}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      console.log("🔍 Raw API response:", data);
      console.log("🔍 Response status:", response.status);
      console.log(
        "🔍 Response headers:",
        Object.fromEntries(response.headers.entries())
      );

      return data;
    } catch (error) {
      console.error("❌ Raw API error:", error);
      return null;
    }
  },
};

// Expose to window for browser console testing
if (typeof window !== "undefined") {
  window.debugAppointmentAPI = debugAppointmentAPI;
}
