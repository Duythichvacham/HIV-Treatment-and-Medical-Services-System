import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const PatientLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login, getDefaultPath } = useAuth();
  const [showForgot, setShowForgot] = useState(false);
  const [forgotData, setForgotData] = useState({
    username: "",
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [forgotStep, setForgotStep] = useState(1); // 1: nhập user+email, 2: nhập otp+newpass
  const [forgotMsg, setForgotMsg] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await login(username, password, "patient");

      // Redirect back to original location or patient home
      const from = location.state?.from || getDefaultPath(result.user.role);
      navigate(from, { replace: true });
    } catch (error) {
      console.error("Login error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotChange = (e) => {
    const { name, value } = e.target;
    setForgotData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSendOtpForgot = async () => {
    setForgotLoading(true);
    setForgotMsg("");
    try {
      // Gửi OTP về email
      const res = await fetch(`http://localhost:5000${import.meta.env.VITE_API_PREFIX}/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotData.email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gửi OTP thất bại");
      setForgotMsg("OTP đã được gửi về email!");
      setForgotStep(2);
    } catch (err) {
      setForgotMsg(err.message);
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setForgotLoading(true);
    setForgotMsg("");
    if (
      !forgotData.otp ||
      !forgotData.newPassword ||
      !forgotData.confirmPassword
    ) {
      setForgotMsg("Vui lòng nhập đầy đủ OTP và mật khẩu mới");
      setForgotLoading(false);
      return;
    }
    if (forgotData.newPassword !== forgotData.confirmPassword) {
      setForgotMsg("Mật khẩu xác nhận không khớp");
      setForgotLoading(false);
      return;
    }
    try {
      // Xác thực OTP
      const verifyRes = await fetch(
        `http://localhost:5000${import.meta.env.VITE_API_PREFIX}/auth/verify-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: forgotData.email,
            otp: forgotData.otp,
          }),
        }
      );
      const verifyData = await verifyRes.json();
      if (!verifyRes.ok)
        throw new Error(verifyData.message || "Xác thực OTP thất bại");
      // Gọi API reset password
      const resetRes = await fetch(
        `http://localhost:5000${import.meta.env.VITE_API_PREFIX}/auth/reset-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: forgotData.email,
            newPassword: forgotData.newPassword,
          }),
        }
      );
      const resetData = await resetRes.json();
      if (!resetRes.ok)
        throw new Error(resetData.message || "Đặt lại mật khẩu thất bại");
      setForgotMsg("Đặt lại mật khẩu thành công!");
      setTimeout(() => {
        setShowForgot(false);
        setForgotStep(1);
        setForgotData({
          username: "",
          email: "",
          otp: "",
          newPassword: "",
          confirmPassword: "",
        });
        setForgotMsg("");
      }, 2000);
    } catch (err) {
      setForgotMsg(err.message);
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl font-bold text-green-700 mb-6 text-center">
          Đăng nhập Bệnh nhân
        </h2>
        <div className="mb-4">
          <label className="block text-gray-700 mb-1">Tên đăng nhập</label>
          <input
            type="text"
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-1">Mật khẩu</label>
          <input
            type="password"
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </div>
        {error && <div className="text-red-600 mb-3 text-sm">{error}</div>}{" "}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 rounded-md font-semibold transition ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
          } text-white`}
        >
          {loading ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>
        <div className="mt-4 text-center">
          <p className="text-gray-600 mb-3">
            Chưa có tài khoản?{" "}
            <Link
              to="/register"
              className="text-green-600 hover:text-green-700 font-medium"
            >
              Đăng ký ngay
            </Link>
          </p>
        </div>
        <button
          type="button"
          className="text-blue-600 underline mt-2"
          onClick={() => setShowForgot(true)}
        >
          Quên mật khẩu?
        </button>
      </form>
      {showForgot && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Quên mật khẩu</h3>
            {forgotStep === 1 ? (
              <>
                <div className="mb-3">
                  <label className="block text-sm mb-1">Tên đăng nhập</label>
                  <input
                    type="text"
                    name="username"
                    value={forgotData.username}
                    onChange={handleForgotChange}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                <div className="mb-3">
                  <label className="block text-sm mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={forgotData.email}
                    onChange={handleForgotChange}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                <button
                  type="button"
                  className="w-full bg-blue-600 text-white py-2 rounded font-semibold mt-2"
                  onClick={handleSendOtpForgot}
                  disabled={forgotLoading}
                >
                  {forgotLoading ? "Đang gửi..." : "Gửi OTP"}
                </button>
              </>
            ) : (
              <>
                <div className="mb-3">
                  <label className="block text-sm mb-1">Mã OTP</label>
                  <input
                    type="text"
                    name="otp"
                    value={forgotData.otp}
                    onChange={handleForgotChange}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                <div className="mb-3">
                  <label className="block text-sm mb-1">Mật khẩu mới</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={forgotData.newPassword}
                    onChange={handleForgotChange}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                <div className="mb-3">
                  <label className="block text-sm mb-1">
                    Nhập lại mật khẩu mới
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={forgotData.confirmPassword}
                    onChange={handleForgotChange}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                <button
                  type="button"
                  className="w-full bg-green-600 text-white py-2 rounded font-semibold mt-2"
                  onClick={handleResetPassword}
                  disabled={forgotLoading}
                >
                  {forgotLoading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
                </button>
              </>
            )}
            {forgotMsg && (
              <div className="mt-3 text-center text-sm text-red-600">
                {forgotMsg}
              </div>
            )}
            <button
              type="button"
              className="mt-4 w-full text-gray-500 underline"
              onClick={() => {
                setShowForgot(false);
                setForgotStep(1);
                setForgotData({
                  username: "",
                  email: "",
                  otp: "",
                  newPassword: "",
                  confirmPassword: "",
                });
                setForgotMsg("");
              }}
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientLogin;
