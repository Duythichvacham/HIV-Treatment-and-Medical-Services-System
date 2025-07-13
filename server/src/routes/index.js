require("dotenv").config(); // load biến môi trường từ file .env
const authRouter = require("./auth");
const patientRouter = require("./patient");
const userRouter = require("./user");
const bookingRouter = require("./booking");
const authMiddleware = require("../middlewares/authMiddleware");

const appointmentRouter = require("./appointment");
const labStaffRouter = require("./lab-staff");
const doctorRouter = require("./doctor");
const publicRouter = require("./public");
const registrationRouter = require("./registration");
const queueRouter = require("./queue");
const slotRouter = require("./slot");
const arvRegimenRouter = require("./arvRegimen");
const clinicalRouter = require("./clinical");
const prescriptionRouter = require("./prescriptions");
const testRequestRouter = require("./testRequest");
const paymentRoutes = require("./payment");
const managerRouter = require("./manager");
// thằng nào fix mà xóa cái gì nữa t đấm vô mỏ nhé :v

// mấy thằng này sẽ đẩy qua app.js để gọi sau - tiền tố thì sẽ lấy trong file .env

function route(app) {
  /**
   * API public
   * Prefix: api/public/
   */
  app.use("/api/public", publicRouter);
  /**
   * API auth
   * Prefix: api/auth
   */
  app.use("/api/auth", authRouter);
  /**
   * API users
   * Prefix: api/v1/users
   */
  //login -- thằng này sẽ gom qua user route - thêm chức năng refresh token, logout,register
  app.use("/api/v1/auth", authRouter);

  //API vnpay  Prefix : api/v1/payment
  app.use("/api/v1/payment", paymentRoutes);
  /**
   * API doctor
   * Prefix: api/v1/doctors
   */
  app.use("/api/v1/doctors", authMiddleware, doctorRouter);
  /**
   * API patient
   * Prefix: api/v1/patient
   */
  app.use("/api/v1/patients", authMiddleware, patientRouter);
  /**
   * API appointment -- tạm chưa xóa nhưng sẽ lấy theo role
   * Prefix: api/v1/appointment
   */
  //các thao tác liên quan đến appointments
  app.use("/api/v1/appointments", authMiddleware, appointmentRouter);
  /**
   * API lab staff
   * Prefix: api/v1/lab
   */
  app.use("/api/v1/lab", authMiddleware, labStaffRouter);
  /**
   * API Registration staff
   * Prefix: api/v1/registrations
   */
  // Registration Staff routes - temporarily bypass auth for testing
  app.use("/api/v1/registrations", registrationRouter);

  /**
   * API queue - Quản lý số thứ tự
   * Prefix: api/v1/queue
   */
  app.use("/api/v1/queue", authMiddleware, queueRouter);
  /**
   * API public
   * Prefix: api/public/
   */
  app.use("/api/v1/slots", slotRouter);
  /**
   * API ARV Regimens
   * Prefix: api/v1/arv-regimens
   */
  app.use("/api/v1/arv-regimens", authMiddleware, arvRegimenRouter);
  /**
   * API Clinical Exams
   * Prefix: api/v1/clinical-exams
   */
  app.use("/api/v1/clinical", authMiddleware, clinicalRouter);
  /**
   * API Prescriptions
   * Prefix: api/prescriptions
   */
  app.use("/api/v1/prescriptions", authMiddleware, prescriptionRouter);

  app.use("/api/v1/test-request", authMiddleware, testRequestRouter);
  /**
   * API manager
   * Prefix: api/v1/manager
   */
  app.use("/api/v1/managers", authMiddleware, managerRouter);
}

module.exports = route;
