const { poolPromise } = require("../config/db");
const sql = require("mssql");

class InvoiceService {
  /**
   * Tạo invoice universal - hỗ trợ cả appointment và test request
   * @param {Object} params - Tham số tạo invoice
   * @param {number} params.patientId - ID bệnh nhân
   * @param {number} [params.appointmentId] - ID appointment (optional)
   * @param {number} [params.requestId] - ID test request (optional)
   * @param {number} params.amount - Số tiền
   * @param {string} params.serviceType - Loại dịch vụ
   */
  async getRevenue(status = "paid", group = "yearly") {
    const pool = await poolPromise;

    let query = "";

    if (group === "yearly") {
      query += `SELECT 
                  YEAR(issued_at) AS period,
                  SUM(amount) AS total_revenue
              FROM [HIV_HEALTH_CARE].[dbo].[Invoices]
              WHERE status = @status
              GROUP BY YEAR(issued_at)
              ORDER BY period;`;
    } else if (group === "monthly") {
      query += `SELECT 
                FORMAT(issued_at, 'yyyy-MM') AS period,
                SUM(amount) AS total_revenue
              FROM Invoices
              WHERE status = @status
              GROUP BY FORMAT(issued_at, 'yyyy-MM')
              ORDER BY period`;
    } else if (group === "quarterly") {
      query += `SELECT 
                  CONCAT(YEAR(issued_at), '-Q', DATEPART(QUARTER, issued_at)) AS period,
                  SUM(amount) AS total_revenue
              FROM [HIV_HEALTH_CARE].[dbo].[Invoices]
              WHERE status = @status
              GROUP BY YEAR(issued_at), DATEPART(QUARTER, issued_at)
              ORDER BY YEAR(issued_at), DATEPART(QUARTER, issued_at);`;
    } else {
      throw new Error("Invalid groupBy parameter");
    }
    const result = await pool.request().input("status", status).query(query);

    return result.recordset;
  }

  async createInvoice({
    patientId,
    appointmentId = null,
    requestId = null,
    amount,
    serviceType,
  }) {
    const pool = await poolPromise;

    if (!appointmentId && !requestId) {
      throw new Error("Phải có appointmentId hoặc requestId");
    }

    const query = `
      INSERT INTO Invoices (patient_id, appointment_id, request_id, amount, service_type, status, created_at)
      OUTPUT INSERTED.invoice_id
      VALUES (@patientId, @appointmentId, @requestId, @amount, @serviceType, 'pending', GETDATE())
    `;

    const result = await pool
      .request()
      .input("patientId", sql.Int, patientId)
      .input("appointmentId", sql.Int, appointmentId)
      .input("requestId", sql.Int, requestId)
      .input("amount", sql.Decimal(10, 2), amount)
      .input("serviceType", sql.NVarChar(50), serviceType)
      .query(query);

    return {
      invoice_id: result.recordset[0].invoice_id,
      status: "pending",
    };
  }

  /**
   * Cập nhật trạng thái invoice universal
   * @param {number} invoiceId - ID invoice
   * @param {string} status - Trạng thái mới
   */
  async updateInvoiceStatus(invoiceId, status) {
    const pool = await poolPromise;

    const query = `
      UPDATE Invoices 
      SET status = @status, 
          issued_at = CASE WHEN @status = 'paid' THEN GETDATE() ELSE issued_at END
      WHERE invoice_id = @invoiceId
    `;

    const result = await pool
      .request()
      .input("invoiceId", sql.Int, invoiceId)
      .input("status", sql.VarChar(20), status)
      .query(query);

    return {
      success: result.rowsAffected[0] > 0,
      affectedRows: result.rowsAffected[0],
    };
  }

  /**
   * Cập nhật trạng thái invoice theo appointment_id
   * @param {number} appointmentId - ID appointment
   * @param {string} status - Trạng thái mới
   */
  async updateInvoiceStatusByAppointment(appointmentId, status) {
    const pool = await poolPromise;

    const query = `
      UPDATE Invoices 
      SET status = @status,
          issued_at = CASE WHEN @status = 'paid' THEN GETDATE() ELSE issued_at END
      WHERE appointment_id = @appointmentId AND status = 'pending'
    `;

    const result = await pool
      .request()
      .input("appointmentId", sql.Int, appointmentId)
      .input("status", sql.VarChar(20), status)
      .query(query);

    return {
      success: true,
      affectedRows: result.rowsAffected[0],
    };
  }

  /**
   * Cập nhật trạng thái invoice theo request_id
   * @param {number} requestId - ID test request
   * @param {string} status - Trạng thái mới
   */
  async updateInvoiceStatusByRequest(requestId, status) {
    const pool = await poolPromise;

    const query = `
      UPDATE Invoices 
      SET status = @status,
          issued_at = CASE WHEN @status = 'paid' THEN GETDATE() ELSE issued_at END
      WHERE request_id = @requestId AND status = 'pending'
    `;

    const result = await pool
      .request()
      .input("requestId", sql.Int, requestId)
      .input("status", sql.VarChar(20), status)
      .query(query);

    return {
      success: true,
      affectedRows: result.rowsAffected[0],
    };
  }

  /**
   * Lấy thông tin invoice universal
   * @param {Object} params - Tham số tìm kiếm
   * @param {number} [params.appointmentId] - ID appointment
   * @param {number} [params.requestId] - ID test request
   * @param {number} [params.invoiceId] - ID invoice
   */
  async getInvoice({
    appointmentId = null,
    requestId = null,
    invoiceId = null,
  }) {
    const pool = await poolPromise;
    let query = `
      SELECT invoice_id, patient_id, appointment_id, request_id, amount, service_type, status, issued_at, created_at
      FROM Invoices 
      WHERE 1=1
    `;

    const request = pool.request();

    if (invoiceId) {
      query += " AND invoice_id = @invoiceId";
      request.input("invoiceId", sql.Int, invoiceId);
    } else if (appointmentId) {
      query += " AND appointment_id = @appointmentId";
      request.input("appointmentId", sql.Int, appointmentId);
    } else if (requestId) {
      query += " AND request_id = @requestId";
      request.input("requestId", sql.Int, requestId);
    } else {
      throw new Error("Phải cung cấp invoiceId, appointmentId hoặc requestId");
    }

    const result = await request.query(query);
    return result.recordset[0] || null;
  }

  /**
   * Hủy booking và cập nhật trạng thái
   * @param {number} invoiceId - ID invoice
   */
  async cancelBooking(invoiceId) {
    const pool = await poolPromise;
    await pool.request().input("invoiceId", invoiceId).query(`
        -- 1. Cập nhật trạng thái hóa đơn thành 'cancelled'
        UPDATE Invoices
        SET status = 'cancelled'
        WHERE invoice_id = @invoiceId;

        -- 2. Cập nhật luôn trạng thái Appointment nếu tồn tại
        UPDATE Appointments
        SET status = 'cancelled'
        WHERE appointment_id = (
          SELECT appointment_id
          FROM Invoices
          WHERE invoice_id = @invoiceId AND appointment_id IS NOT NULL
        );
      `);

    return {
      success: true,
      message: "Huỷ lịch thành công!",
    };
  }

  // Backward compatibility methods - giữ tương thích với code cũ
  markInvoiceAsPaid = (invoiceId) =>
    this.updateInvoiceStatus(invoiceId, "paid");
  markInvoiceAsPaidByAppointment = (appointmentId) =>
    this.updateInvoiceStatusByAppointment(appointmentId, "paid");
  markInvoiceAsPaidByRequest = (requestId) =>
    this.updateInvoiceStatusByRequest(requestId, "paid");
  getInvoiceByAppointment = (appointmentId) =>
    this.getInvoice({ appointmentId });
  getInvoiceByRequest = (requestId) => this.getInvoice({ requestId });
  createInvoiceForTestRequest = (requestId, patientId, amount) =>
    this.createInvoice({ patientId, requestId, amount, serviceType: "test" });
}

module.exports = new InvoiceService();
