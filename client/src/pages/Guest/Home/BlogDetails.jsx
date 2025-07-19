import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReactHtmlParser from "react-html-parser";
import { SectionAppear } from "./CardBlog"; // Tái sử dụng SectionAppear từ CardBlog
import useBlogs from "../../../hooks/useBlogs";

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

const BlogDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selectedBlog, loading, error, fetchBlogById } = useBlogs();

  useEffect(() => {
    fetchBlogById(id);
  }, [id, fetchBlogById]);

  if (loading) return <div className="text-center py-12">Đang tải...</div>;
  if (error)
    return <div className="text-center py-12 text-red-600">Lỗi: {error}</div>;
  if (!selectedBlog)
    return <div className="text-center py-12">Không tìm thấy bài viết</div>;

  return (
    <div className="min-h-screen bg-green-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <SectionAppear effect="fade-down">
          <button
            className="mb-6 text-green-600 hover:text-green-800 font-semibold"
            onClick={() => navigate("/news")}
          >
            ← Quay lại danh sách
          </button>
          <h1 className="text-4xl font-extrabold text-green-800 mb-4">
            {selectedBlog.title}
          </h1>
        </SectionAppear>
        <SectionAppear effect="fade-up" delay={0.1}>
          <div className="flex items-center gap-2 mb-6">
            {selectedBlog.is_educational ? (
              <span className="inline-block bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full">
                Kiến thức
              </span>
            ) : (
              <span className="inline-block bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
                Tin tức
              </span>
            )}
            <span className="text-gray-400 text-xs">
              Đăng ngày: {formatDate(selectedBlog.createdAt)}
            </span>
            <span className="text-gray-400 text-xs ml-2">
              Tác giả: {selectedBlog.authorName}
            </span>
          </div>
          <div className="bg-white rounded-xl shadow p-6 border border-green-100">
            <p className="text-gray-700 text-lg leading-relaxed">
              {ReactHtmlParser(selectedBlog.content)}
            </p>
          </div>
        </SectionAppear>
      </div>
    </div>
  );
};

export default BlogDetails;
