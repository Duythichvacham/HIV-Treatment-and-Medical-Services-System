require("dotenv").config();
const sql = require("mssql");

const config = {
  user: process.env.DB_USER || "sa",
  password: process.env.DB_PASSWORD || "12345",
  server: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "HIV_HEALTH_CARE",
  port: parseInt(process.env.DB_PORT) || 1433,
  options: {
    encrypt: false, // Use encryption for data transfer
    trustServerCertificate: true, // Trust the server certificate
    enableArithAbort: true,
    connectTimeout: 60000, // 60 seconds
    requestTimeout: 60000, // 60 seconds
    appName: "HIV-Treatment-System",
  },
  pool: {
    max: 10, // Maximum number of connections in the pool
    min: 0, // Minimum number of connections in the pool
    idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
    acquireTimeoutMillis: 60000, // 60 seconds to acquire connection
  },
};

const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then((pool) => {
    return pool;
  })
  .catch((err) => {
    process.exit(1); // Exit if cannot connect to database
  });
module.exports = {
  sql,
  poolPromise,
};
//poolPromise xử lý kết nối bất đồng bộ
// poolPromise là một Promise, khi kết nối thành công sẽ trả về pool kết nối
