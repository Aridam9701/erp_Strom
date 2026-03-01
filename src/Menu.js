import React from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from './AuthContext'

const menuItems = [
  { path: '/dashboard', label: 'Dashboard', roles: ['administrador', 'encargado_inventario', 'encargado_ti'] },
  { path: '/inventario', label: 'Inventario', roles: ['administrador', 'encargado_inventario'] },
  { path: '/activos', label: 'Activos', roles: ['administrador', 'encargado_ti'] },
  { path: '/asignaciones', label: 'Asignaciones', roles: ['administrador', 'encargado_ti'] },
  { path: '/mantenimiento', label: 'Mantenimiento', roles: ['administrador', 'encargado_ti'] },
  { path: '/usuarios', label: 'Usuarios', roles: ['administrador', 'encargado_ti'] },
]

export default function Menu() {
  const { rol } = useAuth()

  return (
    <nav className="bg-gray-800 p-4 flex space-x-6">
      {menuItems.filter(item => rol && item.roles.includes(rol))
        .map(item => (
          <NavLink 
            key={item.path} 
            to={item.path} 
            className={({isActive}) => isActive ? 'text-blue-400 font-bold border-b-2 border-blue-400' : 'text-gray-300 hover:text-white'}>
            {item.label}
          </NavLink>
      ))}
    </nav>
  )
}