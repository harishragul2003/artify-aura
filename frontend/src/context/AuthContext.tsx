import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '../services/api';
import type { User, LoginCredentials, RegisterData } from '../types/user';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateUser: (updated: Partial<User>) => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      const { data } = await authAPI.login(credentials);
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Show success message
      toast.success('✅ Login successful! Welcome back!', {
        duration: 2000,
        style: {
          background: '#10b981',
          color: '#fff',
          fontWeight: 'bold',
          padding: '16px',
        },
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || '❌ Login failed. Please try again.', {
        duration: 3000,
      });
      throw error;
    }
  };

  const register = async (registerData: RegisterData) => {
    try {
      const { data } = await authAPI.register(registerData);
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Show success message
      toast.success('🎉 Registration successful! Welcome to Artify Aura!', {
        duration: 2000,
        style: {
          background: '#10b981',
          color: '#fff',
          fontWeight: 'bold',
          padding: '16px',
        },
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || '❌ Registration failed. Please try again.', {
        duration: 3000,
      });
      throw error;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    toast.success('👋 Logged out successfully! See you soon!', {
      duration: 2000,
      style: { background: '#3b82f6', color: '#fff', fontWeight: 'bold', padding: '16px' },
    });
  };

  const updateUser = (updated: Partial<User>) => {
    const newUser = { ...user, ...updated } as User;
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        register,
        logout,
        updateUser,
        isAuthenticated: !!token,
        isAdmin: user?.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
