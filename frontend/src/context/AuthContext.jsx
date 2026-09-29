import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import * as authApi from '../api/authApi.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    try {
      const data = await authApi.getProfile();
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  const login = useCallback(async (credentials) => {
    const data = await authApi.login(credentials);

    if (data.twoFactorRequired) {
      return { twoFactorRequired: true };
    }

    await refreshProfile();
    return { twoFactorRequired: false };
  }, [refreshProfile]);

  const verifyLogin2fa = useCallback(async (code) => {
    await authApi.verifyLogin2fa({ code });
    await refreshProfile();
  }, [refreshProfile]);

  const register = useCallback((credentials) => authApi.register(credentials), []);

  const logout = useCallback(async () => {
    await authApi.logout();
    setUser(null);
  }, []);

  const value = {
    user,
    isAuthenticated: Boolean(user),
    isLoading,
    login,
    register,
    logout,
    verifyLogin2fa,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Ce fichier exporte volontairement le Provider et son hook associé.
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }

  return context;
}
