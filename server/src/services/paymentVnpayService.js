const { poolPromise } = require("../config/db");
const sql = require("mssql");


const updateInvoiceStatus = async (invoiceId, status) => {
  try {
    const pool = await poolPromise;

    const query = `
      UPDATE Invoices
      SET status = @status,
          issued_at = CASE
              WHEN @status = 'paid' THEN GETDATE()
              ELSE issued_at
          END
      WHERE invoice_id = @invoiceId
    `;

    const result = await pool
      .request()
      .input("status", sql.VarChar(20), status)
      .input("invoiceId", sql.Int, invoiceId)
      .query(query);

    return {
      success: result.rowsAffected[0] > 0,
      affectedRows: result.rowsAffected[0],
    };
  } catch (err) {
    console.error("DB Error updating invoice:", err);
    throw err;
  }
};

module.exports = {
  updateInvoiceStatus,
};
