
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
            <Route
            <Route path="/login/patient" element={<PatientLogin onLogin={setUser} />} />
            <Route path="/lab-staff" element={<LabStaff user={user} />} />
            <Route path="/lab-process" element={<LabProcess />} />
            <Route path="/lab-result" element={<LabResult />} />
            
            <Route path="/register" element={<RegisterPlaceholder />} />
            <Route path="/services/screening" element={<ScreeningDetail user={user} />} />
            <Route path="/doctors/:id" element={<DoctorDetail user={user} />} />
            <Route path="/doctorpage" element={<DoctorPage />} />
            <Route path="/booking" element={<Appointment user={user} />} />
          </Routes>
        </main>
        {/* Chỉ hiển thị Footer cho guest và bệnh nhân */}
        {(!user || user.role === 'Patient') && <Footer />}
      </div>
    </Router>
  )
}

function RegisterPlaceholder() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <h2 className="text-2xl font-bold text-green-700">Trang đăng ký</h2>
      <div className="text-gray-500">Tính năng đang phát triển.</div>
    </div>
  )
}

export default App
