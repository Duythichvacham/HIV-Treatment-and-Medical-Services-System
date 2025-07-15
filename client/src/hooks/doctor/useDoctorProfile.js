import { useCallback, useEffect, useState } from "react";
import { doctorApi } from "../../services/doctorApi";

export const useDoctorProfile = (doctorId) => {
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch doctor profile
  const fetchDoctorProfile = useCallback(async () => {
    if (!doctorId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await doctorApi.getDoctorProfile(doctorId);
      if (response.success && response.data.length > 0) {
        setDoctor(response.data[0]);
      } else {
        setError("Không tìm thấy thông tin bác sĩ");
      }
    } catch (err) {
      setError(err.message || "Có lỗi xảy ra khi tải thông tin bác sĩ");
      setDoctor(null);
    } finally {
      setLoading(false);
    }
  }, [doctorId]);

  //   // Refresh doctor profile
  //   const refreshDoctorProfile = useCallback(() => {
  //     fetchDoctorProfile();
  //   }, [fetchDoctorProfile]);

  useEffect(() => {
    if (doctorId) {
      fetchDoctorProfile();
    }
  }, [doctorId, fetchDoctorProfile]);

  // Update doctor profile
  const updateDoctorProfile = useCallback(
    async (updateData) => {
      if (!doctorId) return;

      setLoading(true);
      setError(null);

      try {
        await doctorApi.updateDoctorProfile(doctorId, updateData);
        await fetchDoctorProfile(); // Làm mới dữ liệu sau khi cập nhật
        return { success: true };
      } catch (err) {
        setError(err.message || "Có lỗi xảy ra khi cập nhật thông tin bác sĩ");
        return { success: false, error: err.message };
      } finally {
        setLoading(false);
      }
    },
    [doctorId, fetchDoctorProfile]
  );

  return {
    doctor,
    loading,
    error,
    // refreshDoctorProfile: fetchDoctorProfile,
    updateDoctorProfile,
  };
};
