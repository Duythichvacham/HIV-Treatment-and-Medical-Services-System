require("dotenv").config({path: process.env.ENV_FILE || ".env"});
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
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});
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
process.on('uncaughtException', (err) => {
    console.error('=== UNCAUGHT EXCEPTION ===');
    console.error(err);
    console.error('================================');
    // process.exit(1);   // tạm thời comment dòng này để debug
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('=== UNHANDLED REJECTION ===');
    console.error('Reason:', reason);
    console.error('Promise:', promise);
    console.error('================================');
    // process.exit(1);
});