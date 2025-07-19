// src/components/CardBlog.jsx
import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useNavigate } from "react-router-dom";

export function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export function SectionAppear({ children, effect = "fade-up", delay = 0 }) {
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

const CardBlog = ({ blog, isFeatured = false }) => {
  const navigate = useNavigate();
  const effect = isFeatured ? "fade-right" : "fade-up";
  const delay = isFeatured ? 0.2 : 0.3;

  console.log("🔍 CardBlog - Blog props:", blog); // Debug

  return (
    <SectionAppear effect={effect} delay={delay}>
      <div
        className={`bg-white rounded-xl shadow p-6 flex flex-col h-full border border-green-100 hover:shadow-lg transition ${
          isFeatured ? "md:flex-row gap-8 border-l-8 border-green-600" : ""
        }`}
      >
        <div className="flex-1 flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-gray-400 text-xs ml-auto">
              {formatDate(blog.createdAt)}
            </span>
          </div>
          <h3
            className={`font-bold text-lg text-green-800 mb-2 line-clamp-2 ${
              isFeatured ? "text-2xl md:text-3xl" : ""
            }`}
          >
            {blog.title}
          </h3>
          <p
            className={`text-gray-600 text-sm mb-4 flex-1 ${
              isFeatured ? "text-base md:text-lg line-clamp-5" : "line-clamp-3"
            }`}
          >
            {blog.excerpt}
          </p>
          <button
            className={`mt-auto bg-green-600 text-white px-4 py-2 rounded-full font-semibold hover:bg-green-700 transition ${
              isFeatured ? "px-6 py-3 text-base" : "w-full"
            }`}
            onClick={() => navigate(`/news/${blog.id}`)}
          >
            Xem chi tiết
          </button>
        </div>
      </div>
    </SectionAppear>
  );
};

export default CardBlog;
