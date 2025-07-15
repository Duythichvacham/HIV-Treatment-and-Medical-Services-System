import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { useDoctorProfile } from "../../hooks/doctor/useDoctorProfile";
import doctorImage from "../../assets/doctors/doc1.png"; // Placeholder image

const DoctorProfile = () => {
  const { user } = useAuth();

  const doctorId = user?.doctor_id; // Lấy `doctor_id` từ thông tin người dùng
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

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Prepare data for update (convert experience_years to number)
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

  // Toggle edit mode
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
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Hồ sơ bác sĩ
            </h1>
            <p className="text-gray-600">Thông tin cá nhân và chuyên môn</p>
          </div>
          <button
            onClick={toggleEditMode}
            className={`px-4 py-2 rounded-lg transition-colors ${
              isEditMode
                ? "bg-gray-500 hover:bg-gray-600 text-white"
                : "bg-blue-500 hover:bg-blue-600 text-white"
            }`}
          >
            {isEditMode ? "Hủy" : "Chỉnh sửa"}
          </button>
        </div>

        {/* Profile Content */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Profile Image */}
            <div className="flex-shrink-0">
              <img
                // src={`../../assets/doctors/doc1.png`}
                src={doctorImage} // Placeholder image
                // src="../../assets/doctors/doc1.png"
                alt={doctor.full_name}
                className="w-32 h-32 rounded-full object-cover border-2 border-blue-100"
              />
            </div>

            {/* Profile Details */}
            <div className="flex-1">
              {isEditMode ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Họ và tên
                    </label>
                    <input
                      type="text"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleInputChange}
                      className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Bằng cấp
                    </label>
                    <input
                      type="text"
                      name="degrees"
                      value={formData.degrees}
                      onChange={handleInputChange}
                      className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Số năm kinh nghiệm
                    </label>
                    <input
                      type="number"
                      name="experience_years"
                      value={formData.experience_years}
                      onChange={handleInputChange}
                      className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      required
                      min="0"
                    />
                  </div>
                  <div className="flex justify-end gap-4">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Lưu thay đổi
                    </button>
                    <button
                      type="button"
                      onClick={toggleEditMode}
                      className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors"
                    >
                      Hủy
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {doctor.full_name}
                    </h2>
                    <p className="text-gray-600">{doctor.degrees}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">
                      <span className="font-medium">Email: </span>
                      {doctor.email}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">Số điện thoại: </span>
                      {doctor.phone}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">Kinh nghiệm: </span>
                      {doctor.experience_years} năm
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">Ngày tham gia: </span>
                      {new Date(doctor.created_at).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorProfile;
