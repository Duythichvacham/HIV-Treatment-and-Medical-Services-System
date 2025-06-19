require("dotenv").config(); // load biến môi trường từ file .env
const express = require("express"); // import express
const cors = require("cors"); // import cors
const app = express(); // khởi tạo ứng dụng express
const errorHandler = require("./middleware/errorHandler"); // Import middleware xử lý lỗi

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

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
app.use(errorHandler);
