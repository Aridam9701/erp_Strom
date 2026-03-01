import React, { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

export default function Asignaciones() {
  const [asignacionesActivas, setAsignacionesActivas] = useState([])
  const [historialAsignaciones, setHistorialAsignaciones] = useState([])
  const [equiposDisponibles, setEquiposDisponibles] = useState([])
  const [empleados, setEmpleados] = useState([])

  const [formAsignacion, setFormAsignacion] = useState({
    equipo_id: '',
    empleado_id: '',
    fecha_asignacion: new Date().toISOString().slice(0, 10),
  })
  const [showNuevoModal, setShowNuevoModal] = useState(false)

  // Obtener asignaciones activas con joins para mostrar campos correctamente
  const fetchAsignacionesActivas = async () => {
    const { data, error } = await supabase
      .from('asignaciones')
      .select(`
        *,
        activos:activos(codigo, tipo, modelo),
        usuarios:usuarios(nombre)
      `)
      .eq('estado', 'activo')
      .order('fecha_asignacion', { ascending: false })

    if (error) {
      console.error('Error cargando asignaciones activas:', error)
      setAsignacionesActivas([])
    } else {
      setAsignacionesActivas(data || [])
    }
  }

  // Obtener historial completo con joins
  const fetchHistorialAsignaciones = async () => {
    const { data, error } = await supabase
      .from('asignaciones')
      .select(`
        *,
        activos:activos(codigo, tipo, modelo),
        usuarios:usuarios(nombre)
      `)
      .order('fecha_asignacion', { ascending: false })

    if (error) {
      console.error('Error cargando historial de asignaciones:', error)
      setHistorialAsignaciones([])
    } else {
      setHistorialAsignaciones(data || [])
    }
  }

  // Cargar equipos disponibles y empleados para select en formulario
  const fetchEquiposYEmpleados = async () => {
    const { data: equiposData, error: errorEquipos } = await supabase
      .from('activos')
      .select('id, codigo, tipo, marca, modelo, serie')
      .neq('estado', 'asignado')
    if (errorEquipos) console.error(errorEquipos)
    else setEquiposDisponibles(equiposData || [])

    const { data: empleadosData, error: errorEmpleados } = await supabase
      .from('usuarios')
      .select('id, nombre')
    if (errorEmpleados) console.error(errorEmpleados)
    else setEmpleados(empleadosData || [])
  }

  useEffect(() => {
    fetchAsignacionesActivas()
    fetchHistorialAsignaciones()
  }, [])

  useEffect(() => {
    if (showNuevoModal) {
      fetchEquiposYEmpleados()
    }
  }, [showNuevoModal])

  // Manejar cambios en formulario
  const handleFormChange = e => {
    const { name, value } = e.target
    setFormAsignacion(prev => ({ ...prev, [name]: value }))
  }

  // Guardar nueva asignación
  const handleSubmit = async e => {
    e.preventDefault()
    const { equipo_id, empleado_id, fecha_asignacion } = formAsignacion
    if (!equipo_id || !empleado_id || !fecha_asignacion) {
      alert('Por favor llena todos los campos del formulario.')
      return
    }

    const { error } = await supabase.from('asignaciones').insert([
      { equipo_id, empleado_id, fecha_asignacion, estado: 'activo', responsable: '' }
    ])

    if (error) {
      alert('Error al crear asignación: ' + error.message)
    } else {
      alert('Asignación creada con éxito.')
      setShowNuevoModal(false)
      setFormAsignacion({
        equipo_id: '',
        empleado_id: '',
        fecha_asignacion: new Date().toISOString().slice(0, 10),
      })
      fetchAsignacionesActivas()
      fetchHistorialAsignaciones()
    }
  }

  return (
    <div className="bg-gray-900 min-h-screen p-8 text-white font-mono space-y-10">
      <h1 className="text-3xl font-bold">Asignaciones de Equipos</h1>

      <button
        onClick={() => setShowNuevoModal(true)}
        className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700 mb-4"
      >
        + Crear Nueva Asignación
      </button>

      {/* Asignaciones Activas */}
      <section className="bg-gray-800 p-6 rounded space-y-4">
        <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
          <span>🔗</span>
          <span>Asignaciones Activas</span>
        </h2>

        <div className="overflow-x-auto max-h-[300px] scrollbar-thin scrollbar-thumb-gray-600">
          <table className="min-w-full border-collapse border border-gray-700 text-sm">
            <thead className="bg-gray-700 sticky top-0">
              <tr>
                <th className="border border-gray-600 px-3 py-1">Código</th>
                <th className="border border-gray-600 px-3 py-1">Activo</th>
                <th className="border border-gray-600 px-3 py-1">Equipo</th>
                <th className="border border-gray-600 px-3 py-1">Empleado</th>
                <th className="border border-gray-600 px-3 py-1">Fecha Asignación</th>
                <th className="border border-gray-600 px-3 py-1">Responsable</th>
                <th className="border border-gray-600 px-3 py-1">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {asignacionesActivas.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-3 text-gray-400">No hay asignaciones activas.</td>
                </tr>
              ) : asignacionesActivas.map(a => (
                <tr key={a.id} className="border border-gray-600 odd:bg-gray-800 even:bg-gray-700">
                  <td className="border px-2 py-1">{a.activos?.codigo || '-'}</td>
                  <td className="border px-2 py-1">{a.activos?.tipo || '-'}</td>
                  <td className="border px-2 py-1">{a.activos?.modelo || '-'}</td>
                  <td className="border px-2 py-1">{a.usuarios?.nombre || '-'}</td>
                  <td className="border px-2 py-1">{new Date(a.fecha_asignacion).toLocaleDateString()}</td>
                  <td className="border px-2 py-1">{a.responsable || '-'}</td>
                  <td className="border px-2 py-1 space-x-2 text-center">
                    <button title="Reasignar" className="text-yellow-400 hover:text-yellow-600">↔️</button>
                    <button title="Devolver" className="text-red-500 hover:text-red-700">↩️</button>
                    <button title="Ver" className="text-blue-400 hover:text-blue-600">👁️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Historial Completo */}
      <section className="bg-gray-800 p-6 rounded space-y-4">
        <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
          <span>⏲️</span>
          <span>Historial Completo de Asignaciones</span>
        </h2>

        <div className="overflow-x-auto max-h-[300px] scrollbar-thin scrollbar-thumb-gray-600">
          <table className="min-w-full border-collapse border border-gray-700 text-sm">
            <thead className="bg-gray-700 sticky top-0">
              <tr>
                <th className="border border-gray-600 px-3 py-1">Código</th>
                <th className="border border-gray-600 px-3 py-1">Activo</th>
                <th className="border border-gray-600 px-3 py-1">Equipo</th>
                <th className="border border-gray-600 px-3 py-1">Empleado</th>
                <th className="border border-gray-600 px-3 py-1">Fecha Asignación</th>
                <th className="border border-gray-600 px-3 py-1">Fecha Devolución</th>
                <th className="border border-gray-600 px-3 py-1">Estado</th>
                <th className="border border-gray-600 px-3 py-1">Responsable</th>
              </tr>
            </thead>
            <tbody>
              {historialAsignaciones.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-3 text-gray-400">No hay historial.</td>
                </tr>
              ) : historialAsignaciones.map(a => (
                <tr key={a.id} className="border border-gray-600 odd:bg-gray-800 even:bg-gray-700">
                  <td className="border px-2 py-1">{a.activos?.codigo || '-'}</td>
                  <td className="border px-2 py-1">{a.activos?.tipo || '-'}</td>
                  <td className="border px-2 py-1">{a.activos?.modelo || '-'}</td>
                  <td className="border px-2 py-1">{a.usuarios?.nombre || '-'}</td>
                  <td className="border px-2 py-1">{new Date(a.fecha_asignacion).toLocaleDateString()}</td>
                  <td className="border px-2 py-1">{a.fecha_devolucion ? new Date(a.fecha_devolucion).toLocaleDateString() : '-'}</td>
                  <td className="border px-2 py-1">{a.estado || '-'}</td>
                  <td className="border px-2 py-1">{a.responsable || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Modal Crear Nueva Asignación */}
      {showNuevoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg w-full max-w-md p-6 relative text-white">
            <button
              onClick={() => setShowNuevoModal(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-white font-bold text-xl"
              aria-label="Cerrar formulario"
            >
              &times;
            </button>

            <h2 className="text-xl font-semibold mb-6">Crear Nueva Asignación</h2>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block mb-1">Equipo disponible</label>
                <select
                  name="equipo_id"
                  value={formAsignacion.equipo_id}
                  onChange={handleFormChange}
                  className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white"
                  required
                >
                  <option value="">Seleccionar equipo...</option>
                  {equiposDisponibles.map(eq => (
                    <option key={eq.id} value={eq.id}>
                      {eq.marca} {eq.modelo} - {eq.serie}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block mb-1">Empleado destino</label>
                <select
                  name="empleado_id"
                  value={formAsignacion.empleado_id}
                  onChange={handleFormChange}
                  className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white"
                  required
                >
                  <option value="">Seleccionar empleado...</option>
                  {empleados.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-6">
                <label className="block mb-1">Fecha de asignación</label>
                <input
                  type="date"
                  name="fecha_asignacion"
                  value={formAsignacion.fecha_asignacion}
                  onChange={handleFormChange}
                  className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white"
                  required
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button type="button" onClick={() => setShowNuevoModal(false)} className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700">Guardar Asignación</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}