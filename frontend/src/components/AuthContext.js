import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [access, setAccess] = useState(localStorage.getItem('access') || null);
  const [refresh, setRefresh] = useState(localStorage.getItem('refresh') || null);

  const refreshToken = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/users/token/refresh/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh })
      });
      if (response.ok) {
        const data = await response.json();
        setAccess(data.access);
        localStorage.setItem('access', data.access);
        return data.access;
      } else {
        throw new Error('Token refresh failed');
      }
    } catch (error) {
      logout();
      return null;
    }
  };

  useEffect(() => {
    if (access) {
      fetch('http://localhost:8000/api/users/profile/', {
        headers: { 'Authorization': `Bearer ${access}` }
      })
        .then(async res => {
          if (res.ok) {
            return res.json();
          } else if (res.status === 401 && refresh) {
            const newAccess = await refreshToken();
            if (newAccess) {
              const retryRes = await fetch('http://localhost:8000/api/users/profile/', {
                headers: { 'Authorization': `Bearer ${newAccess}` }
              });
              if (retryRes.ok) {
                return retryRes.json();
              }
            }
          }
          return null;
        })
        .then(data => setUser(data))
        .catch(() => setUser(null));
    } else {
      setUser(null);
    }
  }, [access, refresh]);

  const login = (accessToken, refreshToken) => {
    setAccess(accessToken);
    setRefresh(refreshToken);
    localStorage.setItem('access', accessToken);
    localStorage.setItem('refresh', refreshToken);
  };

  const logout = () => {
    setAccess(null);
    setRefresh(null);
    setUser(null);
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
  };

  return (
    <AuthContext.Provider value={{ user, access, refresh, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
