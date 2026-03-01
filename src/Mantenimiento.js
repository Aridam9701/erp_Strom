import React, { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

export default function Mantenimiento() {
  const [mantenimientos, setMantenimientos] = useState([])
  const [resumen, setResumen] = useState({
    totalPeriodo: 0,
    costoAcumulado: 0,
    equiposFuera: 0,
  })

  const [filtros, setFiltros] = useState({
    equipo: '',
    tipo: '',
    tecnico: '',
    fechaDesde: '',
    fechaHasta: '',
  })

  const [showNuevoMantenimiento, setShowNuevoMantenimiento] = useState(false)

  const [formData, setFormData] = useState({
    equipo_id: '',
    codigo_equipo: '',
    activo: '',
    equipo: '',
    empleado: '',
    tipo_mantenimiento: '',
    fecha: new Date().toISOString().slice(0, 10),
    tecnico: '',
    descripcion: '',
    costo: 0,
    estado: 'activo',
    responsable: '',
  })

  const [equipos, setEquipos] = useState([])

  const tiposMantenimiento = [
    { value: '', label: 'Seleccionar tipo...' },
    { value: 'preventivo', label: 'Preventivo' },
    { value: 'correctivo', label: 'Correctivo' },
  ]

  // Carga los mantenimientos con filtros
  const fetchMantenimientos = async () => {
    let query = supabase.from('mantenimientos').select('*')

    if (filtros.equipo) query = query.eq('equipo_id', filtros.equipo)
    if (filtros.tipo) query = query.eq('tipo_mantenimiento', filtros.tipo)
    if (filtros.tecnico) query = query.ilike('tecnico', `%${filtros.tecnico}%`)
    if (filtros.fechaDesde) query = query.gte('fecha', filtros.fechaDesde)
    if (filtros.fechaHasta) query = query.lte('fecha', filtros.fechaHasta)

    const { data, error } = await query.order('fecha', { ascending: false })

    if (error) {
      console.error(error)
      setMantenimientos([])
    } else {
      setMantenimientos(data || [])
      setResumen({
        totalPeriodo: data?.length || 0,
        costoAcumulado: data?.reduce((suma, m) => suma + (m.costo || 0), 0) || 0,
        equiposFuera: data?.filter(m => m.estado_equipo === 'fuera').length || 0,
      })
    }
  }

  // Carga los equipos de la tabla activos para mostrar en select
  const fetchEquiposActivos = async () => {
    const { data, error } = await supabase
      .from('activos')
      .select('id, codigo, tipo, marca, modelo')
      .eq('estado', 'activo')

    if (error) {
      console.error('Error cargando equipos:', error)
      setEquipos([])
    } else {
      setEquipos(data || [])
    }
  }

  useEffect(() => {
    fetchMantenimientos()
  }, [filtros])

  useEffect(() => {
    if (showNuevoMantenimiento) {
      fetchEquiposActivos()
    }
  }, [showNuevoMantenimiento])

  const handleChange = e => {
    const { name, value } = e.target
    setFiltros(prev => ({ ...prev, [name]: value }))
  }

  const handleFormChange = e => {
    const { name, value } = e.target

    setFormData(prev => {
      let newState = { ...prev, [name]: value }

      // Actualizar campos relacionados automaticamente cuando seleccionan equipo
      if (name === 'equipo_id') {
        const seleccionado = equipos.find(eq => eq.id.toString() === value)
        if (seleccionado) {
          newState.codigo_equipo = seleccionado.codigo
          newState.activo = seleccionado.tipo
          newState.equipo = `${seleccionado.marca} ${seleccionado.modelo}`
        } else {
          newState.codigo_equipo = ''
          newState.activo = ''
          newState.equipo = ''
        }
      }
      return newState
    })
  }

  const handleSubmit = async e => {
    e.preventDefault()
    // Validar campos obligatorios
    const { equipo_id, tipo_mantenimiento, fecha, tecnico } = formData
    if (!equipo_id || !tipo_mantenimiento || !fecha || !tecnico) {
      alert('Completa los campos obligatorios.')
      return
    }

    try {
      const { error } = await supabase.from('mantenimientos').insert([
        {
          equipo_id: formData.equipo_id,
          codigo_equipo: formData.codigo_equipo,
          activo: formData.activo,
          equipo: formData.equipo,
          empleado: formData.empleado,
          tipo_mantenimiento: formData.tipo_mantenimiento,
          fecha: formData.fecha,
          tecnico: formData.tecnico,
          descripcion: formData.descripcion,
          costo: formData.costo,
          estado_equipo: 'fuera',
          responsable: formData.responsable,
        }
      ])

      if (error) {
        alert('Error al registrar mantenimiento: ' + error.message)
      } else {
        alert('Mantenimiento registrado exitosamente.')
        fetchMantenimientos()
        setShowNuevoMantenimiento(false)
        setFormData({
          equipo_id: '',
          codigo_equipo: '',
          activo: '',
          equipo: '',
          empleado: '',
          tipo_mantenimiento: '',
          fecha: new Date().toISOString().slice(0, 10),
          tecnico: '',
          descripcion: '',
          costo: 0,
          estado_equipo: 'fuera',
          responsable: '',
        })
      }
    } catch (error) {
      alert('Error inesperado: ' + error.message)
    }
  }

  return (
    <div className="bg-gray-900 min-h-screen p-8 text-white font-mono space-y-8">
      <h1 className="text-3xl font-bold">Mantenimiento de Equipos</h1>

      <section className="grid grid-cols-3 gap-4">
        <div className="bg-gray-800 p-4 rounded">
          <h2 className="text-lg font-semibold text-blue-400">Total del Período</h2>
          <p className="text-4xl font-bold">{resumen.totalPeriodo}</p>
          <p className="text-gray-400 text-sm">Registros de mantenimiento</p>
        </div>
        <div className="bg-gray-800 p-4 rounded">
          <h2 className="text-lg font-semibold text-blue-400">Costo Total Acumulado</h2>
          <p className="text-4xl font-bold">${resumen.costoAcumulado.toFixed(2)}</p>
          <p className="text-gray-400 text-sm">En mantenimientos registrados</p>
        </div>
        <div className="bg-gray-800 p-4 rounded">
          <h2 className="text-lg font-semibold text-yellow-500">Equipos en Mantenimiento</h2>
          <p className="text-4xl font-bold">{resumen.equiposFuera}</p>
          <p className="text-gray-400 text-sm">Actualmente fuera de servicio</p>
        </div>
      </section>

      <button
        onClick={() => setShowNuevoMantenimiento(true)}
        className="bg-blue-600 text-white px-6 py-2 rounded font-semibold hover:bg-blue-700 mb-6"
      >
        + Nuevo Mantenimiento
      </button>

      {/* Filtros */}
      <section className="bg-gray-800 p-6 rounded space-y-4">
        <div className="grid grid-cols-5 gap-4">
          <select name="equipo" onChange={handleChange} className="bg-gray-700 p-2 rounded" value={filtros.equipo}>
            <option value="">Todos los equipos</option>
          </select>

          <select name="tipo" onChange={handleChange} className="bg-gray-700 p-2 rounded" value={filtros.tipo}>
            <option value="">Todos los tipos</option>
            <option value="preventivo">Preventivo</option>
            <option value="correctivo">Correctivo</option>
          </select>

          <input type="text" name="tecnico" placeholder="Nombre del técnico..." onChange={handleChange} value={filtros.tecnico} className="bg-gray-700 p-2 rounded" />

          <input type="date" name="fechaDesde" onChange={handleChange} value={filtros.fechaDesde} className="bg-gray-700 p-2 rounded" />

          <input type="date" name="fechaHasta" onChange={handleChange} value={filtros.fechaHasta} className="bg-gray-700 p-2 rounded" />
        </div>

        <button 
          className="bg-blue-600 px-6 py-2 rounded font-semibold hover:bg-blue-700"
          onClick={fetchMantenimientos}
        >Buscar</button>
      </section>

      {/* Tabla mantenimientos */}
      <section className="overflow-x-auto max-h-[400px] scrollbar-thin scrollbar-thumb-gray-600">
        <table className="min-w-full border-collapse border border-gray-700 text-sm">
          <thead className="bg-gray-700 sticky top-0">
            <tr>
              <th className="border border-gray-600 px-3 py-1">Código / Equipo</th>
              <th className="border border-gray-600 px-3 py-1">Tipo</th>
              <th className="border border-gray-600 px-3 py-1">Fecha</th>
              <th className="border border-gray-600 px-3 py-1">Técnico</th>
              <th className="border border-gray-600 px-3 py-1">Costo</th>
              <th className="border border-gray-600 px-3 py-1">Estado</th>
              <th className="border border-gray-600 px-3 py-1">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {mantenimientos.length === 0 && (
              <tr>
                <td colSpan="7" className="text-center py-4 text-gray-400">
                  No se encontraron registros.
                </td>
              </tr>
            )}
            {mantenimientos.map(m => (
              <tr key={m.id} className="border border-gray-600 odd:bg-gray-800 even:bg-gray-700">
                <td className="border px-3 py-1 font-semibold">{m.codigo_equipo} {m.equipo}</td>
                <td className="border px-3 py-1 capitalize">{m.tipo_mantenimiento}</td>
                <td className="border px-3 py-1">{new Date(m.fecha).toLocaleDateString()}</td>
                <td className="border px-3 py-1">{m.tecnico}</td>
                <td className="border px-3 py-1">${m.costo}</td>
                <td className="border px-3 py-1">{m.estado_equipo === 'fuera' ? 'Fuera' : 'Activo'}</td>
                <td className="border px-3 py-1 space-x-2 text-center">
                  <button title="Ver" className="text-blue-400 hover:text-blue-600">👁️</button>
                  <button title="Editar" className="text-green-400 hover:text-green-600">✏️</button>
                  <button title="Cerrar" className="text-green-600 hover:text-green-800">✔️</button>
                  <button title="Eliminar" className="text-red-400 hover:text-red-600">🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Modal nuevo mantenimiento */}
      {showNuevoMantenimiento && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg w-full max-w-md p-6 relative text-white font-mono">
            <button
              onClick={() => setShowNuevoMantenimiento(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-white font-bold text-xl"
              aria-label="Cerrar"
            >
              &times;
            </button>

            <h2 className="text-xl font-semibold mb-6">Registrar Mantenimiento</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-1">Equipo</label>
                <select
                  name="equipo_id"
                  value={formData.equipo_id}
                  onChange={handleFormChange}
                  required
                  className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white"
                >
                  <option value="">Seleccionar equipo...</option>
                  {equipos.map(eq => (
                    <option key={eq.id} value={eq.id}>
                      {eq.tipo} {eq.marca} {eq.modelo} - {eq.serie}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-1">Tipo de Mantenimiento</label>
                <select
                  name="tipo_mantenimiento"
                  value={formData.tipo_mantenimiento}
                  onChange={handleFormChange}
                  required
                  className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white"
                >
                  <option value="">Seleccionar tipo...</option>
                  {tiposMantenimiento.map(t => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-1">Fecha de Mantenimiento</label>
                <input
                  type="date"
                  name="fecha"
                  value={formData.fecha}
                  onChange={handleFormChange}
                  required
                  className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white"
                />
              </div>

              <div>
                <label className="block mb-1">Técnico Responsable</label>
                <input
                  type="text"
                  name="tecnico"
                  placeholder="Nombre del técnico"
                  value={formData.tecnico}
                  onChange={handleFormChange}
                  required
                  className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white"
                />
              </div>

              <div>
                <label className="block mb-1">Descripción del Trabajo Realizado</label>
                <textarea
                  name="descripcion"
                  rows={4}
                  placeholder="Detalla el trabajo realizado durante el mantenimiento..."
                  value={formData.descripcion}
                  onChange={handleFormChange}
                  className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white"
                />
              </div>

              <div>
                <label className="block mb-1">Costo (MXN)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  name="costo"
                  value={formData.costo}
                  onChange={handleFormChange}
                  className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white"
                />
              </div>

              <div className="flex justify-end space-x-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowNuevoMantenimiento(false)}
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