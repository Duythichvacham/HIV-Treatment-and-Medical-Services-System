const bookingService = require("../services/bookingServices");

exports.confirmPayment = async (req, res) => {
    try {
      const invoiceId = req.params.invoiceId; // Lấy từ URL
     
    
      const updatedData = await bookingService.confirmPayment(invoiceId);
    
      res.json({
        message: updatedData.message
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Lỗi server: ' + error.message });
    }
    };
 


 
    
 



    



    //-------------------------------------------------
    exports.cancelBooking = async (req, res) => {
        try {
          const invoiceId = req.params.invoiceId; // Lấy từ URL
         
        
          const updatedData = await bookingService.cancelBooking(invoiceId);
        
          res.json({
            message: updatedData.message
          });
        } catch (error) {
          console.error(error);
          res.status(500).json({ message: 'Lỗi server: ' + error.message });
        }
        };

       // //--------------------------------------------
    // POST tao appointment va invoice
    // thong tin cung cap:
    // patientId lay tu req , doctorId , serviceId , booking date , slot
// Get lấy danh sách hẹn của người dùng    
const { poolPromise } = require('../config/db');


exports.createBooking = async (req, res) => {
  try {
    const accountId = req.user.userId; // lấy từ token đã verify

    if (!accountId) {
      return res.status(401).json({ message: 'Không xác định được tài khoản người dùng' });
    }

    const pool = await poolPromise;

    // Truy xuất patient_id từ account_id
    const result = await pool.request()
      .input('accountId', accountId)
      .query('SELECT patient_id FROM Patients WHERE account_id = @accountId');

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy bệnh nhân tương ứng với tài khoản này' });
    }

    const patientId = result.recordset[0].patient_id;

    // Gọi service để tạo booking
    const bookingResult = await bookingService.createBooking({
      ...req.body,
      patientId // ghi đè lên body nếu client cố tình gửi lên để đảm bảo an toàn
    });

    res.status(201).json(bookingResult);
  } catch (error) {
    console.error('Lỗi controller booking:', error);
    res.status(500).json({ message: 'Lỗi server: ' + error.message });
  }
};
