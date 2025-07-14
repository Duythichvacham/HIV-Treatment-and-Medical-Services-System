// File: client/src/hooks/usePagination.js
import { useState, useMemo } from "react";

/**
 * Custom hook để quản lý logic pagination
 * @param {Array} data - Dữ liệu gốc cần phân trang
 * @param {number} itemsPerPage - Số items trên mỗi trang
 * @returns {object} - Object chứa state và functions cho pagination
 */
const usePagination = (data, itemsPerPage = 10) => {
  // State để track trang hiện tại
  const [currentPage, setCurrentPage] = useState(1);

  // Tính toán các giá trị pagination
  //useMemo để tránh tính toán lại khi data không thay đổi vì nó lưu tạm giá trị đã tính toán
  // Điều này giúp tránh việc tính toán lại mỗi khi component re-render
  //giúp tối ưu hiệu suất khi dữ liệu lớn
  const paginationData = useMemo(() => {
    // Tổng số items
    const totalItems = data.length;

    // Tổng số trang (làm tròn lên)
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    // Index bắt đầu và kết thúc cho trang hiện tại
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    // Dữ liệu cho trang hiện tại
    const currentData = data.slice(startIndex, endIndex);

    return {
      totalItems,
      totalPages,
      startIndex,
      endIndex,
      currentData,
    };
  }, [data, currentPage, itemsPerPage]);

  // Function để chuyển trang
  const goToPage = (page) => {
    // Validate page number
    if (page >= 1 && page <= paginationData.totalPages) {
      setCurrentPage(page);
    }
  };

  // Function để reset về trang đầu (dùng khi filter data)
  const resetToFirstPage = () => {
    setCurrentPage(1);
  };

  // Function để đi tới trang trước
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Function để đi tới trang sau
  const goToNextPage = () => {
    if (currentPage < paginationData.totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return {
    currentPage,
    ...paginationData,
    goToPage,
    resetToFirstPage,
    goToPreviousPage,
    goToNextPage,
  };
};

export default usePagination;
