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

//GET, lấy tất cả dịch vụ cho manager (bao gồm cả inactive)
exports.getAllServicesForManager = async () => {
  const pool = await poolPromise;
  const result = await pool.request().query(`
      SELECT service_id, name, service_type, price, description, is_active
      FROM Services 
      ORDER BY service_type, name
    `);
  return result.recordset;
};

//----------------------------
exports.createServiceDB = async (name, service_type, description, price) => {
  const pool = await poolPromise;

  const query = `
    INSERT INTO Services (name, service_type, description, price)
    OUTPUT INSERTED.service_id
    VALUES (@name, @service_type, @description, @price);
  `;

  const result = await pool
    .request()
    .input("name", sql.NVarChar(100), name)
    .input("service_type", sql.NVarChar(30), service_type)
    .input("description", sql.NVarChar(500), description)
    .input("price", sql.Decimal(10, 2), price)
    .query(query);

  return {
    service_id: result.recordset[0].service_id,
  };
};

exports.checkNameService = async (name) => {
  const pool = await poolPromise;

  const result = await pool.request().input("name", sql.NVarChar(100), name)
    .query(`
      SELECT service_id
      FROM Services
      WHERE name = @name AND is_active = 1
    `);

  const hasService = result.recordset.length > 0;

  if (hasService) {
    return false;
  } else {
    return true;
  }
};
exports.setActiveService = async (id, isActive) => {
  const pool = await poolPromise;

  const result = await pool
    .request()
    .input("id", sql.Int, id)
    .input("is_active", sql.Bit, isActive).query(`
      UPDATE Services SET is_active = @is_active WHERE service_id = @id
    `);

  return result.rowsAffected[0] > 0;
};
