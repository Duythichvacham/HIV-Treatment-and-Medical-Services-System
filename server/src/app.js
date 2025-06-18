require("dotenv").config(); // load biến môi trường từ file .env
const express = require("express"); // import express
const app = express(); // khởi tạo ứng dụng express
const errorHandler = require("./middleware./errorHandler"); // Import middleware xử lý lỗi

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
