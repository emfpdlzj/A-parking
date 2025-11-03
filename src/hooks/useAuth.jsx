import React, { createContext, useContext, useState } from 'react'

const AuthContext = createContext()
export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('user')
      return raw ? JSON.parse(raw) : null
    } catch(e){ return null }
  })

  const login = (t, u) => { 
    localStorage.setItem('token', t); setToken(t)
    if(u){ localStorage.setItem('user', JSON.stringify(u)); setUser(u) }
  }
  const logout = () => { localStorage.removeItem('token'); localStorage.removeItem('user'); setToken(null); setUser(null) }

  return <AuthContext.Provider value={{ token, user, login, logout }}>{children}</AuthContext.Provider>
}
export const useAuth = () => useContext(AuthContext)
