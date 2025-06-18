require("dotenv").config();
const sql = require("mssql");

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_HOST,
  database: process.env.DB_NAME,
   port: parseInt(process.env.DB_PORT), // Default SQL Server port
  options: {
    encrypt: false, // Use encryption for data transfer
    trustServerCertificate: true, // Trust the server certificate - bỏ qua xác thực chứng chỉ
  },
  pool: {
    max: 10, // Maximum number of connections in the pool
    min: 0, // Minimum number of connections in the pool
    idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
  }, // thằng này để quản lý kết nối
};

const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then((pool) => {
    console.log("Connected to SQL Server");
    return pool;
  })
  .catch((err) => {
    console.error("Database connection failed:", err);
    throw err; //quăng lỗi cho middware xử lý
  });
module.exports = {
  sql,
  poolPromise,
};
//poolPromise xử lý kết nối bất đồng bộ
// poolPromise là một Promise, khi kết nối thành công sẽ trả về pool kết nối
