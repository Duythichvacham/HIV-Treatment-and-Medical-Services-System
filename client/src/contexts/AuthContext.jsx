import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  // Kiểm tra localStorage khi app khởi động
  useEffect(() => {
    const checkAuthStatus = () => {
      try {
        const savedToken = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');
        
        if (savedToken && savedUser) {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        // Clear invalid data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
      setLoading(false);
    };

    checkAuthStatus();
  }, []);

  // Login function
  const login = async (username, password, userType = 'auto') => {
    try {
      const response = await apiLogin(username, password);
      
      if (!response.token) {
        throw new Error('No token received');
      }

      // Decode token to get user info
      const tokenPayload = JSON.parse(atob(response.token.split('.')[1]));
      
      // Validate user type if specified
      if (userType === 'staff' && tokenPayload.role === 'Patient') {
        throw new Error('Tài khoản này không phải của nhân viên!');
      }
      if (userType === 'patient' && tokenPayload.role !== 'Patient') {
        throw new Error('Tài khoản này không phải của bệnh nhân!');
      }      // Create user object
      const userData = {
        id: tokenPayload.userId,
        username: tokenPayload.username,
        role: tokenPayload.role,
        name: tokenPayload.name || username,
        avatar: getDefaultAvatar(tokenPayload.role)
      };

      // Thêm doctor_id nếu user là Doctor
      if (tokenPayload.role === 'Doctor' && tokenPayload.doctor_id) {
        userData.doctor_id = tokenPayload.doctor_id;
      }

      // Store in state and localStorage
      setToken(response.token);
      setUser(userData);
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(userData));

      return { success: true, user: userData };
    } catch (error) {
      console.error('Login error:', error);
      
      if (error.response?.status === 401) {
        throw new Error('Sai tài khoản hoặc mật khẩu!');
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('Có lỗi xảy ra. Vui lòng thử lại!');
      }
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Also remove old storage keys for backward compatibility
    localStorage.removeItem('staff');
    localStorage.removeItem('patient');
  };

  // Get default avatar based on role
  const getDefaultAvatar = (role) => {
    const avatars = {
      'Patient': 'https://randomuser.me/api/portraits/men/15.jpg',
      'Doctor': 'https://randomuser.me/api/portraits/men/25.jpg',
      'Lab-Staff': 'https://randomuser.me/api/portraits/women/35.jpg',
      'Registration-staff': 'https://randomuser.me/api/portraits/women/45.jpg',
      'Manager': 'https://randomuser.me/api/portraits/men/55.jpg'
    };
    return avatars[role] || 'https://randomuser.me/api/portraits/men/15.jpg';
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
    return user?.role && user.role !== 'Patient';
  };

  // Get redirect path based on role
  const getDefaultPath = (role) => {
    const paths = {
      'Patient': '/',
      'Doctor': '/doctor-dashboard',
      'Lab-Staff': '/lab-staff',
      'Registration-staff': '/registration-staff',
      'Manager': '/manager'
    };
    return paths[role] || '/';
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
    getDefaultPath
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
