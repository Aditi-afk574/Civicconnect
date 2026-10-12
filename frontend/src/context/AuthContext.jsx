import { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('lr_token');
    const savedUser = localStorage.getItem('lr_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = (authData) => {
    setToken(authData.token);
    setUser({
      id: authData.id,
      name: authData.name,
      email: authData.email,
      role: authData.role,
    });
    localStorage.setItem('lr_token', authData.token);
    localStorage.setItem('lr_user', JSON.stringify({
      id: authData.id,
      name: authData.name,
      email: authData.email,
      role: authData.role,
    }));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('lr_token');
    localStorage.removeItem('lr_user');
  };

  const isAdmin = () => user?.role === 'ADMIN';
  const isAuthenticated = () => !!token;

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, isAdmin, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
