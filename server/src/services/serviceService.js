const { poolPromise } = require("../config/db");
const sql = require("mssql");
const dayjs = require("dayjs");
const customParseFormat = require("dayjs/plugin/customParseFormat");
dayjs.extend(customParseFormat); 


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

  const result = await pool
    .request()
    .input("name", sql.NVarChar(100), name)
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
    .input("is_active", sql.Bit, isActive)
    .query(`
      UPDATE Services SET is_active = @is_active WHERE service_id = @id
    `);

  return result.rowsAffected[0] > 0;
};




exports.createSlotDB = async (start_time, end_time) => {
  const pool = await poolPromise;

  const startNorm = normalizeTime(start_time);
  const endNorm = normalizeTime(end_time);

  const result = await pool.request()
    .input("start_time", sql.VarChar(8), startNorm)
    .input("end_time", sql.VarChar(8), endNorm)
    .query(`
      INSERT INTO Slots (start_time, end_time)
      OUTPUT INSERTED.slot_id
      VALUES (
        CONVERT(time(0), @start_time, 108),
        CONVERT(time(0), @end_time, 108)
      );
    `);

  return {
    slot_id: result.recordset[0].slot_id,
  };
};




exports.checkTimeService = async (start_time, end_time) => {
  const pool = await poolPromise;

  const startNorm = normalizeTime(start_time);
  const endNorm = normalizeTime(end_time);

  const result = await pool.request()
    .input("start_time", sql.VarChar(8), startNorm)
    .input("end_time", sql.VarChar(8), endNorm)
    .query(`
      SELECT slot_id, start_time, end_time
      FROM Slots
      WHERE 
        CONVERT(time(0), start_time) = CONVERT(time(0), @start_time, 108)
        OR 
        CONVERT(time(0), end_time) = CONVERT(time(0), @end_time, 108)
    `);

  return result.recordset; // Mảng các slot trùng thời gian
};




function normalizeTime(str) {
  console.log(">> normalizeTime nhận:", str);
  const d = dayjs(str, ["HH:mm:ss", "HH:mm", "H:mm", "H:mm:ss"], true); // strict
  if (!d.isValid()) throw new Error("Định dạng thời gian không hợp lệ!");
  return d.format("HH:mm:ss");
}

