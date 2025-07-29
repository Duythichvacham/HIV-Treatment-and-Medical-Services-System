import { useState } from "react";
import { sendTestResult } from "../../services/emailApi";
// import { sendTestResult } from "../../../../server/src/controllers/emailController";

const useSendTestResultEmail = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const sendEmail = async (test_note_id) => {
    setLoading(true);
    setError(null);

    try {
      console.log("Sending test_note_id:", test_note_id); // Log để kiểm tra giá trị gửi
      const response = await sendTestResult(test_note_id);
      console.log("Email sent successfully:", response);
    } catch (err) {
      console.error("Error sending email:", err);
      setError(err.message || "Có lỗi xảy ra khi gửi email");
    } finally {
      setLoading(false);
    }
  };

  return { sendEmail, loading, error };
};

export default useSendTestResultEmail;
