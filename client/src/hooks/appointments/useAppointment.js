import { useState, useEffect, useCallback } from "react";
import {
  getRegistrationStatistics,
  getPendingTestRequests,
  getPaymentHistory,
} from "../../services/api";
// import { useAuth } from "../../contexts/AuthContext";
/**
 * Hook for handling common appointment logic
 */
// export const useAppointment = () => {

// };
/**
 * Hook for handling registration staff logic
 */
export const useRegistrationStaff = () => {
  const [testRequests, setTestRequests] = useState([]);
  const [completedRequests, setCompletedRequests] = useState([]);
  const [stats, setStats] = useState({
    pending_requests: 0,
    today_revenue: 0,
    processed_today: 0,
  });
  const [activeTab, setActiveTab] = useState("process");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch data when component mounts and when tab changes
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Always fetch statistics
      const statsResponse = await getRegistrationStatistics();
      setStats(statsResponse.data);

      if (activeTab === "process") {
        // Fetch pending test requests
        console.log("Fetching pending test requests...");
        const pendingResponse = await getPendingTestRequests();
        console.log("Pending response:", pendingResponse);

        const requestsData = Array.isArray(pendingResponse.data)
          ? pendingResponse.data
          : [];
        setTestRequests(requestsData);
        console.log("Set testRequests to:", requestsData);
      } else if (activeTab === "history") {
        // Fetch payment history
        console.log("Fetching payment history...");
        const historyResponse = await getPaymentHistory();
        console.log("History response:", historyResponse);

        const historyData = Array.isArray(historyResponse.data)
          ? historyResponse.data
          : [];
        setCompletedRequests(historyData);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Không thể tải dữ liệu. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleProcessPayment = async (requestIndex) => {
    const request = testRequests[requestIndex];

    try {
      setLoading(true);
      // API call is already handled in PaymentModal, just update UI
      // Update UI
      setTestRequests((prev) =>
        prev.filter((_, index) => index !== requestIndex)
      );
      setStats((prev) => ({
        ...prev,
        pending_requests: prev.pending_requests - 1,
        processed_today: prev.processed_today + 1,
        today_revenue: prev.today_revenue + (request.total_price || 0),
      }));

      console.log("✅ Test request approved successfully");
    } catch (err) {
      console.error("❌ Error approving test request:", err);
      setError("Không thể xử lý thanh toán. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const getFilteredRequests = () => {
    if (activeTab === "process") {
      return testRequests.filter(
        (request) =>
          request.patient_name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          request.service_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } else {
      return completedRequests.filter(
        (request) =>
          request.patient_name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          request.service_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDateTime = (dateTime) => {
    return new Date(dateTime).toLocaleString("vi-VN");
  };

  return {
    // State
    testRequests,
    completedRequests,
    stats,
    activeTab,
    searchTerm,
    loading,
    error,

    // Actions
    setActiveTab,
    setSearchTerm,
    setError,
    fetchData,
    handleProcessPayment,

    // Computed
    getFilteredRequests,
    formatCurrency,
    formatDateTime,
  };
};
