import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Header, Footer, HomePage, StaffLogin, PatientLogin } from './index'
import LabStaff from './pages/Staff/LabStaff'
import LabProcess from './pages/Staff/LabProcess'
import LabResult from './pages/Staff/LabResult'
import DoctorPage from './pages/Guest/DoctorPage'

function App() {
  // State lưu thông tin user đăng nhập
  const [user, setUser] = useState(null)

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header user={user} setUser={setUser} />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login/staff" element={<StaffLogin onLogin={setUser} />} />
            <Route path="/login/patient" element={<PatientLogin onLogin={setUser} />} />
            <Route path="/lab-staff" element={<LabStaff user={user} />} />
            <Route path="/lab-process" element={<LabProcess />} />
            <Route path="/lab-result" element={<LabResult />} />
            
            <Route path="/register" element={<RegisterPlaceholder />} />
            <Route path="/doctorpage" element={<DoctorPage />} />
          </Routes>
        </main>
        {/* Chỉ hiển thị Footer cho guest và bệnh nhân */}
        {(!user || user.role === 'Patient') && <Footer />}
      </div>
    </Router>
  )
}

// Trang chọn loại đăng nhập
function LoginSelect() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6">
      <h2 className="text-2xl font-bold text-green-700 mb-4">Chọn loại đăng nhập</h2>
      <div className="flex gap-6">
        <a href="/login/patient" className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold shadow hover:bg-green-700 transition">Đăng nhập Bệnh nhân</a>
        <a href="/login/staff" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold shadow hover:bg-blue-700 transition">Đăng nhập Nhân viên</a>
      </div>
    </div>
  )
}

// Trang đăng ký placeholder
function RegisterPlaceholder() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <h2 className="text-2xl font-bold text-green-700">Trang đăng ký</h2>
      <div className="text-gray-500">Tính năng đang phát triển.</div>
    </div>
  )
}

export default App
