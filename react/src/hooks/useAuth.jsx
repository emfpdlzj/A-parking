import React, { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)
export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(localStorage.getItem('accessToken'))
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('user')
      return raw ? JSON.parse(raw) : null
    } catch(e){ return null }
  })

  const login = (newAccessToken, userData) => {
    localStorage.setItem('accessToken', newAccessToken); 
    setAccessToken(newAccessToken);

    if (userData) {
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    } else {
        localStorage.removeItem('user');
        setUser(null);
    }
}
  const logout = () => { localStorage.removeItem('accessToken'); localStorage.removeItem('user'); setAccessToken(null); setUser(null) }

  return (
        <AuthContext.Provider value={{ accessToken, user, login, logout, isAuthenticated: !!accessToken }}>
            {children}
        </AuthContext.Provider>
    )
}
export const useAuth = () => useContext(AuthContext)
