const { sql } = require("../../config/db");

/**
 * Xử lý invoice cho TestRequest: cập nhật existing hoặc tạo mới
 * @param {Object} transaction - Database transaction
 * @param {Array} testRequests - Danh sách test requests
 * @returns {Promise<Object>} Kết quả xử lý invoice
 */
const processInvoices = async (transaction, testRequests) => {
  let updatedCount = 0;
  let createdCount = 0;

  for (const testRequest of testRequests) {
    // Kiểm tra xem đã có Invoice chưa
    const checkInvoiceQuery = `
      SELECT invoice_id, status 
      FROM Invoices 
      WHERE request_id = @requestId
    `;

    const checkInvoice = transaction.request();
    checkInvoice.input("requestId", sql.Int, testRequest.request_id);
    const invoiceResult = await checkInvoice.query(checkInvoiceQuery);

    if (invoiceResult.recordset.length > 0) {
      // Cập nhật Invoice existing thành 'paid'
      await updateExistingInvoice(transaction, testRequest.request_id);
      updatedCount++;
    } else {
      // Tạo Invoice mới với status 'paid'
      await createNewInvoice(transaction, testRequest);
      createdCount++;
    }
  }

  return {
    updated: updatedCount,
    created: createdCount,
    total: testRequests.length,
  };
};

/**
 * Cập nhật Invoice existing thành 'paid'
 * @param {Object} transaction - Database transaction
 * @param {number} requestId - ID của test request
 */
const updateExistingInvoice = async (transaction, requestId) => {
  const updateInvoiceQuery = `
    UPDATE Invoices 
    SET status = 'paid', issued_at = GETDATE()
    WHERE request_id = @requestId AND status = 'pending'
  `;

  const updateInvoice = transaction.request();
  updateInvoice.input("requestId", sql.Int, requestId);
  await updateInvoice.query(updateInvoiceQuery);
};

/**
 * Tạo Invoice mới với status 'paid'
 * @param {Object} transaction - Database transaction
 * @param {Object} testRequest - Thông tin test request
 */
const createNewInvoice = async (transaction, testRequest) => {
  const createInvoiceQuery = `
    INSERT INTO Invoices (patient_id, request_id, amount, service_type, status, issued_at)
    VALUES (@patientId, @requestId, @amount, N'test', 'paid', GETDATE())
  `;

  const createInvoice = transaction.request();
  createInvoice.input("patientId", sql.Int, testRequest.patient_id);
  createInvoice.input("requestId", sql.Int, testRequest.request_id);
  createInvoice.input("amount", sql.Decimal(10, 2), testRequest.total_amount);
  await createInvoice.query(createInvoiceQuery);
};

/**
 * Lấy thông tin invoice theo request_id
 * @param {Object} transaction - Database transaction
 * @param {number} requestId - ID của test request
 * @returns {Promise<Object|null>} Thông tin invoice hoặc null
 */
const getInvoiceByRequestId = async (transaction, requestId) => {
  const query = `
    SELECT invoice_id, status, amount, issued_at
    FROM Invoices 
    WHERE request_id = @requestId
  `;

  const request = transaction.request();
  request.input("requestId", sql.Int, requestId);
  const result = await request.query(query);

  return result.recordset[0] || null;
};

module.exports = {
  processInvoices,
  updateExistingInvoice,
  createNewInvoice,
  getInvoiceByRequestId,
};
