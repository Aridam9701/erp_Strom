import React, { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from './supabaseClient'

export default function Mantenimiento() {
  const navigate = useNavigate()

  const [materialesStock, setMaterialesStock] = useState(0)
  const [activosRegistrados, setActivosRegistrados] = useState(0)
  const [equiposAsignados, setEquiposAsignados] = useState(0)
  const [enMantenimiento, setEnMantenimiento] = useState(0)
  const [alertasStock, setAlertasStock] = useState(0)

  const [openPerfilMenu, setOpenPerfilMenu] = useState(false)
  const perfilRef = useRef(null)

  // 🔹 KPIs
  useEffect(() => {
    const fetchIndicadores = async () => {

      const { count: countMatBajo } = await supabase
        .from('materiales')
        .select('id', { count: 'exact', head: true })
        .lt('stock_actual', 'stock_minimo')

      setAlertasStock(countMatBajo || 0)

      const { count: countMatTotal } = await supabase
        .from('materiales')
        .select('id', { count: 'exact', head: true})

      setMaterialesStock(countMatTotal || 0)

      const { count: countActivos } = await supabase
        .from('activos')
        .select('id', { count: 'exact', head: true })

      setActivosRegistrados(countActivos || 0)

      const { count: countAsignados } = await supabase
        .from('asignaciones')
        .select('id', { count: 'exact', head: true })
        .eq('estado', 'activo')

      setEquiposAsignados(countAsignados || 0)

      const { count: countMant } = await supabase
        .from('mantenimientos')
        .select('id', { count: 'exact', head: true })
        .eq('estado', 'activo')

      setEnMantenimiento(countMant || 0)
    }

    fetchIndicadores()
  }, [])

  // 🔹 Cerrar menú perfil
  useEffect(() => {
    function handleClickOutside(event) {
      if (perfilRef.current && !perfilRef.current.contains(event.target)) {
        setOpenPerfilMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#0b1120] via-[#0f172a] to-[#020617] text-white">

      {/* 🔹 SIDEBAR */}
      <aside className="w-64 bg-[#020617] border-r border-white/10 p-6 hidden md:flex flex-col">
        <h2 className="text-xl font-bold mb-10">CoreERP</h2>

        <nav className="space-y-4 text-gray-300">

          <button className="flex items-center gap-3 text-blue-400">
            <span className="material-icons">dashboard</span>
            Dashboard
          </button>

          <button onClick={() => navigate('/inventario')} className="flex items-center gap-3 hover:text-white">
            <span className="material-icons">inventory_2</span>
            Inventario
          </button>

          <button onClick={() => navigate('/activos')} className="flex items-center gap-3 hover:text-white">
            <span className="material-icons">desktop_mac</span>
            Activos
          </button>

          <button className="flex items-center gap-3 opacity-50">
            <span className="material-icons">build</span>
            Mantenimiento
          </button>

        </nav>
      </aside>

      {/* 🔹 MAIN */}
      <div className="flex-1 p-8">

        {/* HEADER */}
        <header className="flex justify-between items-center mb-10">

          <div>
            <h1 className="text-3xl font-bold">Panel Principal</h1>
            <p className="text-gray-400">Resumen operativo del sistema — CoreERP</p>
          </div>

          <div ref={perfilRef} className="relative">
            <img
              src="https://cdn-icons-png.flaticon.com/512/149/149071.png"
              alt="Perfil"
              className="w-10 h-10 rounded-full cursor-pointer border-2 border-blue-500"
              onClick={() => setOpenPerfilMenu(prev => !prev)}
            />

            {openPerfilMenu && (
              <div className="absolute right-0 mt-2 bg-[#111827] border border-gray-700 rounded-lg shadow-lg w-40">
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 hover:bg-red-600 text-red-400"
                >
                  Cerrar Sesión
                </button>
              </div>
            )}
          </div>

        </header>

        {/* KPIs */}
        <section className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-12">

          <Card icon="inventory_2" color="blue" title="Materiales" value={materialesStock} />
          <Card icon="desktop_mac" color="cyan" title="Activos" value={activosRegistrados} />
          <Card icon="verified_user" color="green" title="Asignados" value={equiposAsignados} />
          <Card icon="build" color="yellow" title="Mantenimiento" value={enMantenimiento} />
          <Card icon="warning" color="red" title="Alertas" value={alertasStock} />

        </section>

        {/* ACCESOS */}
        <section>
          <h2 className="text-lg mb-6 text-gray-300">Accesos Directos</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

            <AccessCard
              icon="inventory_2"
              title="Inventario"
              desc="Gestión de materiales"
              onClick={() => navigate('/inventario')}
            />

            <AccessCard
              icon="desktop_mac"
              title="Activos"
              desc="Equipos y activos"
              onClick={() => navigate('/activos')}
            />

            <AccessCard
              icon="verified_user"
              title="Asignaciones"
              desc="Equipos por usuario"
              disabled
            />

            <AccessCard
              icon="build"
              title="Mantenimiento"
              desc="Historial de mantenimiento"
              disabled
            />

          </div>
        </section>

      </div>
    </div>
  )
}

/* 🔹 COMPONENTE KPI */
function Card({ icon, color, title, value }) {
  return (
    <div className="bg-white/5 backdrop-blur-lg border border-white/10 p-5 rounded-xl shadow flex items-center gap-4">
      <div className={`bg-${color}-500/20 p-3 rounded-lg`}>
        <span className={`material-icons text-${color}-400`}>{icon}</span>
      </div>
      <div>
        <p className="text-gray-400 text-sm">{title}</p>
        <h2 className={`text-2xl font-bold text-${color}-400`}>{value}</h2>
      </div>
    </div>
  )
}

/* 🔹 COMPONENTE ACCESO */
function AccessCard({ icon, title, desc, onClick, disabled }) {
  return (
    <div
      onClick={!disabled ? onClick : undefined}
      className={`bg-white/5 border border-white/10 p-6 rounded-xl shadow transition ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02] cursor-pointer'
      }`}
    >
      <span className="material-icons mb-3">{icon}</span>
      <h4 className="font-semibold">{title}</h4>
      <p className="text-gray-400 text-sm mb-4">{desc}</p>

      <button
        disabled={disabled}
        className="w-full py-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-700"
      >
        {disabled ? 'Próximamente' : `Ir a ${title}`}
      </button>
    </div>
  )
}
