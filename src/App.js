import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './AuthContext'
import Login from './Login'
import Menu from './Menu'
import Dashboard from './Dashboard'
import Inventario from './Inventario'
import Activos from './Activos'
import Asignaciones from './Asignaciones'
import Mantenimiento from './Mantenimiento'
import Usuarios from './Usuarios'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="text-white p-4">Cargando...</div>
  if (!user) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Menu />
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/dashboard" element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          }/>
          <Route path="/inventario" element={
            <ProtectedRoute><Inventario /></ProtectedRoute>
          }/>
          <Route path="/activos" element={
            <ProtectedRoute><Activos /></ProtectedRoute>
          }/>
          <Route path="/asignaciones" element={
            <ProtectedRoute><Asignaciones /></ProtectedRoute>
          }/>
          <Route path="/mantenimiento" element={
            <ProtectedRoute><Mantenimiento /></ProtectedRoute>
          }/>
          <Route path="/usuarios" element={
            <ProtectedRoute><Usuarios /></ProtectedRoute>
          }/>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}