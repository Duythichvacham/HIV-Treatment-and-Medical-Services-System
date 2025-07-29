import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { usePatientDetail } from "../../hooks/doctor/usePatientDetail";
import { UserCircle } from "lucide-react";

// Helper chuyển đổi ngày về yyyy-MM-dd cho input type='date'
function formatDateForInput(dateStr) {
  if (!dateStr) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
  if (dateStr.includes("T")) return dateStr.split("T")[0];
  // Nếu là dạng mm/dd/yyyy
  const parts = dateStr.split("/");
  if (parts.length === 3) {
    return `${parts[2]}-${parts[0].padStart(2, "0")}-${parts[1].padStart(
      2,
      "0"
    )}`;
  }
  return dateStr;
}

const PatientProfile = () => {
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [edit, setEdit] = useState(false);
  const [editData, setEditData] = useState(null);

  // Change password states
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
    otp: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpMessage, setOtpMessage] = useState("");

  const { user } = useAuth();
  const [personalInfo, setPersonalInfo] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const patientId = user?.patient_id || "";
  const { patientDetail } = usePatientDetail(patientId);

  useEffect(() => {
    if (!patientId) return;
    setLoadingProfile(true);
    const token = localStorage.getItem("token");
    Promise.all([
      fetch(`http://localhost:5000/api/v1/patients/${patientId}`, {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      }).then(async (res) => {
        if (!res.ok)
          throw new Error(
            res.status === 401
              ? "Bạn cần đăng nhập lại."
              : "Không tìm thấy thông tin cá nhân."
          );
        return res.json();
      }),
      // Medical info API is not available, commented out for now
      // fetch(`http://localhost:5000/api/v1/doctor/current-exam/${patientId}`, {
      //   headers: {
      //     'Content-Type': 'application/json',
      //     ...(token && { 'Authorization': `Bearer ${token}` })
      //   }
      // }).then(async res => {
      //   if (res.status === 404) return null; // Không có thông tin y tế
      //   if (!res.ok) throw new Error(res.status === 401 ? 'Bạn cần đăng nhập lại.' : 'Không tìm thấy thông tin y tế.');
      //   return res.json();
      // })
    ])
      .then(([personalRes]) => {
        setPersonalInfo(personalRes.data || personalRes);
      })
      .catch((err) => {
        alert(err.message);
      })
      .finally(() => setLoadingProfile(false));
  }, [patientId]);

  const handleEdit = () => {
    setEditData(personalInfo);
    setEdit(true);
  };
  const handleCancel = () => {
    setEdit(false);
    setEditData(personalInfo);
  };
  const handleSave = async () => {
    setEdit(false);
    setLoadingProfile(true);
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        `http://localhost:5000/api/v1/patients/${patientId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify({
            full_name: editData.full_name,
            dob: editData.dob,
            gender: editData.gender,
            email: editData.email,
            phone: editData.phone,
            address: editData.address,
          }),
        }
      );
      if (!response.ok)
        throw new Error(
          response.status === 401
            ? "Bạn cần đăng nhập lại."
            : "Cập nhật thông tin thất bại"
        );
      // Reload lại thông tin cá nhân
      const personalRes = await fetch(
        `http://localhost:5000/api/v1/patients/${patientId}`,
        {
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        }
      );
      if (!personalRes.ok)
        throw new Error("Không lấy được thông tin cá nhân sau khi cập nhật");
      const personalData = await personalRes.json();
      setPersonalInfo(personalData.data || personalData);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoadingProfile(false);
    }
  };
  const handleChange = (field, value) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePasswordChange = (field, value) => {
    setPasswordData((prev) => ({ ...prev, [field]: value }));
    // Clear errors when user starts typing
    if (passwordError) setPasswordError("");
    if (passwordSuccess) setPasswordSuccess("");
  };

  const validatePasswordForm = () => {
    if (
      !passwordData.oldPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword ||
      !passwordData.otp
    ) {
      setPasswordError("Vui lòng điền đầy đủ thông tin");
      return false;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("Mật khẩu xác nhận không khớp");
      return false;
    }

    if (passwordData.newPassword.length < 8) {
      setPasswordError("Mật khẩu phải có ít nhất 8 ký tự");
      return false;
    }

    // Validate strong password requirements (matching backend)
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    if (!passwordRegex.test(passwordData.newPassword)) {
      setPasswordError(
        "Mật khẩu phải chứa ít nhất 1 chữ thường, 1 chữ hoa, 1 số và 1 ký tự đặc biệt (@$!%*?&)"
      );
      return false;
    }

    return true;
  };

  const handleChangePassword = async () => {
    setPasswordError("");
    setPasswordSuccess("");

    if (!validatePasswordForm()) return;

    setPasswordLoading(true);

    try {
      // Log giá trị email và otp trước khi xác thực
      console.log(
        "Email gửi verify-otp:",
        personalInfo.email,
        "OTP:",
        passwordData.otp
      );
      // Xác thực OTP trước khi đổi mật khẩu
      const verifyRes = await fetch(
        "http://localhost:5000/api/auth/verify-otp",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: personalInfo.email,
            otp: passwordData.otp,
          }),
        }
      );
      const verifyData = await verifyRes.json();
      if (!verifyRes.ok) {
        setPasswordError(verifyData.message || "Xác thực OTP thất bại");
        setPasswordLoading(false);
        return;
      }
      // Log trước khi đổi mật khẩu
      console.log("Email gửi change-password:", personalInfo.email);
      // Chỉ khi xác thực OTP thành công mới gọi đổi mật khẩu
      const token = localStorage.getItem("token");
      const response = await fetch(
        "http://localhost:5000/api/auth/change-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            email: personalInfo.email,
            oldPassword: passwordData.oldPassword,
            newPassword: passwordData.newPassword,
          }),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Đổi mật khẩu thất bại");
      }
      setPasswordSuccess("Đổi mật khẩu thành công!");
      setPasswordData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
        otp: "",
      });
      setTimeout(() => {
        setShowChangePassword(false);
        setPasswordSuccess("");
      }, 2000);
    } catch (err) {
      setPasswordError(err.message);
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleGetOtp = async () => {
    setOtpLoading(true);
    setOtpMessage("");
    try {
      // Gửi OTP về email hoặc số điện thoại
      const response = await fetch("http://localhost:5000/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: personalInfo.email,
          phone: personalInfo.phone,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Gửi OTP thất bại");
      setOtpMessage("OTP đã được gửi!");
    } catch (err) {
      setOtpMessage(err.message);
    } finally {
      setOtpLoading(false);
    }
  };

  if (loadingProfile) return <div>Đang tải hồ sơ...</div>;
  if (!personalInfo) return <div>Không tìm thấy thông tin cá nhân.</div>;

  console.log("Patient Detail:", patientDetail);

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-2">
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
        {/* Thông tin cá nhân */}
        <div className="bg-white rounded-xl shadow p-6 flex flex-col gap-4">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-10 h-10 rounded-full flex items-center justify-center border-2 border-gray-500 bg-gray-50 text-gray-600 shadow-md transition-all duration-200 group-hover:shadow-lg group-hover:scale-105">
              <UserCircle size={24} />
            </div>
            <div>
              <div className="font-bold text-xl text-gray-800">
                {personalInfo.full_name}
              </div>
              <div className="text-gray-500 text-sm">Bệnh nhân</div>
              <div className="text-xs bg-blue-50 text-blue-700 rounded px-2 py-1 mt-1 inline-block font-mono">
                ID: {personalInfo.patient_id}
              </div>
            </div>
            {!edit ? (
              <button
                className="ml-auto px-4 py-2 rounded border border-gray-200 text-gray-600 hover:bg-gray-100 transition text-sm"
                onClick={handleEdit}
              >
                Chỉnh sửa
              </button>
            ) : null}
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Họ và tên
              </label>
              <input
                className="w-full px-3 py-2 rounded border bg-gray-50"
                value={edit ? editData.full_name : personalInfo.full_name}
                onChange={(e) => handleChange("full_name", e.target.value)}
                disabled={!edit}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Số điện thoại
              </label>
              <input
                className="w-full px-3 py-2 rounded border bg-gray-50"
                value={edit ? editData.phone : personalInfo.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                disabled={!edit}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Email</label>
              <input
                className="w-full px-3 py-2 rounded border bg-gray-50"
                value={edit ? editData.email : personalInfo.email}
                onChange={(e) => handleChange("email", e.target.value)}
                disabled={!edit}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Địa chỉ
              </label>
              <input
                className="w-full px-3 py-2 rounded border bg-gray-50"
                value={edit ? editData.address : personalInfo.address}
                onChange={(e) => handleChange("address", e.target.value)}
                disabled={!edit}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Ngày sinh
              </label>
              <input
                className="w-full px-3 py-2 rounded border bg-gray-50"
                value={
                  edit
                    ? formatDateForInput(editData.dob)
                    : formatDateForInput(personalInfo.dob)
                }
                onChange={(e) => handleChange("dob", e.target.value)}
                disabled={!edit}
                type="date"
              />
            </div>
          </div>
          {edit ? (
            <div className="flex gap-2 mt-4">
              <button
                className="px-4 py-2 rounded bg-green-600 text-white font-semibold hover:bg-green-700 transition"
                onClick={handleSave}
              >
                Lưu
              </button>
              <button
                className="px-4 py-2 rounded bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition"
                onClick={handleCancel}
              >
                Hủy
              </button>
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
                <label className="block text-xs text-gray-500 mb-1">
                  Mã OTP
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="w-full px-3 py-2 rounded border focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    value={passwordData.otp}
                    onChange={(e) =>
                      handlePasswordChange("otp", e.target.value)
                    }
                    placeholder="Nhập mã OTP được gửi về điện thoại/email"
                  />
                  <button
                    type="button"
                    onClick={handleGetOtp}
                    className={`px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition ${
                      otpLoading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    disabled={otpLoading}
                  >
                    {otpLoading ? "Đang gửi..." : "Lấy OTP"}
                  </button>
                </div>
                {otpMessage && (
                  <div
                    className={`mt-2 text-sm ${
                      otpMessage.includes("OTP đã được gửi")
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {otpMessage}
                  </div>
                )}
              </div>
              <div className="mb-3">
                <label className="block text-xs text-gray-500 mb-1">
                  Mật khẩu cũ
                </label>
                <input
                  type="password"
                  className="w-full px-3 py-2 rounded border focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  value={passwordData.oldPassword}
                  onChange={(e) =>
                    handlePasswordChange("oldPassword", e.target.value)
                  }
                  placeholder="Nhập mật khẩu hiện tại"
                />
              </div>
              <div className="mb-3">
                <label className="block text-xs text-gray-500 mb-1">
                  Mật khẩu mới
                </label>
                <input
                  type="password"
                  className="w-full px-3 py-2 rounded border focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    handlePasswordChange("newPassword", e.target.value)
                  }
                  placeholder="Nhập mật khẩu mới"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ thường, chữ hoa,
                  số và ký tự đặc biệt (@$!%*?&)
                </p>
              </div>
              <div className="mb-3">
                <label className="block text-xs text-gray-500 mb-1">
                  Nhập lại mật khẩu mới
                </label>
                <input
                  type="password"
                  className="w-full px-3 py-2 rounded border focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    handlePasswordChange("confirmPassword", e.target.value)
                  }
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
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Đang xử lý...
                    </div>
                  ) : (
                    "Xác nhận đổi mật khẩu"
                  )}
                </button>
                <button
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded font-semibold hover:bg-gray-300 transition"
                  onClick={() => {
                    setShowChangePassword(false);
                    setPasswordData({
                      oldPassword: "",
                      newPassword: "",
                      confirmPassword: "",
                      otp: "",
                    });
                    setPasswordError("");
                    setPasswordSuccess("");
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
            Thông tin y tế
          </div>
          {patientDetail && patientDetail.latestTestResults ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(patientDetail.latestTestResults).map(
                ([key, test]) => (
                  <div
                    key={key}
                    className="bg-gray-50 rounded-lg border border-gray-200 p-3"
                  >
                    <span className="text-sm text-gray-600">
                      {test.test_name}:
                    </span>
                    <p className="font-medium">
                      {test.result_value} {test.unit}
                    </p>
                    <span className="text-xs text-gray-500">
                      {test.test_date}
                    </span>
                    {test.notes && (
                      <p className="text-xs text-gray-600 mt-1">{test.notes}</p>
                    )}
                  </div>
                )
              )}
            </div>
          ) : (
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-gray-600">
                Chưa có kết quả xét nghiệm gần đây.
              </p>
            </div>
          )}
          {patientDetail && patientDetail.currentArv ? (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-4 border-b pb-2">
                Phác đồ ARV hiện tại
              </h3>
              <div className="">
                <div>
                  <span className="text-sm text-gray-600">Tên phác đồ:</span>
                  <p className="font-medium text-blue-600">
                    {patientDetail.currentArv.name}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Loại thuốc:</span>
                  <p className="font-medium">
                    {patientDetail.currentArv.components}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Ngày bắt đầu:</span>
                  <p className="font-medium">
                    {patientDetail.currentArv.created_at}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800 text-sm">
                <span className="font-medium">
                  Chưa có thông tin phác đồ ARV.
                </span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientProfile;
