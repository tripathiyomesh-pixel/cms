import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('jcms_token');
    const saved = localStorage.getItem('jcms_user');
    if (token && saved) {
      setUser(JSON.parse(saved));
      // Validate token in background
      authAPI.me().then(r => {
        setUser(r.data.data.user);
        localStorage.setItem('jcms_user', JSON.stringify(r.data.data.user));
      }).catch(() => logout());
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    const { token, user: u } = res.data.data;
    localStorage.setItem('jcms_token', token);
    localStorage.setItem('jcms_user', JSON.stringify(u));
    setUser(u);
    return u;
  };

  const logout = () => {
    localStorage.removeItem('jcms_token');
    localStorage.removeItem('jcms_user');
    setUser(null);
  };

  const hasRole = (...roles) => roles.includes(user?.role);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
