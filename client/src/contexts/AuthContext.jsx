import React, { createContext, useContext, useState, useEffect } from "react";
import { login as apiLogin } from "../services/api";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null); // Kiểm tra localStorage khi app khởi động
  useEffect(() => {
    const checkAuthStatus = () => {
      try {
        const savedToken = localStorage.getItem("token");
        const savedUser = localStorage.getItem("user");

        console.log("AuthContext: Checking localStorage...", {
          hasToken: !!savedToken,
          hasUser: !!savedUser,
        });

        if (savedToken && savedUser) {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
          console.log(
            "AuthContext: Auto-login from localStorage",
            JSON.parse(savedUser)
          );
        }
      } catch (error) {
        console.error("Error checking auth status:", error);
        // Clear invalid data
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
      setLoading(false);
    };
    checkAuthStatus();
  }, []);

  // Theo dõi thay đổi localStorage (khi user xóa token thủ công)
  useEffect(() => {
    const handleStorageChange = (e) => {
      // Chỉ xử lý khi token bị xóa/thay đổi
      if (e.key === "token") {
        if (!e.newValue) {
          // Token bị xóa -> logout
          console.log(
            "AuthContext: Token removed from localStorage, logging out..."
          );
          setUser(null);
          setToken(null);
          // Redirect về login nếu không phải đã ở trang login/guest
          setTimeout(() => redirectToLogin(), 50); // Delay rất nhỏ để tránh conflict
        } else if (e.newValue !== token) {
          // Token thay đổi -> update state
          console.log(
            "AuthContext: Token changed in localStorage, updating..."
          );
          setToken(e.newValue);
          // Cũng cần update user nếu có
          const savedUser = localStorage.getItem("user");
          if (savedUser) {
            setUser(JSON.parse(savedUser));
          }
        }
      }
      // Xử lý khi user data bị xóa
      if (e.key === "user" && !e.newValue && user) {
        console.log(
          "AuthContext: User data removed from localStorage, logging out..."
        );
        setUser(null);
        setToken(null);
        // Redirect về login nếu không phải đã ở trang login/guest
        setTimeout(() => redirectToLogin(), 50); // Delay rất nhỏ để tránh conflict
      }
    };

    // Listen for storage changes
    window.addEventListener("storage", handleStorageChange);

    // Cleanup
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [token, user]);
  // Helper function để redirect về trang login
  const redirectToLogin = () => {
    const currentPath = window.location.pathname;
    const isLoginPage = currentPath.includes("/login");
    
    // Lấy userType từ localStorage trước khi xóa
    const userType = localStorage.getItem("userType");
    
    if (!isLoginPage && userType === "staff") {
      // Chỉ staff mới redirect về login
        console.log(
        "AuthContext: Redirecting to staff login",
          currentPath
        );
      localStorage.removeItem("userType"); // Xóa sau khi sử dụng
        window.location.href = "/login/staff";
    }
    // Patient không redirect, ở lại trang hiện tại
  };

  // Login function
  const login = async (username, password, loginUserType = "auto") => {
    try {
      const response = await apiLogin(username, password);

      if (!response.token) {
        throw new Error("No token received");
      }

      // Decode token to get user info
      const tokenPayload = JSON.parse(atob(response.token.split(".")[1]));

      // Validate user type if specified
      if (loginUserType === "staff" && tokenPayload.role === "Patient") {
        throw new Error("Tài khoản này không phải của nhân viên!");
      }
      if (loginUserType === "patient" && tokenPayload.role !== "Patient") {
        throw new Error("Tài khoản này không phải của bệnh nhân!");
      } // Create user object
      const userData = {
        id: tokenPayload.userId,
        username: tokenPayload.username,
        role: tokenPayload.role,
        name: tokenPayload.name || username,
        avatar: getDefaultAvatar(tokenPayload.role),
      };

      // Thêm doctor_id nếu user là Doctor
      if (tokenPayload.role === "Doctor" && tokenPayload.doctor_id) {
        userData.doctor_id = tokenPayload.doctor_id;
      }

      // Thêm lab_staff_id nếu user là Lab-Staff
      if (tokenPayload.role === 'Lab-Staff' && tokenPayload.lab_staff_id) {
        userData.lab_staff_id = tokenPayload.lab_staff_id;
      }

      // Thêm registration_staff_id nếu user là Registration-staff
      if (tokenPayload.role === 'Registration-staff' && tokenPayload.registration_staff_id) {
        userData.registration_staff_id = tokenPayload.registration_staff_id;
      }

      // Thêm manager_id nếu user là Manager
      if (tokenPayload.role === 'Manager' && tokenPayload.manager_id) {
        userData.manager_id = tokenPayload.manager_id;
      }

      // Thêm patient_id nếu user là Patient
      if (tokenPayload.role === 'Patient' && tokenPayload.patient_id) {
        userData.patient_id = tokenPayload.patient_id;
      }

      // Store in state and localStorage
      setToken(response.token);
      setUser(userData);
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(userData));
      
      // Lưu userType để logout redirect đúng
      const userType = userData.role && userData.role !== "Patient" ? "staff" : "patient";
      localStorage.setItem("userType", userType);

      return { success: true, user: userData };
    } catch (error) {
      console.error("Login error:", error);

      if (error.response?.status === 401) {
        throw new Error("Sai tài khoản hoặc mật khẩu!");
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error("Có lỗi xảy ra. Vui lòng thử lại!");
      }
    }
  }; // Logout function
  const logout = () => {
    // Lưu userType trước khi xóa để redirect đúng
    const userType = user?.role && user.role !== "Patient" ? "staff" : "patient";
    
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userType");
    // Also remove old storage keys for backward compatibility
    localStorage.removeItem("staff");
    localStorage.removeItem("patient");

    // Chỉ staff mới redirect về login, patient ở lại trang hiện tại
    if (userType === "staff") {
      setTimeout(() => {
        window.location.href = "/login/staff";
      }, 50);
    }
    // Patient không redirect, ở lại trang hiện tại
  };

  // Get default avatar based on role
  const getDefaultAvatar = (role) => {
    const avatars = {
      Patient: "https://randomuser.me/api/portraits/men/15.jpg",
      Doctor: "https://randomuser.me/api/portraits/men/25.jpg",
      "Lab-Staff": "https://randomuser.me/api/portraits/women/35.jpg",
      "Registration-staff": "https://randomuser.me/api/portraits/women/45.jpg",
      Manager: "https://randomuser.me/api/portraits/men/55.jpg",
    };
    return avatars[role] || "https://randomuser.me/api/portraits/men/15.jpg";
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!user && !!token;
  };

  // Check if user has specific role
  const hasRole = (role) => {
    return user?.role === role;
  };
  // Check if user is staff (not patient)
  const isStaff = () => {
    return user?.role && user.role !== "Patient";
  };

  // Get redirect path based on role
  const getDefaultPath = (role) => {
    const paths = {
      Patient: "/",
      Doctor: "/doctor-dashboard",
      "Lab-Staff": "/lab-staff",
      "Registration-staff": "/registration-staff",
      Manager: "/manager",
    };
    return paths[role] || "/";
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated,
    hasRole,
    isStaff,
    getDefaultPath,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export { AuthContext };
export default AuthContext;
