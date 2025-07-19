// src/hooks/useRevenue.js
import { useState, useEffect, useCallback } from "react";
import { fetchRevenue } from "../../services/revenueApi";

const useRevenue = (initialGroup = "yearly", initialStatus = "paid") => {
  const [revenue, setRevenue] = useState([]);
  const [group, setGroup] = useState(initialGroup);
  const [status, setStatus] = useState(initialStatus);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRevenueData = useCallback(async (group, status) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchRevenue(group, status);
      setRevenue(response.data || []);
      setError(null);
    } catch (err) {
      console.error("❌ useRevenue - Error:", err.message);
      setError(err.message || "Lỗi khi tải dữ liệu doanh thu");
      setRevenue([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRevenueData(group, status);
  }, [group, status, fetchRevenueData]);

  return {
    revenue,
    group,
    setGroup,
    status,
    setStatus,
    loading,
    error,
  };
};

export default useRevenue;
