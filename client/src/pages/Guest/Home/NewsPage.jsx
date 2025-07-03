import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";

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

function SectionAppear({ children, effect = "fade-up", delay = 0 }) {
  const ref = useRef();
  const inView = useInView(ref, { once: true, margin: "-100px" });
  let initial, animate, exit;
  switch (effect) {
    case "fade-down":
      initial = { opacity: 0, y: -40 };
      animate = { opacity: 1, y: 0 };
      exit = { opacity: 0, y: -40 };
      break;
    case "fade-left":
      initial = { opacity: 0, x: -60 };
      animate = { opacity: 1, x: 0 };
      exit = { opacity: 0, x: -60 };
      break;
    case "fade-right":
      initial = { opacity: 0, x: 60 };
      animate = { opacity: 1, x: 0 };
      exit = { opacity: 0, x: 60 };
      break;
    case "zoom-in":
      initial = { opacity: 0, scale: 0.85 };
      animate = { opacity: 1, scale: 1 };
      exit = { opacity: 0, scale: 0.85 };
      break;
    default:
      initial = { opacity: 0, y: 40 };
      animate = { opacity: 1, y: 0 };
      exit = { opacity: 0, y: 40 };
  }
  return (
    <motion.div
      ref={ref}
      initial={initial}
      animate={inView ? animate : initial}
      exit={exit}
      transition={{ duration: 0.7, ease: "easeOut", delay }}
      className="w-full"
    >
      {children}
    </motion.div>
  );
}

const NewsPage = () => {
  const [featured, ...rest] = newsData;
  return (
    <div className="min-h-screen bg-green-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <SectionAppear effect="fade-down">
          <h1 className="text-4xl font-extrabold text-green-800 text-center mb-4">Tin tức & Kiến thức về HIV/AIDS</h1>
        </SectionAppear>
        <SectionAppear effect="fade-up" delay={0.1}>
          <p className="text-center text-gray-600 mb-10 text-lg">Tổng hợp các bài viết, tin tức, kiến thức hữu ích về HIV/AIDS, điều trị, phòng tránh và chăm sóc sức khỏe.</p>
        </SectionAppear>
        {featured && (
          <SectionAppear effect="fade-right" delay={0.2}>
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-12 flex flex-col md:flex-row gap-8 border-l-8 border-green-600 animate-fade-in-up">
              <div className="flex-1 flex flex-col justify-between">
                <div className="flex items-center gap-2 mb-2">
                  {featured.is_educational ? (
                    <span className="inline-block bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full">Kiến thức</span>
                  ) : (
                    <span className="inline-block bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">Tin tức</span>
                  )}
                  <span className="text-gray-400 text-xs ml-auto">{formatDate(featured.created_at)}</span>
                </div>
                <h2 className="font-extrabold text-2xl md:text-3xl text-green-800 mb-4 line-clamp-2">{featured.title}</h2>
                <p className="text-gray-700 text-base md:text-lg mb-6 line-clamp-5">{featured.content}</p>
                <div className="mt-auto">
                  <button className="bg-green-600 text-white px-6 py-3 rounded-full font-bold text-base hover:bg-green-700 transition shadow-lg">Xem chi tiết</button>
                </div>
              </div>
            </div>
          </SectionAppear>
        )}
        <SectionAppear effect="fade-up" delay={0.3}>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {rest.map((news) => (
              <div key={news.post_id} className="bg-white rounded-xl shadow p-6 flex flex-col h-full border border-green-100 hover:shadow-lg transition animate-fade-in-up">
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
          </div>
        </SectionAppear>
      </div>
    </div>
  );
};

export default NewsPage; 