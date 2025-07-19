// src/hooks/useBlogs.js
import { useState, useEffect, useCallback } from "react";
import {
  fetchAllBlogs as apiFetchAllBlogs,
  fetchBlogById as apiFetchBlogById,
} from "../services/blogApi";

const useBlogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const formatBlog = useCallback((blog) => {
    console.log("🔍 formatBlog - Blog input:", blog); // Debug dữ liệu đầu vào
    return {
      id: blog.post_id, // Sử dụng post_id từ API
      title: blog.title || "Không có tiêu đề",
      excerpt: blog.content?.substring(0, 150) + "..." || "Không có nội dung",
      content: blog.content || "Không có nội dung",
      createdAt: blog.created_at || new Date().toISOString(),
      authorId: blog.author_id || 1,
      authorName: blog.author_name || "Đội ngũ HIV_HEALTH_CARE", // Giữ mặc định
      published: blog.published || false,
      isActive: blog.is_active || false,
    };
  }, []);

  const fetchBlogs = useCallback(async () => {
    console.log("🔍 useBlogs - Bắt đầu lấy danh sách blog");
    setLoading(true);
    setError(null);
    try {
      const blogsData = await apiFetchAllBlogs();
      console.log("🔍 useBlogs - Dữ liệu thô từ API:", blogsData);

      const formattedBlogs = blogsData
        .filter((blog) => blog.published === true && blog.is_active === true)
        .map((blog) => formatBlog(blog));

      console.log("🔍 useBlogs - Dữ liệu sau định dạng:", formattedBlogs);
      setBlogs(formattedBlogs);
      setError(null);
    } catch (err) {
      console.error("❌ useBlogs - Lỗi:", err.response?.data || err.message);
      setError(
        err.response?.data?.message || "Có lỗi xảy ra khi tải danh sách blog"
      );
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  }, [formatBlog]);

  const fetchBlogById = useCallback(
    async (blogId) => {
      console.log(`🔍 useBlogs - Lấy chi tiết blog với ID: ${blogId}`);
      setLoading(true);
      setError(null);
      try {
        const blogData = await apiFetchBlogById(blogId);
        console.log("🔍 useBlogs - Chi tiết blog:", blogData);

        if (blogData.published !== true || blogData.is_active !== true) {
          throw new Error("Bài viết không tồn tại hoặc không được công khai");
        }

        const formattedBlog = formatBlog(blogData);
        setSelectedBlog(formattedBlog);
        setError(null);
      } catch (err) {
        console.error("❌ useBlogs - Lỗi:", err.response?.data || err.message);
        setError(
          err.response?.data?.message || "Có lỗi xảy ra khi tải chi tiết blog"
        );
        setSelectedBlog(null);
      } finally {
        setLoading(false);
      }
    },
    [formatBlog]
  );

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  return {
    blogs,
    selectedBlog,
    loading,
    error,
    fetchBlogs,
    fetchBlogById,
  };
};

export default useBlogs;
