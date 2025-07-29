import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { useDoctorProfile } from "../../hooks/doctor/useDoctorProfile";
import { getDoctorImage } from "../../utils/doctorImageUtils";

const DoctorProfile = () => {
  const { user } = useAuth();

  const doctorId = user?.doctor_id;
  const { doctor, loading, error, updateDoctorProfile } =
    useDoctorProfile(doctorId);

  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    degrees: "",
    experience_years: "",
  });

  useEffect(() => {
    if (doctor) {
      setFormData({
        full_name: doctor.full_name,
        email: doctor.email,
        phone: doctor.phone,
        degrees: doctor.degrees,
        experience_years: doctor.experience_years.toString(),
      });
    }
  }, [doctor]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const updateData = {
        ...formData,
        experience_years: parseInt(formData.experience_years, 10),
      };
      const result = await updateDoctorProfile(updateData);
      if (result.success) {
        setIsEditMode(false);
        alert("Cập nhật thông tin thành công!");
      } else {
        alert("Lỗi khi cập nhật thông tin: " + result.error);
      }
    } catch (err) {
      console.error("Error updating doctor profile:", err);
    }
  };

  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
  };

  if (loading) {
    return <LoadingSpinner message="Đang tải thông tin bác sĩ..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-blue-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Hồ sơ bác sĩ
              </h1>
              <p className="text-gray-600">Thông tin cá nhân và chuyên môn</p>
            </div>
            <button
              onClick={toggleEditMode}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                isEditMode
                  ? "bg-gray-500 hover:bg-gray-600 text-white"
                  : "bg-blue-500 hover:bg-blue-600 text-white"
              }`}
            >
              {isEditMode ? "Hủy" : "Chỉnh sửa"}
            </button>
          </div>
        </div>

        {/* Profile Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-8">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Profile Image */}
              <div className="flex-shrink-0 text-center">
                <img
                  src={getDoctorImage(doctor.image_url)}
                  alt={doctor.full_name}
                  className="w-32 h-32 rounded-full object-cover border-3 border-gray-200 mx-auto"
                />
                <div className="mt-4 inline-flex items-center px-3 py-1 bg-green-100 rounded-full">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-green-700 text-sm font-medium">
                    Đang hoạt động
                  </span>
                </div>
              </div>

              {/* Profile Details */}
              <div className="flex-1">
                {isEditMode ? (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Họ và tên
                        </label>
                        <input
                          type="text"
                          name="full_name"
                          value={formData.full_name}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Số điện thoại
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Số năm kinh nghiệm
                        </label>
                        <input
                          type="number"
                          name="experience_years"
                          value={formData.experience_years}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                          min="0"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bằng cấp
                      </label>
                      <input
                        type="text"
                        name="degrees"
                        value={formData.degrees}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>

                    <div className="flex justify-end gap-4 pt-4">
                      <button
                        type="submit"
                        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                      >
                        Lưu thay đổi
                      </button>
                      <button
                        type="button"
                        onClick={toggleEditMode}
                        className="px-6 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                      >
                        Hủy
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-6">
                    {/* Doctor Name and Title */}
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {doctor.full_name}
                      </h2>
                      <p className="text-gray-600 text-lg">{doctor.degrees}</p>
                    </div>

                    {/* Information Grid */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">
                            Email
                          </h4>
                          <p className="text-gray-900">{doctor.email}</p>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">
                            Số điện thoại
                          </h4>
                          <p className="text-gray-900">{doctor.phone}</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">
                            Kinh nghiệm
                          </h4>
                          <p className="text-gray-900">
                            {doctor.experience_years} năm
                          </p>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">
                            Ngày tham gia
                          </h4>
                          <p className="text-gray-900">
                            {new Date(doctor.created_at).toLocaleDateString(
                              "vi-VN"
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorProfile;
