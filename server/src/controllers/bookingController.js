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