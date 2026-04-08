require("dotenv").config({path: process.env.ENV_FILE || '.env'});
const authRouter = require("./auth");
const patientRouter = require("./patient");
const userRouter = require("./user");
const authMiddleware = require("../middlewares/authMiddleware");
const blogRouter = require("./blog");
const appointmentRouter = require("./appointment");
const labStaffRouter = require("./lab-staff");
const doctorRouter = require("./doctor");
const publicRouter = require("./public");
const registrationRouter = require("./registration");
const slotRouter = require("./slot");
const arvRegimenRouter = require("./arvRegimen");
const clinicalRouter = require("./clinical");
const prescriptionRouter = require("./prescriptions");
const testRequestRouter = require("./testRequest");
const paymentRoutes = require("./payment");
const managerRouter = require("./manager");
// thằng nào fix mà xóa cái gì nữa t đấm vô mỏ nhé :v

// mấy thằng này sẽ đẩy qua app.js để gọi sau - tiền tố thì sẽ lấy trong file .env
// Thông tin api example:
/**
 * API name
 * Prefix: prefix/resource
 */
function route(app) {
  // console.log("BODY:", req.body);
  app.use(`${process.env.API_PREFIX}/public`, publicRouter);

  //login -- thằng này sẽ gom qua user route - thêm chức năng refresh token, logout,register
  app.use(`${process.env.API_PREFIX}/auth`, authRouter);

  //API vnpay  Prefix : api/payment
  app.use(`${process.env.API_PREFIX}/payment`, paymentRoutes);
 
  app.use(`${process.env.API_PREFIX}/doctors`, authMiddleware, doctorRouter);
 
  app.use(`${process.env.API_PREFIX}/patients`, authMiddleware, patientRouter);
  
  //các thao tác liên quan đến appointments
  app.use(`${process.env.API_PREFIX}/appointments`, authMiddleware, appointmentRouter);
 
  app.use(`${process.env.API_PREFIX}/lab`, authMiddleware, labStaffRouter);
  
  // Registration Staff routes - temporarily bypass auth for testing
  app.use(`${process.env.API_PREFIX}/registrations`, authMiddleware, registrationRouter);

  app.use(`${process.env.API_PREFIX}/slots`, slotRouter);
  
  app.use(`${process.env.API_PREFIX}/arv-regimens`, authMiddleware, arvRegimenRouter);
  
  app.use(`${process.env.API_PREFIX}/clinical`, authMiddleware, clinicalRouter);
  
  app.use(`${process.env.API_PREFIX}/prescriptions`, authMiddleware, prescriptionRouter);

  app.use(`${process.env.API_PREFIX}/test-request`, authMiddleware, testRequestRouter);
  
  app.use(`${process.env.API_PREFIX}/managers`, authMiddleware, managerRouter);

  app.use(`${process.env.API_PREFIX}/blogs`, blogRouter);
}

module.exports = route;
