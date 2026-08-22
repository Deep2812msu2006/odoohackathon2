import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/authApi.js';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await authApi.getMe();
        if (res && res.success && res.data.user) {
          setUser(res.data.user);
        }
      } catch (err) {
        setUser(null);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const signup = async (data) => {
    try {
      const res = await authApi.signup(data);
      if (res.success) {
        localStorage.setItem('token', res.data.token);
        setUser(res.data.user);
        toast.success('Welcome to GlobeTrotter! Account created.');
        return res.data.user;
      }
    } catch (err) {
      toast.error(err.message || 'Signup failed.');
      throw err;
    }
  };

  const login = async (credentials) => {
    try {
      const res = await authApi.login(credentials);
      if (res.success) {
        localStorage.setItem('token', res.data.token);
        setUser(res.data.user);
        toast.success(`Welcome back, ${res.data.user.name}!`);
        return res.data.user;
      }
    } catch (err) {
      toast.error(err.message || 'Invalid credentials.');
      throw err;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      // Ignore logout backend errors
    } finally {
      localStorage.removeItem('token');
      setUser(null);
      toast.success('Logged out successfully.');
    }
  };

  const updateUserProfile = (updatedUser) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, updateUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
