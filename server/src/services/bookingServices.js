const { poolPromise } = require("../config/db");

exports.confirmPayment = async (invoiceId) => {
  const pool = await poolPromise;
  const result = await pool.request()
  .input('invoiceId', invoiceId)

  .query(`
     

-- 1. Cập nhật trạng thái hóa đơn thành 'paid'
UPDATE Invoices
SET status = 'paid'
WHERE invoice_id = @invoiceId;

-- 2. Cập nhật luôn trạng thái Appointment nếu tồn tại
UPDATE Appointments
SET status = 'in_progress'
WHERE appointment_id = (
    SELECT appointment_id
    FROM Invoices
    WHERE invoice_id = @invoiceId AND appointment_id IS NOT NULL
);

    `);

    return {
        success: true,
        message: "Thanh toán thành công",
      
      };
      ;
};
exports.cancelBooking = async (invoiceId) => {
    const pool = await poolPromise;
    const result = await pool.request()
    .input('invoiceId', invoiceId)
  
    .query(`
       
  
  -- 1. Cập nhật trạng thái hóa đơn thành 'paid'
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
          message: "Hùy lịch thành công !",
        
        };
        ;
  };
  