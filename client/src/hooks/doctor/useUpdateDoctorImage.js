import { useState } from "react";
import axios from "axios";

const useUpdateDoctorImage = () => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const uploadImage = async (file) => {
    if (!file) {
      setError("Vui lòng chọn một file ảnh");
      return null;
    }

    setUploading(true);
    setError(null);

    try {
      // Upload ảnh lên Cloudinary
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "HIV_HEALTH_CARE"); // Thay bằng upload preset từ Cloudinary
      formData.append("cloud_name", "dhtdgxgos"); // Thay bằng Cloud Name của bạn

      const response = await axios.post(
        "https://api.cloudinary.com/v1_1/dhtdgxgos/image/upload", // Thay "your_cloud_name" bằng Cloud Name của bạn
        formData
      );
      console.log("Upload response:", response);
      console.log("Upload response:", response.data);

      const imageUrl = response.data.secure_url;

      // Gửi URL ảnh lên server để cập nhật thông tin bác sĩ
      // const updateResponse = await axios.put(
      //   `${import.meta.env.VITE_API_PREFIX}/doctors/${doctorId}/image`,
      //   {
      //     image_url: imageUrl,
      //   }
      // );

      // if (updateResponse.data.success) {
      setUploading(false);
      return imageUrl; // Trả về URL ảnh mới
      // } else {
      //   throw new Error("Failed to update doctor image");
      // }
    } catch (err) {
      console.error("Error uploading image:", err);
      setError(err.message || "Lỗi khi tải ảnh lên");
      setUploading(false);
      return null;
    }
  };

  return { uploadImage, uploading, error };
};

export default useUpdateDoctorImage;
