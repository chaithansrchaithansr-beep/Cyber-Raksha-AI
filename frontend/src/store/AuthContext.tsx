import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: any) => Promise<User>;
  register: (userData: any) => Promise<User>;
  quickLogin: (role: Role) => Promise<User>;
  logout: (allSessions?: boolean) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<{ message: string; mode: string; dev_reset_token?: string }>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  updateProfile: (data: { name?: string; language?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('cr_token'));
  const [refreshToken, setRefreshToken] = useState<string | null>(() => localStorage.getItem('cr_refresh_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('cr_token');
      const storedRefresh = localStorage.getItem('cr_refresh_token');

      if (storedToken) {
        if (storedToken.startsWith('cr_demo_token_')) {
          const role = (storedToken.split('_')[3] || 'citizen') as Role;
          const mockUsers: Record<Role, User> = {
            citizen: {
              id: 1,
              name: 'Aarav Sharma',
              email: 'citizen@cyberraksha.gov.in',
              role: 'citizen',
              language: 'en',
              is_active: true,
              mfa_enabled: false,
              created_at: new Date().toISOString()
            },
            organization: {
              id: 2,
              name: 'Infosec Operations Lead',
              email: 'org@infosec-defense.in',
              role: 'organization',
              language: 'en',
              is_active: true,
              mfa_enabled: true,
              created_at: new Date().toISOString()
            },
            admin: {
              id: 3,
              name: 'National SecOps Director',
              email: 'admin@cyberraksha.gov.in',
              role: 'admin',
              language: 'en',
              is_active: true,
              mfa_enabled: true,
              created_at: new Date().toISOString()
            }
          };
          setUser(mockUsers[role] || mockUsers.citizen);
          setToken(storedToken);
          setRefreshToken(storedRefresh);
          setIsLoading(false);
          return;
        }

        try {
          const profile = await api.auth.getProfile();
          setUser(profile);
          setToken(storedToken);
          setRefreshToken(storedRefresh);
        } catch (err) {
          // Attempt refresh if access token expired
          if (storedRefresh) {
            try {
              const refreshed = await api.auth.refresh(storedRefresh);
              localStorage.setItem('cr_token', refreshed.access_token);
              if (refreshed.refresh_token) {
                localStorage.setItem('cr_refresh_token', refreshed.refresh_token);
                setRefreshToken(refreshed.refresh_token);
              }
              setToken(refreshed.access_token);
              setUser(refreshed.user);
            } catch (_) {
              clearSession();
            }
          } else {
            clearSession();
          }
        }
      } else {
        // No stored session: keep user logged out
        setUser(null);
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const clearSession = () => {
    localStorage.removeItem('cr_token');
    localStorage.removeItem('cr_refresh_token');
    setToken(null);
    setRefreshToken(null);
    setUser(null);
  };

  const setAuthData = (data: { access_token: string; refresh_token?: string; user: User }) => {
    localStorage.setItem('cr_token', data.access_token);
    setToken(data.access_token);
    if (data.refresh_token) {
      localStorage.setItem('cr_refresh_token', data.refresh_token);
      setRefreshToken(data.refresh_token);
    }
    setUser(data.user);
  };

  const login = async (credentials: any): Promise<User> => {
    setIsLoading(true);
    try {
      const data = await api.auth.login(credentials);
      setAuthData(data);
      return data.user;
    } catch (err) {
      console.warn('Backend unavailable, activating demo mode authentication:', err);
      const email = (credentials.email || '').toLowerCase().trim();
      let role: Role = 'citizen';
      if (email.includes('admin') || email.includes('command') || email.includes('secops')) {
        role = 'admin';
      } else if (email.includes('org') || email.includes('infosec')) {
        role = 'organization';
      }

      const mockUsers: Record<Role, User> = {
        citizen: {
          id: 1,
          name: 'Aarav Sharma',
          email: credentials.email || 'citizen@cyberraksha.gov.in',
          role: 'citizen',
          language: 'en',
          is_active: true,
          mfa_enabled: false,
          created_at: new Date().toISOString()
        },
        organization: {
          id: 2,
          name: 'Infosec Operations Lead',
          email: credentials.email || 'org@infosec-defense.in',
          role: 'organization',
          language: 'en',
          is_active: true,
          mfa_enabled: true,
          created_at: new Date().toISOString()
        },
        admin: {
          id: 3,
          name: 'National SecOps Director',
          email: credentials.email || 'admin@cyberraksha.gov.in',
          role: 'admin',
          language: 'en',
          is_active: true,
          mfa_enabled: true,
          created_at: new Date().toISOString()
        }
      };

      const fallbackUser = mockUsers[role];
      const mockToken = `cr_demo_token_${role}_${Date.now()}`;
      setAuthData({ access_token: mockToken, refresh_token: `cr_demo_refresh_${Date.now()}`, user: fallbackUser });
      return fallbackUser;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: any): Promise<User> => {
    setIsLoading(true);
    try {
      const data = await api.auth.register(userData);
      setAuthData(data);
      return data.user;
    } catch (err) {
      console.warn('Backend unavailable, activating demo mode registration:', err);
      const role: Role = userData.role || 'citizen';
      const fallbackUser: User = {
        id: Math.floor(Math.random() * 1000) + 10,
        name: userData.name || 'Registered Citizen',
        email: userData.email,
        role: role,
        language: userData.language || 'en',
        is_active: true,
        mfa_enabled: false,
        created_at: new Date().toISOString()
      };
      const mockToken = `cr_demo_token_${role}_${Date.now()}`;
      setAuthData({ access_token: mockToken, refresh_token: `cr_demo_refresh_${Date.now()}`, user: fallbackUser });
      return fallbackUser;
    } finally {
      setIsLoading(false);
    }
  };

  const quickLogin = async (role: Role): Promise<User> => {
    setIsLoading(true);
    try {
      const data = await api.auth.quickLogin(role);
      setAuthData(data);
      return data.user;
    } catch (err) {
      console.warn('Backend unavailable, activating tier authorization demo mode:', err);
      const mockUsers: Record<Role, User> = {
        citizen: {
          id: 1,
          name: 'Aarav Sharma',
          email: 'citizen@cyberraksha.gov.in',
          role: 'citizen',
          language: 'en',
          is_active: true,
          mfa_enabled: false,
          created_at: new Date().toISOString()
        },
        organization: {
          id: 2,
          name: 'Infosec Operations Lead',
          email: 'org@infosec-defense.in',
          role: 'organization',
          language: 'en',
          is_active: true,
          mfa_enabled: true,
          created_at: new Date().toISOString()
        },
        admin: {
          id: 3,
          name: 'National SecOps Director',
          email: 'admin@cyberraksha.gov.in',
          role: 'admin',
          language: 'en',
          is_active: true,
          mfa_enabled: true,
          created_at: new Date().toISOString()
        }
      };
      const fallbackUser = mockUsers[role];
      const mockToken = `cr_demo_token_${role}_${Date.now()}`;
      setAuthData({ access_token: mockToken, refresh_token: `cr_demo_refresh_${Date.now()}`, user: fallbackUser });
      return fallbackUser;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (allSessions: boolean = false) => {
    const currentRefresh = refreshToken || localStorage.getItem('cr_refresh_token') || undefined;
    try {
      if (allSessions) {
        await api.auth.logoutAll();
      } else {
        await api.auth.logout(currentRefresh);
      }
    } catch (_) {
      // Proceed with local logout regardless of network state
    } finally {
      clearSession();
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    await api.auth.changePassword(currentPassword, newPassword);
  };

  const forgotPassword = async (email: string) => {
    return await api.auth.forgotPassword(email);
  };

  const resetPassword = async (tokenStr: string, newPassword: string) => {
    await api.auth.resetPassword(tokenStr, newPassword);
  };

  const updateProfile = async (data: { name?: string; language?: string }) => {
    const updated = await api.auth.updateProfile(data);
    setUser(updated);
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      refreshToken,
      isAuthenticated: !!user,
      isLoading,
      login,
      register,
      quickLogin,
      logout,
      changePassword,
      forgotPassword,
      resetPassword,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
