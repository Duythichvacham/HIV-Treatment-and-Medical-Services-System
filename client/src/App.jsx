import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import {
  Header,
  Footer,
  HomePage,
  StaffLogin,
  PatientLogin,
  DoctorDetail,
} from "./index";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import ProtectedRoute from "./components/common/ProtectedRoute";
import LabStaff from "./pages/Staff/LabStaff";
import LabProcess from "./pages/Staff/LabProcess";
import LabResult from "./pages/Staff/LabResult";
import RegistrationStaff from "./pages/Staff/RegistrationStaff/RegistrationStaff";
import DoctorDashboard from "./pages/Doctor/DoctorDashboardRefactored";
import MainServiceDetail from "./pages/Guest/ServiceDetail/MainServiceDetail";
import DoctorPage from "./pages/Guest/Doctor/DoctorPage";
import Appointment from "./pages/Guest/Appointment";
import AppointmentHistory from "./pages/Patient/AppointmentHistory";
import AboutPage from "./pages/Guest/Home/AboutPage";
import NewsPage from "./pages/Guest/Home/NewsPage";
import PatientProfile from "./pages/Patient/PatientProfile";
import PatientRegister from "./pages/Auth/PatientRegister";
// import LabStaffDashboard from "./pages/LabStaffv2/LabStaffDashboard";
import LabStaffDashboardV2 from "./pages/LabStaffv2/LabStaffDashboardV2";
import DoctorProfile from "./pages/Doctor/DoctorProfile";

import PaymentResult from "./pages/Payment/PaymentResult";
import Manager from "./pages/Manager/ManagerDashboard";
import Blogs from "./pages/Guest/Home/Blogs";
import BlogDetails from "./pages/Guest/Home/BlogDetails";
function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

function AppContent() {
  const location = useLocation();
  const { user } = useAuth();
  // Chỉ ẩn header ở trang login staff, trang login patient vẫn có header
  const hideHeader = location.pathname === "/login/staff";
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {!hideHeader && <Header />}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login/staff" element={<StaffLogin />} />
          <Route path="/login/patient" element={<PatientLogin />} />
          {/* Protected Staff Routes */}
          <Route
            path="/lab-staff"
            element={
              <ProtectedRoute staffOnly={true} requiredRole="Lab-Staff">
                {/* <LabStaff /> */}
                {/* <LabStaffDashboard /> */}
                <LabStaffDashboardV2 />
              </ProtectedRoute>
            }
          />
          {/* <Route
            path="/lab-process"
            element={
              <ProtectedRoute staffOnly={true} requiredRole="Lab-Staff">
                <LabProcess />
                
              </ProtectedRoute>
            }
          />
          <Route
            path="/lab-result"
            element={
              <ProtectedRoute staffOnly={true} requiredRole="Lab-Staff">
                <LabResult />
               
              </ProtectedRoute>
            }
          /> */}
          <Route
            path="/registration-staff"
            element={
              <ProtectedRoute
                staffOnly={true}
                requiredRole="Registration-staff"
              >
                <RegistrationStaff />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor-dashboard"
            element={
              <ProtectedRoute staffOnly={true} requiredRole="Doctor">
                <DoctorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager"
            element={
              <ProtectedRoute staffOnly={true} requiredRole="Manager">
                <Manager />
              </ProtectedRoute>
            }
          />
          {/* Guest/Patient Routes */}
          <Route
            path="/appointment-history"
            element={
              <ProtectedRoute>
                <AppointmentHistory />
              </ProtectedRoute>
            }
          />
          <Route path="/register" element={<PatientRegister />} />
          <Route path="/service/:serviceId" element={<MainServiceDetail />} />
          <Route path="/doctors/:id" element={<DoctorDetail />} />
          <Route path="/doctorpage" element={<DoctorPage />} />
          <Route path="/appointment" element={<Appointment />} />
          <Route path="/about" element={<AboutPage />} />
          {/* <Route path="/news" element={<NewsPage />} /> */}
          <Route path="/news" element={<Blogs />} />
          <Route path="/news/:id" element={<BlogDetails />} />
          {/* Protected Patient Routes */}
          <Route
            path="/profile"
            element={
              user?.role === "Patient" ? (
                <ProtectedRoute>
                  <PatientProfile />
                </ProtectedRoute>
              ) : user?.role === "Doctor" ? (
                <ProtectedRoute staffOnly={true} requiredRole="Doctor">
                  <DoctorProfile />
                </ProtectedRoute>
              ) : user?.role === "Lab-Staff" ||
                user?.role === "Registration-staff" ? (
                <ProtectedRoute staffOnly={true}>
                  <StaffProfile />
                </ProtectedRoute>
              ) : (
                <div className="min-h-[60vh] flex items-center justify-center text-gray-500">
                  Bạn chưa đăng nhập hoặc không có quyền truy cập.
                </div>
              )
            }
          />
          // Thêm route mới
          <Route path="/payment-result" element={<PaymentResult />} />
        </Routes>
      </main>
      {/* Chỉ hiển thị Footer cho guest và bệnh nhân */}
      {(!user || user.role === "Patient") && <Footer />}
    </div>
  );
}

function StaffProfile() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-xl text-green-700">
      Trang hồ sơ nhân viên (đang phát triển)
    </div>
  );
}

export default App;
