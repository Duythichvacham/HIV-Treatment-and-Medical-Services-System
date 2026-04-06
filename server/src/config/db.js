require("dotenv").config({path: process.env.ENV_FILE || ".env"});
//load biến môi trường từ file .env, nếu ENV_FILE được set thì load từ đó, nếu không thì load từ .env mặc định
const sql = require("mssql");

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD ,
  server: process.env.DB_HOST ,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT),
  options: {
    encrypt: process.env.DB_ENCRYPT, // Use encryption for data transfer
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE, // Trust the server certificate
    useUTC: false,
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
