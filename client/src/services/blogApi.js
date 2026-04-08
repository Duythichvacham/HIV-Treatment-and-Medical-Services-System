// services/blogApi.js
import api from "./api";

// Lấy danh sách tất cả blog
export const fetchAllBlogs = async () => {
  try {
    const response = await api.get(`${import.meta.env.VITE_API_PREFIX}/blogs`);
    console.log("Danh sách blog:", response.data); // Debug
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách blog:", error);
    return [];
  }
};

// Lấy chi tiết một blog theo ID
export const fetchBlogById = async (blogId) => {
  try {
    const response = await api.get(`${import.meta.env.VITE_API_PREFIX}/blogs/${blogId}`);
    console.log("Chi tiết blog:", response.data); // Debug
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi lấy blog với ID ${blogId}:`, error);
    throw error; // Ném lỗi để hook xử lý
  }
};
