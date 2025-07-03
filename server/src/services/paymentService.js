const { poolPromise } = require("../config/db");
const sql = require("mssql");

/**
 * Tạo invoice cho appointment
 * @param {number} appointmentId - ID của appointment
 * @param {number} patientId - ID của bệnh nhân
 * @param {number} amount - Số tiền
 * @param {string} serviceType - Loại dịch vụ
 */
const createInvoice = async (appointmentId, patientId, amount, serviceType) => {
  const pool = await poolPromise;

  const query = `
    INSERT INTO Invoices (patient_id, appointment_id, amount, service_type, status, created_at)
    OUTPUT INSERTED.invoice_id
    VALUES (@patientId, @appointmentId, @amount, @serviceType, 'pending', GETDATE())
  `;

  const result = await pool
    .request()
    .input("patientId", sql.Int, patientId)
    .input("appointmentId", sql.Int, appointmentId)
    .input("amount", sql.Decimal(10, 2), amount)
    .input("serviceType", sql.NVarChar(50), serviceType)
    .query(query);

  return {
    invoice_id: result.recordset[0].invoice_id,
    status: "pending",
  };
};

/**
 * Tạo invoice cho test request
 * @param {number} requestId - ID của test request
 * @param {number} patientId - ID của bệnh nhân
 * @param {number} amount - Số tiền
 */
const createInvoiceForTestRequest = async (requestId, patientId, amount) => {
  const pool = await poolPromise;

  const query = `
    INSERT INTO Invoices (patient_id, request_id, amount, service_type, status, created_at)
    OUTPUT INSERTED.invoice_id
    VALUES (@patientId, @requestId, @amount, 'test', 'pending', GETDATE())
  `;

  const result = await pool
    .request()
    .input("patientId", sql.Int, patientId)
    .input("requestId", sql.Int, requestId)
    .input("amount", sql.Decimal(10, 2), amount)
    .query(query);

  return {
    invoice_id: result.recordset[0].invoice_id,
    status: "pending",
  };
};

/**
 * Cập nhật trạng thái invoice thành 'paid'
 * @param {number} invoiceId - ID của invoice
 */
const markInvoiceAsPaid = async (invoiceId) => {
  const pool = await poolPromise;

  const query = `
    UPDATE Invoices 
    SET status = 'paid', issued_at = GETDATE()
    WHERE invoice_id = @invoiceId
  `;

  await pool.request().input("invoiceId", sql.Int, invoiceId).query(query);

  return { success: true };
};

/**
 * Cập nhật trạng thái invoice thành 'paid' theo appointment_id
 * @param {number} appointmentId - ID của appointment
 */
const markInvoiceAsPaidByAppointment = async (appointmentId) => {
  const pool = await poolPromise;

  const query = `
    UPDATE Invoices 
    SET status = 'paid', issued_at = GETDATE()
    WHERE appointment_id = @appointmentId AND status = 'pending'
  `;

  const result = await pool
    .request()
    .input("appointmentId", sql.Int, appointmentId)
    .query(query);

  return {
    success: true,
    affectedRows: result.rowsAffected[0],
  };
};

/**
 * Cập nhật trạng thái invoice thành 'paid' theo request_id
 * @param {number} requestId - ID của test request
 */
const markInvoiceAsPaidByRequest = async (requestId) => {
  const pool = await poolPromise;

  const query = `
    UPDATE Invoices 
    SET status = 'paid', issued_at = GETDATE()
    WHERE request_id = @requestId AND status = 'pending'
  `;

  const result = await pool
    .request()
    .input("requestId", sql.Int, requestId)
    .query(query);

  return {
    success: true,
    affectedRows: result.rowsAffected[0],
  };
};

/**
 * Lấy thông tin invoice theo appointment_id
 * @param {number} appointmentId - ID của appointment
 */
const getInvoiceByAppointment = async (appointmentId) => {
  const pool = await poolPromise;

  const query = `
    SELECT invoice_id, patient_id, amount, service_type, status, issued_at, created_at
    FROM Invoices 
    WHERE appointment_id = @appointmentId
  `;

  const result = await pool
    .request()
    .input("appointmentId", sql.Int, appointmentId)
    .query(query);

  return result.recordset[0] || null;
};

/**
 * Lấy thông tin invoice theo request_id
 * @param {number} requestId - ID của test request
 */
const getInvoiceByRequest = async (requestId) => {
  const pool = await poolPromise;

  const query = `
    SELECT invoice_id, patient_id, amount, service_type, status, issued_at, created_at
    FROM Invoices 
    WHERE request_id = @requestId
  `;

  const result = await pool
    .request()
    .input("requestId", sql.Int, requestId)
    .query(query);

  return result.recordset[0] || null;
};

module.exports = {
  createInvoice,
  createInvoiceForTestRequest,
  markInvoiceAsPaid,
  markInvoiceAsPaidByAppointment,
  markInvoiceAsPaidByRequest,
  getInvoiceByAppointment,
  getInvoiceByRequest,
};
