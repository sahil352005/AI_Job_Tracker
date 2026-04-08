import { createContext, useContext, useState, type ReactNode } from 'react';
import { authApi } from '../api';

interface AuthContextType {
  token: string | null;
  email: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [email, setEmail] = useState<string | null>(localStorage.getItem('email'));

  const persist = (t: string, e: string) => {
    localStorage.setItem('token', t);
    localStorage.setItem('email', e);
    setToken(t);
    setEmail(e);
  };

  const login = async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    persist(res.token, res.email);
  };

  const register = async (email: string, password: string) => {
    const res = await authApi.register(email, password);
    persist(res.token, res.email);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    setToken(null);
    setEmail(null);
  };

  return (
    <AuthContext.Provider value={{ token, email, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
