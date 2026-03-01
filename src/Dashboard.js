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

  const [showMantenimientoModal, setShowMantenimientoModal] = useState(false)
  const [equipos, setEquipos] = useState([])

  const [mantenimientoData, setMantenimientoData] = useState({
    equipo_id: '',
    tipo_mantenimiento: '',
    fecha: new Date().toISOString().slice(0,10),
    tecnico: '',
    descripcion: '',
    costo: 0.0,
  })

  const tiposMantenimiento = [
    { value: '', label: 'Seleccionar tipo...' },
    { value: 'preventivo', label: 'Preventivo' },
    { value: 'correctivo', label: 'Correctivo' },
  ]

  // Estado para mostrar / ocultar menú perfil
  const [openPerfilMenu, setOpenPerfilMenu] = useState(false)
  const perfilRef = useRef(null)

  useEffect(() => {
    // Cargar indicadores
    const fetchIndicadores = async () => {
      // Tu lógica para cargar conteos / indicadores
      // Ejemplo simple (reemplaza con tus consultas reales):
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

  useEffect(() => {
    if (showMantenimientoModal) {
      const fetchEquipos = async () => {
        const { data, error } = await supabase.from('activos').select('id, marca, modelo, serie')
        if (error) console.error('Error cargando equipos:', error)
        else setEquipos(data || [])
      }
      fetchEquipos()
    }
  }, [showMantenimientoModal])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setMantenimientoData(prev => ({
      ...prev,
      [name]: name === 'costo' ? parseFloat(value) || 0 : value,
    }))
  }

  const handleSubmitMantenimiento = async (e) => {
    e.preventDefault()
    const { equipo_id, tipo_mantenimiento, fecha, tecnico } = mantenimientoData
    if (!equipo_id || !tipo_mantenimiento || !fecha || !tecnico) {
      alert('Por favor completa todos los campos obligatorios')
      return
    }
    const { error } = await supabase.from('mantenimientos').insert([mantenimientoData])
    if (error) {
      alert('Error al registrar mantenimiento: ' + error.message)
    } else {
      alert('Mantenimiento registrado exitosamente')
      setShowMantenimientoModal(false)
      setMantenimientoData({
        equipo_id: '',
        tipo_mantenimiento: '',
        fecha: new Date().toISOString().slice(0,10),
        tecnico: '',
        descripcion: '',
        costo: 0.0,
      })
    }
  }

  // Cerrar menú clic fuera
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
    <div className="bg-gray-900 min-h-screen p-8 text-white font-mono relative">
      {/* Header con título y perfil */}
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Panel Principal</h1>
          <p className="text-gray-400">Resumen operativo del sistema — CoreERP</p>
        </div>

        {/* Perfil usuario */}
        <div ref={perfilRef} className="relative">
          <img
            src="https://cdn-icons-png.flaticon.com/512/149/149071.png"
            alt="Perfil"
            className="w-10 h-10 rounded-full cursor-pointer border-2 border-blue-600"
            onClick={() => setOpenPerfilMenu(prev => !prev)}
          />

          {openPerfilMenu && (
            <div className="absolute right-0 mt-2 bg-gray-800 rounded shadow-lg w-40 z-50">
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 hover:bg-red-600 rounded text-red-400"
              >
                Cerrar Sesión
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Indicadores */}
      <section className="grid grid-cols-5 gap-4 mb-8">
        <div className="bg-gray-800 p-4 rounded flex items-center space-x-2">
          <span className="material-icons text-blue-500">inventory_2</span>
          <div>
            <h3 className="text-gray-400">Materiales en Stock</h3>
            <p className="text-3xl font-bold text-blue-500">{materialesStock}</p>
            <p className="text-gray-400 text-sm">Materiales activos registrados</p>
          </div>
        </div>

        <div className="bg-gray-800 p-4 rounded flex items-center space-x-2">
          <span className="material-icons text-blue-400">desktop_mac</span>
          <div>
            <h3 className="text-gray-400">Activos Registrados</h3>
            <p className="text-3xl font-bold text-blue-400">{activosRegistrados}</p>
            <p className="text-gray-400 text-sm">Equipos de cómputo totales</p>
          </div>
        </div>

        <div className="bg-gray-800 p-4 rounded flex items-center space-x-2">
          <span className="material-icons text-green-400">verified_user</span>
          <div>
            <h3 className="text-gray-400">Equipos Asignados</h3>
            <p className="text-3xl font-bold text-green-400">{equiposAsignados}</p>
            <p className="text-gray-400 text-sm">Activos con empleado asignado</p>
          </div>
        </div>

        <div className="bg-gray-800 p-4 rounded flex items-center space-x-2">
          <span className="material-icons text-yellow-500">build</span>
          <div>
            <h3 className="text-gray-400">En Mantenimiento</h3>
            <p className="text-3xl font-bold text-yellow-500">{enMantenimiento}</p>
            <p className="text-gray-400 text-sm">Equipos fuera de servicio</p>
          </div>
        </div>

        <div className="bg-gray-800 p-4 rounded flex items-center space-x-2">
          <span className="material-icons text-red-500">warning</span>
          <div>
            <h3 className="text-gray-400">Alertas de Stock</h3>
            <p className="text-3xl font-bold text-red-500">{alertasStock}</p>
            <p className="text-gray-400 text-sm">Materiales bajo stock mínimo</p>
          </div>
        </div>
      </section>

      {/* Accesos rápidos */}
      <section className="grid grid-cols-4 gap-4">
        <div className="bg-gray-800 p-6 rounded space-y-3 cursor-pointer" onClick={() => navigate('/inventario')}>
          <div className="flex items-center space-x-2">
            <span className="material-icons text-blue-500">inventory_2</span>
            <div>
              <h4 className="text-white font-semibold">Inventario</h4>
              <p className="text-gray-400 text-sm">Materiales y proveedores</p>
            </div>
          </div>
          <button className="bg-blue-600 px-4 py-1 rounded mt-3 w-full hover:bg-blue-700">
            Ir a Inventario
          </button>
        </div>

        <div className="bg-gray-800 p-6 rounded space-y-3 cursor-pointer" onClick={() => navigate('/activos')}>
          <div className="flex items-center space-x-2">
            <span className="material-icons text-blue-400">desktop_mac</span>
            <div>
              <h4 className="text-white font-semibold">Activos</h4>
              <p className="text-gray-400 text-sm">Equipos de cómputo</p>
            </div>
          </div>
          <button className="bg-blue-600 px-4 py-1 rounded mt-3 w-full hover:bg-blue-700">
            Ir a Activos
          </button>
        </div>

        <div className="bg-gray-800 p-6 rounded space-y-3 opacity-50 cursor-not-allowed">
          <div className="flex items-center space-x-2">
            <span className="material-icons text-green-400">verified_user</span>
            <div>
              <h4 className="text-white font-semibold">Asignaciones</h4>
              <p className="text-gray-400 text-sm">Equipos por empleado</p>
            </div>
          </div>
          <button disabled className="bg-gray-600 px-4 py-1 rounded mt-3 w-full">
            Ir a Asignaciones
          </button>
        </div>

        <div className="bg-gray-800 p-6 rounded space-y-3 opacity-50 cursor-not-allowed">
          <div className="flex items-center space-x-2">
            <span className="material-icons text-yellow-500">build</span>
            <div>
              <h4 className="text-white font-semibold">Mantenimiento</h4>
              <p className="text-gray-400 text-sm">Historial de mantenimientos</p>
            </div>
          </div>
          <button disabled className="bg-gray-600 px-4 py-1 rounded mt-3 w-full">
            Ir a Mantenimiento
          </button>
        </div>
      </section>

      {/* Modal registrar mantenimiento */}
      {showMantenimientoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-md w-full p-6 relative text-white font-mono">
            <button
              onClick={() => setShowMantenimientoModal(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-white text-xl font-bold"
              aria-label="Cerrar"
            >
              &times;
            </button>

            <h2 className="text-lg font-bold mb-6">Registrar Mantenimiento</h2>

            <form onSubmit={handleSubmitMantenimiento} className="space-y-4">
              <div>
                <label className="block mb-1">Equipo</label>
                <select
                  name="equipo_id"
                  value={mantenimientoData.equipo_id}
                  onChange={handleInputChange}
                  className="bg-gray-700 border border-gray-600 rounded p-2 w-full"
                  required
                >
                  <option value="">Seleccionar equipo...</option>
                  {equipos.map(eq => (
                    <option key={eq.id} value={eq.id}>{`${eq.marca} ${eq.modelo} - ${eq.serie}`}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-1">Tipo de Mantenimiento</label>
                <select
                  name="tipo_mantenimiento"
                  value={mantenimientoData.tipo_mantenimiento}
                  onChange={handleInputChange}
                  className="bg-gray-700 border border-gray-600 rounded p-2 w-full"
                  required
                >
                  {tiposMantenimiento.map(tipo => (
                    <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-1">Fecha de Mantenimiento</label>
                <input
                  type="date"
                  name="fecha"
                  value={mantenimientoData.fecha}
                  onChange={handleInputChange}
                  className="bg-gray-700 border border-gray-600 rounded p-2 w-full"
                  required
                />
              </div>

              <div>
                <label className="block mb-1">Técnico Responsable</label>
                <input
                  type="text"
                  name="tecnico"
                  placeholder="Nombre del técnico"
                  value={mantenimientoData.tecnico}
                  onChange={handleInputChange}
                  className="bg-gray-700 border border-gray-600 rounded p-2 w-full"
                  required
                />
              </div>

              <div>
                <label className="block mb-1">Descripción del Trabajo Realizado</label>
                <textarea
                  name="descripcion"
                  value={mantenimientoData.descripcion}
                  onChange={handleInputChange}
                  placeholder="Detalla el trabajo realizado durante el mantenimiento..."
                  className="bg-gray-700 border border-gray-600 rounded p-2 w-full resize-none"
                  rows={4}
                />
              </div>

              <div>
                <label className="block mb-1">Costo (MXN)</label>
                <input
                  type="number"
                  name="costo"
                  min="0"
                  step="0.01"
                  value={mantenimientoData.costo}
                  onChange={handleInputChange}
                  className="bg-gray-700 border border-gray-600 rounded p-2 w-full"
                />
              </div>

              <div className="flex justify-end space-x-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowMantenimientoModal(false)}
                  className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
                >
                  Registrar Mantenimiento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}