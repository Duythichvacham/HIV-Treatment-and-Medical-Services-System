import { useState, useEffect, useCallback } from "react";
import { arvRegimenManagerApi } from "../../../services/arvRegimenApi";

export const useARVRegimens = () => {
  const [regimens, setRegimens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch regimens
  const fetchRegimens = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await arvRegimenManagerApi.getAll();

      if (response.success && response.data) {
        setRegimens(response.data);
      } else {
        setError("Không thể tải danh sách phác đồ ARV");
      }
    } catch (err) {
      console.error("Error fetching ARV regimens:", err);
      setError("Có lỗi xảy ra khi tải danh sách phác đồ ARV");
    } finally {
      setLoading(false);
    }
  }, []);

  // Create regimen
  const createRegimen = useCallback(
    async (regimenData) => {
      try {
        const response = await arvRegimenManagerApi.create(regimenData);
        if (response.success) {
          await fetchRegimens(); // Refresh list
          return { success: true, message: "Thêm phác đồ thành công" };
        } else {
          return {
            success: false,
            message: response.message || "Có lỗi xảy ra",
          };
        }
      } catch (err) {
        console.error("Error creating regimen:", err);
        return { success: false, message: "Có lỗi xảy ra khi thêm phác đồ" };
      }
    },
    [fetchRegimens]
  );

  // Update regimen
  const updateRegimen = useCallback(
    async (regimenId, regimenData) => {
      try {
        const response = await arvRegimenManagerApi.update(
          regimenId,
          regimenData
        );
        if (response.success) {
          await fetchRegimens(); // Refresh list
          return { success: true, message: "Cập nhật phác đồ thành công" };
        } else {
          return {
            success: false,
            message: response.message || "Có lỗi xảy ra",
          };
        }
      } catch (err) {
        console.error("Error updating regimen:", err);
        return {
          success: false,
          message: "Có lỗi xảy ra khi cập nhật phác đồ",
        };
      }
    },
    [fetchRegimens]
  );

  // Toggle active status
  const toggleStatus = useCallback(
    async (regimenId, isActive) => {
      try {
        const response = await arvRegimenManagerApi.setActive(
          regimenId,
          isActive
        );
        if (response.success) {
          await fetchRegimens(); // Refresh list
          return {
            success: true,
            message: `${
              isActive ? "Kích hoạt" : "Tạm dừng"
            } phác đồ thành công`,
          };
        } else {
          return {
            success: false,
            message: response.message || "Có lỗi xảy ra",
          };
        }
      } catch (err) {
        console.error("Error toggling status:", err);
        return {
          success: false,
          message: "Có lỗi xảy ra khi thay đổi trạng thái",
        };
      }
    },
    [fetchRegimens]
  );

  // Filter functions
  const filterRegimens = useCallback(
    (searchTerm, filterStatus) => {
      return regimens.filter((regimen) => {
        const matchesSearch =
          regimen.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          regimen.components.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (regimen.for_group &&
            regimen.for_group.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesFilter =
          filterStatus === "all" ||
          (filterStatus === "active" && regimen.is_active) ||
          (filterStatus === "inactive" && !regimen.is_active);

        return matchesSearch && matchesFilter;
      });
    },
    [regimens]
  );

  // Get statistics
  const getStats = useCallback(() => {
    const total = regimens.length;
    const active = regimens.filter((r) => r.is_active).length;
    const inactive = total - active;

    return {
      total,
      active,
      inactive,
      activePercentage: total > 0 ? Math.round((active / total) * 100) : 0,
    };
  }, [regimens]);

  // Initialize
  useEffect(() => {
    fetchRegimens();
  }, [fetchRegimens]);

  return {
    regimens,
    loading,
    error,
    fetchRegimens,
    createRegimen,
    updateRegimen,
    toggleStatus,
    filterRegimens,
    getStats,
    setError,
  };
};
