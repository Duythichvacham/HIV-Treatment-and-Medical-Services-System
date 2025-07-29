import api from "./api";

export const sendTestResult = async (test_note_id) => {
  try {
    const response = await api.post("/api/v1/lab/send-test-result", {
      test_note_id,
    });
    return response.data;
  } catch (error) {
    console.error("Error sending test result:", error);
    throw error;
  }
};
