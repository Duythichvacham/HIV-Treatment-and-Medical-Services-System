import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

const newsData = [
  {
    post_id: 1,
    title: "Hiểu về HIV và cách phòng tránh",
    content:
      "HIV là virus gây suy giảm miễn dịch ở người. Virus này tấn công hệ thống miễn dịch, đặc biệt là các tế bào CD4, làm suy yếu khả năng chống lại các bệnh nhiễm trùng và ung thư...",
    author_id: 2,
    is_educational: 1,
    created_at: "2025-06-27 23:05:47.590",
    published: 1,
  },
  {
    post_id: 2,
    title: "Tầm quan trọng của việc tuân thủ điều trị ARV",
    content:
      "Việc uống thuốc ARV đúng giờ, đủ liều là yếu tố quyết định thành công của điều trị. Tuân thủ điều trị giúp giảm tải lượng virus xuống mức không phát hiện được...",
    author_id: 3,
    is_educational: 1,
    created_at: "2025-06-27 23:05:47.590",
    published: 1,
  },
  {
    post_id: 3,
    title: "Dinh dưỡng cho người nhiễm HIV",
    content:
      "Chế độ dinh dưỡng hợp lý giúp tăng cường sức khỏe và hỗ trợ điều trị hiệu quả. Cần bổ sung đầy đủ protein, vitamin và khoáng chất...",
    author_id: 4,
    is_educational: 1,
    created_at: "2025-06-27 23:05:47.590",
    published: 1,
  },
  {
    post_id: 4,
    title: "Tin tức: Nghiên cứu mới về điều trị HIV",
    content:
      "Các nhà khoa học vừa công bố kết quả nghiên cứu mới về phương pháp điều trị HIV hiệu quả hơn với ít tác dụng phụ...",
    author_id: 1,
    is_educational: 0,
    created_at: "2025-06-27 23:05:47.590",
    published: 1,
  },
  {
    post_id: 5,
    title: "Quản lý tác dụng phụ của thuốc ARV",
    content:
      "Hướng dẫn cách nhận biết và xử lý các tác dụng phụ thường gặp khi sử dụng thuốc ARV như buồn nôn, chóng mặt, mệt mỏi...",
    author_id: 5,
    is_educational: 1,
    created_at: "2025-06-27 23:05:47.590",
    published: 1,
  },
  {
    post_id: 6,
    title: "Hỗ trợ tâm lý cho bệnh nhân HIV",
    content:
      "Tầm quan trọng của sức khỏe tinh thần trong quá trình điều trị HIV. Cách vượt qua tâm lý lo lắng và xây dựng lối sống tích cực...",
    author_id: 2,
    is_educational: 1,
    created_at: "2025-06-27 23:05:47.590",
    published: 1,
  },
  {
    post_id: 7,
    title: "Phòng ngừa lây nhiễm HIV ở phụ nữ mang thai",
    content:
      "Hướng dẫn điều trị ARV cho thai phụ nhằm phòng ngừa lây nhiễm từ mẹ sang con. Các biện pháp theo dõi trong thai kỳ...",
    author_id: 3,
    is_educational: 1,
    created_at: "2025-06-27 23:05:47.590",
    published: 1,
  },
];

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("vi-VN", { year: "numeric", month: "2-digit", day: "2-digit" });
}

const NewsSection = () => {
  const [startIndex, setStartIndex] = useState(0);
  const [pageKey, setPageKey] = useState(0); // key để trigger AnimatePresence
  const itemsPerPage = 3;
  const total = newsData.length;

  useEffect(() => {
    const interval = setInterval(() => {
      setStartIndex((prev) => {
        const next = (prev + itemsPerPage) % total;
        setPageKey((k) => k + 1);
        return next;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [total]);

  const visibleNews = [];
  for (let i = 0; i < itemsPerPage; i++) {
    visibleNews.push(newsData[(startIndex + i) % total]);
  }

  return (
    <section className="bg-white py-16">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-green-700 mb-2">Tin tức & Kiến thức</h2>
        <p className="text-center text-gray-500 mb-10">Cập nhật thông tin mới nhất về HIV/AIDS và sức khỏe</p>
        <div className="relative min-h-[350px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={pageKey}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              className="grid sm:grid-cols-1 md:grid-cols-3 gap-8"
            >
              {visibleNews.map((news) => (
                <div key={news.post_id} className="bg-green-50 rounded-xl shadow p-6 flex flex-col h-full border border-green-100 hover:shadow-lg transition">
                  <div className="flex items-center gap-2 mb-2">
                    {news.is_educational ? (
                      <span className="inline-block bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full">Kiến thức</span>
                    ) : (
                      <span className="inline-block bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">Tin tức</span>
                    )}
                    <span className="text-gray-400 text-xs ml-auto">{formatDate(news.created_at)}</span>
                  </div>
                  <h3 className="font-bold text-lg text-green-800 mb-2 line-clamp-2">{news.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 flex-1 line-clamp-3">{news.content}</p>
                  <button className="mt-auto bg-green-600 text-white px-4 py-2 rounded-full font-semibold hover:bg-green-700 transition w-full">Xem chi tiết</button>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default NewsSection; 