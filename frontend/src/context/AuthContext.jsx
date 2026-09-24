import React, { createContext, useState, useEffect } from 'react';
import authService from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.log('No valid session found');
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    const data = await authService.login(credentials);
    setUser(data);
    setIsAuthenticated(true);
    return data;
  };

  const register = async (userData) => {
    const data = await authService.register(userData);
    setUser(data);
    setIsAuthenticated(true);
    return data;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUserContext = (updatedUser) => {
    setUser({ ...user, ...updatedUser });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        updateUserContext,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
