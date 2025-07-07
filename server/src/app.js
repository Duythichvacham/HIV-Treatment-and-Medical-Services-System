require("dotenv").config(); // load biến môi trường từ file .env
const express = require("express"); // import express
const cors = require("cors"); // import cors
const app = express(); // khởi tạo ứng dụng express
// const errorHandler = require("./middleware/errorHandler"); // Import middleware xử lý lỗi
const { initializeScheduler } = require("./utils/scheduler"); // Import scheduler cho queue management

// Enable CORS for all origins in development- thiếu cái này browser nó từ chối request từ client
// CORS (Cross-Origin Resource Sharing) cho phép server chấp nhận request từ các nguồn
app.use(
  cors({
    origin: "*", // Cho phép tất cả origins trong development
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
const route = require("./routes"); // import index.js trong routes
route(app);

app.get("/", (req, res) => {
  res.send("HIV Clinic API is running");
});
// app.use(errorHandler);

// Khởi tạo scheduler cho queue management and auto-cancel appointments
// Chạy các job định kỳ để quản lý queue numbers và tự động cancel appointments
// sau 17h
initializeScheduler();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
