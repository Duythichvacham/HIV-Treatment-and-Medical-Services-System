require("dotenv").config(); // load biến môi trường từ file .env
const express = require("express"); // import express
const app = express(); // khởi tạo ứng dụng express
const { poolPromise } = require("./config/db"); // import poolPromise từ file db.js
