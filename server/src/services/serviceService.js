const { poolPromise } = require("../config/db");
const sql = require("mssql");

//GET, lấy danh sách dịch vụ xét nghiệm - thằng này lấy dịch vụ public cho patients chọn
exports.getServicesByType = async (type) => {
  const pool = await poolPromise;
  const result = await pool.request().input("type", sql.NVARCHAR, type).query(`
      SELECT service_id, name, service_type, price, description
      FROM Services 
      WHERE service_type = @type
      AND is_active = 1
    `);
  return result.recordset;
};

//GET, lấy tất cả dịch vụ
exports.getAllServices = async () => {
  const pool = await poolPromise;
  const result = await pool.request().query(`
      SELECT service_id, name, service_type, price, description
      FROM Services 
      WHERE is_active = 1
      ORDER BY service_type, name
    `);
  return result.recordset;
};
