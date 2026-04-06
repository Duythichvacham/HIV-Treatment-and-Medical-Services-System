require("dotenv").config({path: process.env.ENV_FILE || ".env"});
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
  /**
   * API public
   * Prefix: api/public/
   */
  app.use(`${process.env.API_PREFIX}/public`, publicRouter);
  /**
   * API users
   * Prefix: api/users
   */
  //login -- thằng này sẽ gom qua user route - thêm chức năng refresh token, logout,register
  app.use(`${process.env.API_PREFIX}/auth`, authRouter);

  //API vnpay  Prefix : api/payment
  app.use(`${process.env.API_PREFIX}/payment`, paymentRoutes);
  /**
   * API doctor
   * Prefix: api/doctors
   */
  app.use(`${process.env.API_PREFIX}/doctors`, authMiddleware, doctorRouter);
  /**
   * API patient
   * Prefix: api/patient
   */
  app.use(`${process.env.API_PREFIX}/patients`, authMiddleware, patientRouter);
  /**
   * API appointment -- tạm chưa xóa nhưng sẽ lấy theo role
   * Prefix: api/appointment
   */
  //các thao tác liên quan đến appointments
  app.use(`${process.env.API_PREFIX}/appointments`, authMiddleware, appointmentRouter);
  /**
   * API lab staff
   * Prefix: api/lab
   */
  app.use(`${process.env.API_PREFIX}/lab`, authMiddleware, labStaffRouter);
  /**
   * API Registration staff
   * Prefix: api/registrations
   */
  // Registration Staff routes - temporarily bypass auth for testing
  app.use(`${process.env.API_PREFIX}/registrations`, authMiddleware, registrationRouter);

  /**
   * API public
   * Prefix: api/public/
   */
  app.use(`${process.env.API_PREFIX}/slots`, slotRouter);
  /**
   * API ARV Regimens
   * Prefix: api/arv-regimens
   */
  app.use(`${process.env.API_PREFIX}/arv-regimens`, authMiddleware, arvRegimenRouter);
  /**
   * API Clinical Exams
   * Prefix: api/clinical-exams
   */
  app.use(`${process.env.API_PREFIX}/clinical`, authMiddleware, clinicalRouter);
  /**
   * API Prescriptions
   * Prefix: api/prescriptions
   */
  app.use(`${process.env.API_PREFIX}/prescriptions`, authMiddleware, prescriptionRouter);

  app.use(`${process.env.API_PREFIX}/test-request`, authMiddleware, testRequestRouter);
  /**
   * API manager
   * Prefix: api/manager
   */
  app.use(`${process.env.API_PREFIX}/managers`, authMiddleware, managerRouter);

  app.use(`${process.env.API_PREFIX}/blogs`, blogRouter);
}

module.exports = route;
