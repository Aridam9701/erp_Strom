import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from './supabaseClient'

export default function Dashboard() {

  const navigate = useNavigate()

  const [role, setRole] = useState(null)

  const [kpis, setKpis] = useState({
    materiales: 0,
    activos: 0,
    asignados: 0,
    mantenimiento: 0,
    alertas: 0
  })

  // 🔹 Obtener usuario + rol
  useEffect(() => {
    const getUserRole = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) return navigate('/login')

      const { data } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

      setRole(data?.role)
    }

    getUserRole()
  }, [])

  // 🔹 KPIs
  useEffect(() => {
    const fetchKpis = async () => {

      const { count: materiales } = await supabase
        .from('materiales')
        .select('id', { count: 'exact', head: true })

      const { count: activos } = await supabase
        .from('activos')
        .select('id', { count: 'exact', head: true })

      const { count: asignados } = await supabase
        .from('asignaciones')
        .select('id', { count: 'exact', head: true })
        .eq('estado', 'activo')

      const { count: mantenimiento } = await supabase
        .from('mantenimientos')
        .select('id', { count: 'exact', head: true })
        .eq('estado', 'activo')

      const { count: alertas } = await supabase
        .from('materiales')
        .select('id', { count: 'exact', head: true })
        .lt('stock_actual', 'stock_minimo')

      setKpis({
        materiales: materiales || 0,
        activos: activos || 0,
        asignados: asignados || 0,
        mantenimiento: mantenimiento || 0,
        alertas: alertas || 0
      })
    }

    fetchKpis()
  }, [])

  const logout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  // 🔹 MENÚ SEGÚN ROL
  const menuItems = {
    ti: [
      { name: 'Dashboard', icon: 'dashboard', path: '/' },
      { name: 'Activos', icon: 'desktop_mac', path: '/activos' },
      { name: 'Asignaciones', icon: 'groups', path: '/asignaciones' },
      { name: 'Mantenimiento', icon: 'build', path: '/mantenimiento' },
    ],
    inventario: [
      { name: 'Dashboard', icon: 'dashboard', path: '/' },
      { name: 'Inventario', icon: 'inventory_2', path: '/inventario' },
    ]
  }

  const accessCards = {
    ti: [
      { title: 'Activos', icon: 'desktop_mac', desc: 'Gestión de equipos', path: '/activos' },
      { title: 'Asignaciones', icon: 'groups', desc: 'Equipos por usuario', path: '/asignaciones' },
      { title: 'Mantenimiento', icon: 'build', desc: 'Historial y control', path: '/mantenimiento' },
    ],
    inventario: [
      { title: 'Inventario', icon: 'inventory_2', desc: 'Gestión de materiales', path: '/inventario' },
    ]
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white">

      {/* 🔹 NAVBAR */}
      <header className="flex justify-between items-center px-8 py-4 border-b border-white/10">

        <h1 className="text-xl font-bold">ArchitectERP</h1>

        <nav className="hidden md:flex gap-8 text-gray-300">
          {menuItems[role]?.map((item, i) => (
            <span
              key={i}
              onClick={() => navigate(item.path)}
              className="hover:text-white cursor-pointer"
            >
              {item.name}
            </span>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <input
            placeholder="Buscar..."
            className="bg-white/5 px-3 py-2 rounded-lg text-sm outline-none"
          />

          <button onClick={logout} className="text-red-400">
            Salir
          </button>
        </div>

      </header>

      {/* 🔹 CONTENIDO */}
      <div className="p-8 max-w-7xl mx-auto">

        <h1 className="text-3xl font-bold mb-2">Panel Principal</h1>
        <p className="text-gray-400 mb-10">Resumen del sistema</p>

        {/* 🔹 KPIs */}
        <div className="grid md:grid-cols-5 gap-6 mb-12">

          <Card icon="inventory_2" title="Materiales" value={kpis.materiales} />
          <Card icon="desktop_mac" title="Activos" value={kpis.activos} />
          <Card icon="groups" title="Asignados" value={kpis.asignados} />
          <Card icon="build" title="Mantenimiento" value={kpis.mantenimiento} />
          <Card icon="warning" title="Alertas" value={kpis.alertas} />

        </div>

        {/* 🔹 ACCESOS */}
        <h2 className="text-lg mb-6 text-gray-300">Accesos Directos</h2>

        <div className="grid md:grid-cols-3 gap-6">

          {accessCards[role]?.map((card, i) => (
            <AccessCard
              key={i}
              {...card}
              onClick={() => navigate(card.path)}
            />
          ))}

        </div>

      </div>
    </div>
  )
}

/* 🔹 KPI */
function Card({ icon, title, value }) {
  return (
    <div className="bg-[#0f172a] border border-white/10 p-6 rounded-2xl">
      
      <div className="flex justify-between mb-4">
        <span className="material-icons text-blue-400">{icon}</span>
        <span className="text-xs text-green-400">ESTABLE</span>
      </div>

      <h2 className="text-3xl font-bold">{value}</h2>
      <p className="text-gray-400 text-sm">{title}</p>

    </div>
  )
}

/* 🔹 ACCESS */
function AccessCard({ icon, title, desc, onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-[#0f172a] border border-white/10 p-6 rounded-2xl cursor-pointer hover:scale-105 transition"
    >
      <span className="material-icons mb-3">{icon}</span>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-gray-400 text-sm mb-4">{desc}</p>

      <button className="w-full py-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-700">
        Ir a {title}
      </button>
    </div>
  )
}
