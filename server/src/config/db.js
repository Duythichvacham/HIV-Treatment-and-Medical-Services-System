require("dotenv").config();
const sql = require("mssql");

const config = {
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || '12345',
  server: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'HIV_HEATH_CARE',
  port: parseInt(process.env.DB_PORT) || 1433,
  options: {
    encrypt: false, // Use encryption for data transfer
    trustServerCertificate: true, // Trust the server certificate
    enableArithAbort: true,
    connectTimeout: 60000, // 60 seconds
    requestTimeout: 60000, // 60 seconds
    appName: 'HIV-Treatment-System',
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
    console.log("Connected to SQL Server successfully");
    console.log("Database:", config.database);
    console.log("Server:", config.server);
    return pool;
  })
  .catch((err) => {
    console.error("Database connection failed:", err.message);
    console.error("Config:", {
      server: config.server,
      database: config.database,
      user: config.user,
      port: config.port
    });
    process.exit(1); // Exit if cannot connect to database
  });
module.exports = {
  sql,
  poolPromise,
};
//poolPromise xử lý kết nối bất đồng bộ
// poolPromise là một Promise, khi kết nối thành công sẽ trả về pool kết nối
