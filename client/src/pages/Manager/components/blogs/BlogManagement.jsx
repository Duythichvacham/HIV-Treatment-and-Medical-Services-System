import React, { useState, useEffect } from "react";
import { PlusCircle, Edit3, Trash2, Eye, Calendar, User } from "lucide-react";
import { getAllBlogs, deleteBlog } from "../../../../services/api";
import LoadingSpinner from "../../../../components/common/LoadingSpinner";
import ErrorAlert from "../../../../components/common/ErrorAlert";
import EmptyState from "../../../../components/common/EmptyState";
import BlogCreateForm from "./BlogCreateForm";

const BlogList = ({ onCreateNew, onEdit, onView }) => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllBlogs();
      setBlogs(response || []);
    } catch (err) {
      console.error("Error fetching blogs:", err);
      setError("Không thể tải danh sách blog");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa blog này?")) {
      return;
    }

    try {
      await deleteBlog(id);
      setBlogs(blogs.filter((blog) => blog.post_id !== id));
    } catch (err) {
      console.error("Error deleting blog:", err);
      alert("Có lỗi xảy ra khi xóa blog");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return <LoadingSpinner message="Đang tải danh sách blog..." />;
  }

  if (error) {
    return <ErrorAlert error={error} onRetry={fetchBlogs} />;
  }

  if (blogs.length === 0) {
    return (
      <EmptyState
        icon={<Edit3 className="w-12 h-12" />}
        title="Chưa có blog nào"
        description="Tạo blog đầu tiên để chia sẻ thông tin với cộng đồng"
        action={
          <button
            onClick={onCreateNew}
            className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            Tạo Blog Đầu Tiên
          </button>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Danh Sách Blog</h2>
          <p className="text-gray-600 mt-1">
            Quản lý tất cả bài viết blog trong hệ thống
          </p>
        </div>
        <button
          onClick={onCreateNew}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          Tạo Blog Mới
        </button>
      </div>

      {/* Blog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {blogs.map((blog) => (
          <div
            key={blog.post_id}
            className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow"
          >
            <div className="p-6">
              {/* Title */}
              <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                {blog.title}
              </h3>

              {/* Content Preview */}
              <div
                className="text-gray-600 text-sm mb-4 line-clamp-3"
                dangerouslySetInnerHTML={{
                  __html:
                    blog.content?.replace(/<[^>]*>/g, "")?.substring(0, 150) +
                    "...",
                }}
              />

              {/* Meta Info */}
              <div className="space-y-2 text-xs text-gray-500 mb-4">
                <div className="flex items-center">
                  <Calendar className="w-3 h-3 mr-1" />
                  {formatDate(blog.created_at)}
                </div>
                <div className="flex items-center">
                  <User className="w-3 h-3 mr-1" />
                  ID: {blog.author_id}
                </div>
              </div>

              {/* Status Badge */}
              <div className="mb-4">
                <span
                  className={`inline-flex px-2 py-1 text-xs rounded-full ${
                    blog.published === 1
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {blog.published === 1 ? "Đã xuất bản" : "Nháp"}
                </span>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => onView && onView(blog)}
                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Xem"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onEdit && onEdit(blog)}
                  className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  title="Chỉnh sửa"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(blog.post_id)}
                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Xóa"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const BlogManagement = () => {
  const [currentView, setCurrentView] = useState("list"); // 'list', 'create', 'edit', 'view'
  const [_selectedBlog, setSelectedBlog] = useState(null);

  const handleCreateNew = () => {
    setCurrentView("create");
    setSelectedBlog(null);
  };

  const handleEdit = (blog) => {
    setSelectedBlog(blog);
    setCurrentView("edit");
  };

  const handleView = (blog) => {
    setSelectedBlog(blog);
    setCurrentView("view");
  };

  const handleSuccess = () => {
    setCurrentView("list");
    setSelectedBlog(null);
  };

  const handleCancel = () => {
    setCurrentView("list");
    setSelectedBlog(null);
  };

  switch (currentView) {
    case "create":
      return (
        <BlogCreateForm onSuccess={handleSuccess} onCancel={handleCancel} />
      );

    case "edit":
      // TODO: Implement BlogEditForm
      return (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Chỉnh sửa Blog
          </h3>
          <p className="text-gray-600">Chức năng đang được phát triển...</p>
          <button
            onClick={handleCancel}
            className="mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Quay lại
          </button>
        </div>
      );

    case "view":
      // TODO: Implement BlogViewDetail
      return (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Xem Chi Tiết Blog
          </h3>
          <p className="text-gray-600">Chức năng đang được phát triển...</p>
          <button
            onClick={handleCancel}
            className="mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Quay lại
          </button>
        </div>
      );

    default:
      return (
        <BlogList
          onCreateNew={handleCreateNew}
          onEdit={handleEdit}
          onView={handleView}
        />
      );
  }
};

export default BlogManagement;
