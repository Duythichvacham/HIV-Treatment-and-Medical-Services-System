import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import {
  Header,
  Footer,
  HomePage,
  StaffLogin,
  PatientLogin,
  DoctorDetail,
} from "./index";
import LabStaff from "./pages/Staff/LabStaff";
import LabProcess from "./pages/Staff/LabProcess";
import LabResult from "./pages/Staff/LabResult";
import RegistrationStaff from "./pages/Staff/RegistrationStaff";
import MainServiceDetail from "./pages/Guest/ServiceDetail/MainServiceDetail";
import DoctorPage from "./pages/Guest/DoctorPage";
import Appointment from "./pages/Guest/Appointment";

function App() {
  // State lưu thông tin user đăng nhập
  const [user, setUser] = useState(null);

  return (
    <Router>
      <AppContent user={user} setUser={setUser} />
    </Router>
  );
}

function AppContent({ user, setUser }) {
  const location = useLocation();
  
  // Ẩn header ở trang login staff
  const hideHeader = location.pathname === '/login/staff';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {!hideHeader && <Header user={user} setUser={setUser} />}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/login/staff"
            element={<StaffLogin onLogin={setUser} />}
          />
          <Route
            path="/login/patient"
            element={<PatientLogin onLogin={setUser} />}
          />
          <Route path="/lab-staff" element={<LabStaff user={user} />} />
          <Route path="/lab-process" element={<LabProcess />} />
          <Route path="/lab-result" element={<LabResult />} />
          <Route path="/registration-staff" element={<RegistrationStaff user={user} />} />          <Route path="/register" element={<RegisterPlaceholder />} />
          <Route
            path="/services/:type"
            element={<MainServiceDetail user={user} />}
          />
          <Route
            path="/service/:serviceId"
            element={<MainServiceDetail user={user} />}
          />
          <Route path="/doctors/:id" element={<DoctorDetail user={user} />} />
          <Route path="/doctorpage" element={<DoctorPage />} />
          <Route path="/appointment" element={<Appointment user={user} />} />
        </Routes>
      </main>
      {/* Chỉ hiển thị Footer cho guest và bệnh nhân */}
      {(!user || user.role === "Patient") && <Footer />}
    </div>
  );
}

function RegisterPlaceholder() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <h2 className="text-2xl font-bold text-green-700">Trang đăng ký</h2>
      <div className="text-gray-500">Tính năng đang phát triển.</div>
    </div>
  );
}

export default App;
