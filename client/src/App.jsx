import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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
import ScreeningDetail from "./pages/Guest/ServiceDetail/ScreeningDetail";
import ConfirmDetail from "./pages/Guest/ServiceDetail/ConfirmDetail";
import PepDetail from "./pages/Guest/ServiceDetail/PepDetail";
import DoctorPage from "./pages/Guest/DoctorPage";
import Appointment from "./pages/Guest/Appointment";
import DoctorDashBoard from "./pages/Doctor/DoctorDashboard";
function App() {
  // State lưu thông tin user đăng nhập
  const [user, setUser] = useState(null);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header user={user} setUser={setUser} />
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
            <Route path="/doctor" element={<DoctorDashBoard />} />

            <Route path="/register" element={<RegisterPlaceholder />} />
            <Route
              path="/services/screening"
              element={<ScreeningDetail user={user} />}
            />
            <Route
              path="/services/confirm"
              element={<ConfirmDetail user={user} />}
            />
            <Route path="/services/pep" element={<PepDetail user={user} />} />
            <Route path="/doctors/:id" element={<DoctorDetail user={user} />} />
            <Route path="/doctorpage" element={<DoctorPage />} />
            <Route path="/appointment" element={<Appointment user={user} />} />
          </Routes>
        </main>
        {/* Chỉ hiển thị Footer cho guest và bệnh nhân */}
        {(!user || user.role === "Patient") && <Footer />}
      </div>
    </Router>
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
