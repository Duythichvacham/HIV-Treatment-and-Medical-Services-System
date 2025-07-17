import React, { useState } from "react";
import { createBlog } from "../../../../services/api";
import LoadingSpinner from "../../../../components/common/LoadingSpinner";
import TipTapEditor from "../../../../components/common/TipTapEditor";

const BlogCreateForm = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    published: 1,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.content.trim()) {
      setError("Vui lòng nhập đầy đủ tiêu đề và nội dung");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await createBlog(formData);

      // Reset form
      setFormData({
        title: "",
        content: "",
        published: 1,
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error("Error creating blog:", err);
      setError(err.response?.data?.error || "Có lỗi xảy ra khi tạo blog");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Đang tạo blog..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
            <h1 className="text-3xl font-bold text-white">Create Blog Post</h1>
            <p className="text-blue-100 mt-2">
              Tạo bài viết blog mới cho hệ thống
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Error Alert */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Title Input */}
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Tiêu đề
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Nhập tiêu đề bài viết..."
                required
              />
            </div>

            {/* Content Editor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nội dung
              </label>
              <TipTapEditor
                value={formData.content}
                onChange={(content) => setFormData({ ...formData, content })}
                placeholder="Nhập nội dung bài viết..."
                className="w-full"
              />
            </div>

            {/* Publish Status */}
            <div>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.published === 1}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      published: e.target.checked ? 1 : 0,
                    })
                  }
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Xuất bản ngay lập tức
                </span>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                >
                  Hủy
                </button>
              )}
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Đang tạo..." : "Tạo Blog"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BlogCreateForm;
