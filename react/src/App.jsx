import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import BuildingSelectPage from './pages/BuildingSelectPage'
import ParkingStatusPage from './pages/ParkingStatusPage'
import { AuthProvider, useAuth } from './hooks/useAuth'

function PrivateRoute({ children }) {
  const { token } = useAuth()
  if (!token) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<PrivateRoute><BuildingSelectPage /></PrivateRoute>} />
        <Route path="/parking/:buildingId" element={<PrivateRoute><ParkingStatusPage /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}
