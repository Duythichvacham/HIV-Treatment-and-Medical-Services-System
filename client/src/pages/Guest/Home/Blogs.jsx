import React from "react";
import useBlogs from "../../../hooks/useBlogs";
import CardBlog, { SectionAppear } from "./CardBlog";

const Blogs = () => {
  const { blogs, loading, error, fetchBlogs } = useBlogs();

  if (loading) return <div className="text-center py-12">Đang tải...</div>;
  if (error)
    return <div className="text-center py-12 text-red-600">Lỗi: {error}</div>;

  const [featured, ...rest] = blogs;

  return (
    <div className="min-h-screen bg-green-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <SectionAppear effect="fade-down">
          <h1 className="text-4xl font-extrabold text-green-800 text-center mb-4">
            Tin tức & Kiến thức về HIV/AIDS
          </h1>
        </SectionAppear>
        <SectionAppear effect="fade-up" delay={0.1}>
          <p className="text-center text-gray-600 mb-10 text-lg">
            Tổng hợp các bài viết, tin tức, kiến thức hữu ích về HIV/AIDS, điều
            trị, phòng tránh và chăm sóc sức khỏe.
          </p>
        </SectionAppear>
        {featured && <CardBlog blog={featured} isFeatured={true} />}
        <SectionAppear effect="fade-up" delay={0.3}>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
            {rest.map((blog) => (
              <CardBlog key={blog.id} blog={blog} />
            ))}
          </div>
        </SectionAppear>
      </div>
    </div>
  );
};

export default Blogs;
