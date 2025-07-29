import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../contexts/AuthContext";
import LoadingSpinner from "../../components/common/LoadingSpinner";
// Đảm bảo rằng bạn đã cập nhật useDoctorProfile theo hướng dẫn trước
import { useDoctorProfile } from "../../hooks/doctor/useDoctorProfile";
import { getDoctorImage } from "../../utils/doctorImageUtils";
import useUpdateDoctorImage from "../../hooks/doctor/useUpdateDoctorImage";

const DoctorProfile = () => {
  const { user } = useAuth();
  // Đảm bảo doctorId được lấy đúng cách. Nếu user là null ban đầu, doctorId cũng sẽ là null.
  const doctorId = user?.doctor_id;

  // Truyền doctorId vào useDoctorProfile
  const { doctor, loading, error, updateDoctorProfile } =
    useDoctorProfile(doctorId);
  const {
    uploadImage,
    uploading,
    error: uploadError,
  } = useUpdateDoctorImage(doctorId); // Đảm bảo useUpdateDoctorImage cũng nhận doctorId

  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    degrees: "",
    experience_years: "",
    image_url: "", // Thêm image_url vào formData để quản lý URL ảnh hiện tại
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  // Cập nhật formData khi doctor data thay đổi
  useEffect(() => {
    if (doctor) {
      setFormData({
        full_name: doctor.full_name,
        email: doctor.email,
        phone: doctor.phone,
        degrees: doctor.degrees,
        experience_years: doctor.experience_years.toString(),
        image_url: doctor.image_url || "", // Gán URL ảnh hiện có vào formData
      });
      // Đặt lại previewImage nếu không có file mới được chọn
      if (!selectedFile) {
        setPreviewImage(doctor.image_url);
      }
    }
  }, [doctor, selectedFile]); // Thêm selectedFile vào dependency array

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ["image/jpeg", "image/png"];
      if (!allowedTypes.includes(file.type)) {
        alert("Vui lòng chọn file định dạng JPEG hoặc PNG!");
        setSelectedFile(null); // Clear selected file
        setPreviewImage(doctor?.image_url); // Revert preview to current doctor image
        return;
      }

      const maxSizeInMB = 5;
      const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
      if (file.size > maxSizeInBytes) {
        alert(`File phải nhỏ hơn ${maxSizeInMB}MB!`);
        setSelectedFile(null); // Clear selected file
        setPreviewImage(doctor?.image_url); // Revert preview to current doctor image
        return;
      }

      setSelectedFile(file);
      setPreviewImage(URL.createObjectURL(file));
    } else {
      setSelectedFile(null);
      setPreviewImage(doctor?.image_url); // Revert preview to current doctor image
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let finalImageUrl = formData.image_url; // Bắt đầu với URL hiện tại từ formData

      if (selectedFile) {
        // Nếu có file mới được chọn, tiến hành upload
        const uploadedImageUrl = await uploadImage(selectedFile);
        if (!uploadedImageUrl) {
          alert("Lỗi khi tải ảnh: " + (uploadError || "Không xác định"));
          return;
        }
        finalImageUrl = uploadedImageUrl; // Cập nhật URL ảnh mới
      }

      const updateData = {
        ...formData,
        experience_years: parseInt(formData.experience_years, 10),
        image_url: finalImageUrl, // Gửi URL ảnh cuối cùng (ảnh cũ hoặc ảnh mới upload)
      };

      const result = await updateDoctorProfile(updateData);

      if (result?.success) {
        // Sử dụng optional chaining để tránh lỗi nếu result là undefined
        setIsEditMode(false);
        setSelectedFile(null);
        // Sau khi cập nhật thành công, doctor object sẽ được useDoctorProfile cập nhật lại
        // và useEffect sẽ chạy để cập nhật formData và previewImage với URL mới nhất.
        alert("Cập nhật thông tin thành công!");
      } else {
        alert(
          "Lỗi khi cập nhật thông tin: " + (result?.error || "Không xác định")
        );
      }
    } catch (err) {
      console.error("Error updating doctor profile:", err);
      alert("Lỗi khi cập nhật thông tin: " + err.message);
    }
  };

  const toggleEditMode = () => {
    setIsEditMode((prevMode) => {
      if (prevMode) {
        // Nếu đang thoát khỏi chế độ chỉnh sửa (từ true sang false)
        // Reset lại formData về dữ liệu của doctor hiện tại và clear ảnh đã chọn
        if (doctor) {
          setFormData({
            full_name: doctor.full_name,
            email: doctor.email,
            phone: doctor.phone,
            degrees: doctor.degrees,
            experience_years: doctor.experience_years.toString(),
            image_url: doctor.image_url || "",
          });
          setPreviewImage(doctor.image_url);
        }
        setSelectedFile(null);
      }
      return !prevMode;
    });
  };

  if (loading) {
    return <LoadingSpinner message="Đang tải thông tin bác sĩ..." />;
  }

  // Hiển thị lỗi từ useDoctorProfile
  if (error) {
    return (
      <div className="min-h-screen bg-blue-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">Lỗi: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  // Nếu doctor là null nhưng không có lỗi, tức là doctorId có thể là null và hook đã trả về.
  // Hoặc dữ liệu chưa về kịp. Đảm bảo hiển thị LoadingSpinner nếu doctor chưa có dữ liệu.
  if (!doctor) {
    return <LoadingSpinner message="Đang chờ dữ liệu bác sĩ..." />;
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
                  src={doctor.image_url} // Ưu tiên ảnh preview, nếu không có thì dùng ảnh hiện tại của doctor
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

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ảnh đại diện
                      </label>
                      <div className="flex items-center gap-4">
                        <input
                          type="file"
                          accept="image/jpeg,image/png"
                          onChange={handleImageChange}
                          className="hidden"
                          id="upload-avatar"
                        />
                        <label
                          htmlFor="upload-avatar"
                          className="cursor-pointer px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                        >
                          Chọn ảnh
                        </label>
                        {/* Hiển thị ảnh preview hoặc ảnh hiện tại */}
                        {previewImage && (
                          <img
                            src={previewImage}
                            alt="Preview"
                            className="w-16 h-16 rounded-full object-cover border border-gray-300"
                          />
                        )}
                      </div>
                      {(uploading || uploadError) && (
                        <p className="mt-2 text-sm text-gray-500">
                          {uploading ? "Đang tải ảnh..." : uploadError}
                        </p>
                      )}
                    </div>

                    <div className="flex justify-end gap-4 pt-4">
                      <button
                        type="submit"
                        disabled={uploading}
                        className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                          uploading
                            ? "bg-blue-300 text-white cursor-not-allowed"
                            : "bg-blue-500 text-white hover:bg-blue-600"
                        }`}
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
        {uploadError && ( // Hiển thị lỗi upload riêng biệt
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">Lỗi tải ảnh: {uploadError}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorProfile;
