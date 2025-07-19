// src/components/RevenueChart.jsx
import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import useRevenue from "../../../../hooks/manager/useRevenue";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const RevenueChart = () => {
  const { revenue, group, setGroup, status, setStatus, loading, error } =
    useRevenue();

  const chartData = {
    labels: revenue.map((item) => item.period),
    datasets: [
      {
        label: "Doanh thu",
        data: revenue.map((item) => item.total_revenue),
        backgroundColor: "#a855f7",
        borderColor: "#9333ea",
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" },
      tooltip: {
        callbacks: {
          label: (context) => `${context.parsed.y.toLocaleString("vi-VN")} VNĐ`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => `${value.toLocaleString("vi-VN")} VNĐ`,
        },
      },
    },
  };

  const handleFilterChange = (newFilter) => {
    setGroup(newFilter);
  };

  const handleStatusChange = (newStatus) => {
    setStatus(newStatus);
  };

  if (loading)
    return <div className="text-center py-12 text-gray-600">Đang tải...</div>;
  if (error)
    return <div className="text-center py-12 text-red-600">Lỗi: {error}</div>;

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Quản lý Doanh thu
      </h3>
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex gap-2">
          <button
            className={`px-4 py-2 rounded-full font-semibold ${
              group === "yearly"
                ? "bg-purple-500 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
            onClick={() => handleFilterChange("yearly")}
          >
            Theo năm
          </button>
          <button
            className={`px-4 py-2 rounded-full font-semibold ${
              group === "quarterly"
                ? "bg-purple-500 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
            onClick={() => handleFilterChange("quarterly")}
          >
            Theo quý
          </button>
          <button
            className={`px-4 py-2 rounded-full font-semibold ${
              group === "monthly"
                ? "bg-purple-500 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
            onClick={() => handleFilterChange("monthly")}
          >
            Theo tháng
          </button>
        </div>
        <div className="flex gap-2">
          <button
            className={`px-4 py-2 rounded-full font-semibold ${
              status === "paid"
                ? "bg-purple-500 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
            onClick={() => handleStatusChange("paid")}
          >
            Đã thanh toán
          </button>
          <button
            className={`px-4 py-2 rounded-full font-semibold ${
              status === "pending"
                ? "bg-purple-500 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
            onClick={() => handleStatusChange("pending")}
          >
            Chờ thanh toán
          </button>
          <button
            className={`px-4 py-2 rounded-full font-semibold ${
              status === "cancelled"
                ? "bg-purple-500 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
            onClick={() => handleStatusChange("cancelled")}
          >
            Đã hủy
          </button>
        </div>
      </div>
      <div style={{ height: "400px" }}>
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
};

export default RevenueChart;
