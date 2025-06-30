import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";

const mockProfile = {
  name: "Nguyễn Văn A",
  id: "BN001234",
  role: "Bệnh nhân",
  avatar: "",
  phone: "0123456789",
  email: "patient@example.com",
  address: "123 Đường ABC, Quận 1, TP.HCM",
  dob: "1990-01-15",
  // emergencyContact: "0987654321", // Bỏ
  hivLoad: {
    value: "Không phát hiện",
    date: "2024-05-30",
  },
  cd4: {
    value: 650,
    unit: "cells/µL",
    status: "Tốt",
  },
  regimen: {
    name: "Tenofovir/Emtricitabine/Efavirenz",
    dose: "600/200/600mg - 1 viên/ngày",
    note: "Uống thuốc đều đặn cùng giờ mỗi ngày",
  },
  note: "Điều trị ARV từ 2020, tuân thủ tốt",
};

const PatientProfile = () => {
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [profile, setProfile] = useState(mockProfile);
  const [edit, setEdit] = useState(false);
  const [editData, setEditData] = useState(profile);
  
  // Change password states
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
    otp: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpMessage, setOtpMessage] = useState('');
  
  const { user } = useAuth();

  const handleEdit = () => {
    setEditData(profile);
    setEdit(true);
  };
  const handleCancel = () => {
    setEdit(false);
    setEditData(profile);
  };
  const handleSave = () => {
    setProfile(editData);
    setEdit(false);
  };
  const handleChange = (field, value) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
    // Clear errors when user starts typing
    if (passwordError) setPasswordError('');
    if (passwordSuccess) setPasswordSuccess('');
  };

  const validatePasswordForm = () => {
    if (!passwordData.oldPassword || !passwordData.newPassword || !passwordData.confirmPassword || !passwordData.otp) {
      setPasswordError('Vui lòng điền đầy đủ thông tin');
      return false;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Mật khẩu xác nhận không khớp');
      return false;
    }

    if (passwordData.newPassword.length < 8) {
      setPasswordError('Mật khẩu phải có ít nhất 8 ký tự');
      return false;
    }

    // Validate strong password requirements (matching backend)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    if (!passwordRegex.test(passwordData.newPassword)) {
      setPasswordError('Mật khẩu phải chứa ít nhất 1 chữ thường, 1 chữ hoa, 1 số và 1 ký tự đặc biệt (@$!%*?&)');
      return false;
    }

    return true;
  };

  const handleChangePassword = async () => {
    setPasswordError('');
    setPasswordSuccess('');

    if (!validatePasswordForm()) return;

    setPasswordLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          oldPassword: passwordData.oldPassword,
          newPassword: passwordData.newPassword
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Đổi mật khẩu thất bại');
      }

      setPasswordSuccess('Đổi mật khẩu thành công!');
      
      // Reset form
      setPasswordData({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
        otp: ''
      });

      // Hide form after 2 seconds
      setTimeout(() => {
        setShowChangePassword(false);
        setPasswordSuccess('');
      }, 2000);

    } catch (err) {
      console.error('Change password error:', err);
      setPasswordError(err.message);
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleGetOtp = async () => {
    setOtpLoading(true);
    setOtpMessage('');
    try {
      // Gửi OTP về email hoặc số điện thoại
      const response = await fetch('http://localhost:5000/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: profile.email,
          phone: profile.phone
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Gửi OTP thất bại');
      setOtpMessage('OTP đã được gửi!');
    } catch (err) {
      setOtpMessage(err.message);
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-2">
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
        {/* Thông tin cá nhân */}
        <div className="bg-white rounded-xl shadow p-6 flex flex-col gap-4">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-3xl text-gray-400">
              {profile.avatar ? (
                <img src={profile.avatar} alt={profile.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                <span className="material-icons">person</span>
              )}
            </div>
            <div>
              <div className="font-bold text-xl text-gray-800">{profile.name}</div>
              <div className="text-gray-500 text-sm">{profile.role}</div>
              <div className="text-xs bg-blue-50 text-blue-700 rounded px-2 py-1 mt-1 inline-block font-mono">ID: {profile.id}</div>
            </div>
            {!edit ? (
              <button className="ml-auto px-4 py-2 rounded border border-gray-200 text-gray-600 hover:bg-gray-100 transition text-sm" onClick={handleEdit}>Chỉnh sửa</button>
            ) : null}
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Họ và tên</label>
              <input
                className="w-full px-3 py-2 rounded border bg-gray-50"
                value={edit ? editData.name : profile.name}
                onChange={e => handleChange("name", e.target.value)}
                disabled={!edit}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Số điện thoại</label>
              <input
                className="w-full px-3 py-2 rounded border bg-gray-50"
                value={edit ? editData.phone : profile.phone}
                onChange={e => handleChange("phone", e.target.value)}
                disabled={!edit}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Email</label>
              <input
                className="w-full px-3 py-2 rounded border bg-gray-50"
                value={edit ? editData.email : profile.email}
                onChange={e => handleChange("email", e.target.value)}
                disabled={!edit}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Địa chỉ</label>
              <input
                className="w-full px-3 py-2 rounded border bg-gray-50"
                value={edit ? editData.address : profile.address}
                onChange={e => handleChange("address", e.target.value)}
                disabled={!edit}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Ngày sinh</label>
              <input
                className="w-full px-3 py-2 rounded border bg-gray-50"
                value={edit ? editData.dob : profile.dob}
                onChange={e => handleChange("dob", e.target.value)}
                disabled={!edit}
                type="date"
              />
            </div>
          </div>
          {edit ? (
            <div className="flex gap-2 mt-4">
              <button className="px-4 py-2 rounded bg-green-600 text-white font-semibold hover:bg-green-700 transition" onClick={handleSave}>Lưu</button>
              <button className="px-4 py-2 rounded bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition" onClick={handleCancel}>Hủy</button>
            </div>
          ) : (
            <button
              className="mt-4 px-4 py-2 rounded bg-green-600 text-white font-semibold hover:bg-green-700 transition"
              onClick={() => setShowChangePassword((v) => !v)}
            >
              Đổi mật khẩu
            </button>
          )}
          {showChangePassword && !edit && (
            <div className="mt-2 p-4 bg-gray-100 rounded-xl border">
              <h4 className="font-semibold text-gray-800 mb-3">Đổi mật khẩu</h4>
              <div className="mb-3">
                <label className="block text-xs text-gray-500 mb-1">Mã OTP</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 rounded border focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    value={passwordData.otp}
                    onChange={e => handlePasswordChange("otp", e.target.value)}
                    placeholder="Nhập mã OTP được gửi về điện thoại/email"
                  />
                  <button
                    type="button"
                    onClick={handleGetOtp}
                    className={`px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition ${otpLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={otpLoading}
                  >
                    {otpLoading ? 'Đang gửi...' : 'Lấy OTP'}
                  </button>
                </div>
                {otpMessage && (
                  <div className={`mt-2 text-sm ${otpMessage.includes('OTP đã được gửi') ? 'text-green-600' : 'text-red-600'}`}>{otpMessage}</div>
                )}
              </div>
              <div className="mb-3">
                <label className="block text-xs text-gray-500 mb-1">Mật khẩu cũ</label>
                <input 
                  type="password" 
                  className="w-full px-3 py-2 rounded border focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  value={passwordData.oldPassword}
                  onChange={e => handlePasswordChange("oldPassword", e.target.value)}
                  placeholder="Nhập mật khẩu hiện tại"
                />
              </div>
              <div className="mb-3">
                <label className="block text-xs text-gray-500 mb-1">Mật khẩu mới</label>
                <input 
                  type="password" 
                  className="w-full px-3 py-2 rounded border focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  value={passwordData.newPassword}
                  onChange={e => handlePasswordChange("newPassword", e.target.value)}
                  placeholder="Nhập mật khẩu mới"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ thường, chữ hoa, số và ký tự đặc biệt (@$!%*?&)
                </p>
              </div>
              <div className="mb-3">
                <label className="block text-xs text-gray-500 mb-1">Nhập lại mật khẩu mới</label>
                <input 
                  type="password" 
                  className="w-full px-3 py-2 rounded border focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  value={passwordData.confirmPassword}
                  onChange={e => handlePasswordChange("confirmPassword", e.target.value)}
                  placeholder="Nhập lại mật khẩu mới"
                />
              </div>

              {passwordError && (
                <div className="mb-3 p-2 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
                  {passwordError}
                </div>
              )}

              {passwordSuccess && (
                <div className="mb-3 p-2 bg-green-50 border border-green-200 text-green-700 rounded text-sm">
                  {passwordSuccess}
                </div>
              )}

              <div className="flex gap-2">
                <button 
                  className="flex-1 bg-green-600 text-white py-2 rounded font-semibold hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                  onClick={handleChangePassword}
                  disabled={passwordLoading}
                >
                  {passwordLoading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Đang xử lý...
                    </div>
                  ) : (
                    'Xác nhận đổi mật khẩu'
                  )}
                </button>
                <button 
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded font-semibold hover:bg-gray-300 transition"
                  onClick={() => {
                    setShowChangePassword(false);
                    setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '', otp: '' });
                    setPasswordError('');
                    setPasswordSuccess('');
                  }}
                >
                  Hủy
                </button>
              </div>
            </div>
          )}
        </div>
        {/* Thông tin y tế */}
        <div className="bg-white rounded-xl shadow p-6 flex flex-col gap-4">
          <div className="font-bold text-lg text-gray-700 mb-2 flex items-center gap-2">
            <span className="material-icons text-green-600">link</span> Thông tin y tế
          </div>
          <div className="rounded-xl bg-green-50 p-4 mb-2">
            <div className="text-xs text-gray-500 mb-1">Tải lượng HIV</div>
            <div className="text-2xl font-bold text-green-700 mb-1">{profile.hivLoad.value}</div>
            <div className="text-xs text-gray-500">Xét nghiệm gần nhất: {profile.hivLoad.date}</div>
          </div>
          <div className="rounded-xl bg-blue-50 p-4 mb-2">
            <div className="text-xs text-gray-500 mb-1">CD4 Count</div>
            <div className="text-2xl font-bold text-blue-700 mb-1">{profile.cd4.value} {profile.cd4.unit}</div>
            <div className="text-xs text-gray-500">Tình trạng miễn dịch: {profile.cd4.status}</div>
          </div>
          <div className="rounded-xl bg-purple-50 p-4 mb-2">
            <div className="text-xs text-gray-500 mb-1">Phác đồ điều trị hiện tại</div>
            <div className="font-bold text-purple-700 mb-1">{profile.regimen.name}</div>
            <div className="text-xs text-gray-500 mb-1">{profile.regimen.dose}</div>
            <div className="flex items-center gap-2 mt-2">
              <span className="material-icons text-orange-400 text-base">priority_high</span>
              <span className="text-xs text-orange-600">Nhắc nhở: {profile.regimen.note}</span>
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Ghi chú y tế</label>
            <textarea className="w-full px-3 py-2 rounded border bg-gray-50" value={profile.note} disabled />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientProfile; 