import React, { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

export default function Activos() {
  // Estados para filtros, datos y modal
  const [activos, setActivos] = useState([])
  const [loading, setLoading] = useState(false)
  const [showNuevoActivo, setShowNuevoActivo] = useState(false)

  const [filtros, setFiltros] = useState({
    tipo: '',
    marca: '',
    estado: '',
    modelo: '',
  })

  // Datos de formulario nuevo activo, incluye campo código
  const [formData, setFormData] = useState({
    codigo: '',
    tipo: '',
    marca: '',
    modelo: '',
    serie: '',
    procesador: '',
    ram: '',
    almacenamiento: '',
    adquisicion: new Date().toISOString().slice(0, 10),
    costo: 0.0,
  })

  const tiposEquipo = [
    { value: '', label: 'Seleccionar tipo...' },
    { value: 'laptop', label: 'Laptop' },
    { value: 'desktop', label: 'Desktop' },
    { value: 'tablet', label: 'Tablet' },
  ]

  // Función para generar código secuencial STR-0001, STR-0002…
  const generarCodigoNuevo = (lista) => {
    if (!lista || lista.length === 0) return 'STR-0001'
    const numeros = lista
      .map(obj => obj.codigo)
      .filter(codigo => codigo && codigo.startsWith('STR-'))
      .map(codigo => parseInt(codigo.slice(4), 10))
      .filter(num => !isNaN(num))
    const maxNum = numeros.length > 0 ? Math.max(...numeros) : 0
    const nuevoNum = maxNum + 1
    return `STR-${nuevoNum.toString().padStart(4, '0')}`
  }

  // Carga activos y genera código nuevo cuando se abre formulario
  const fetchActivos = async () => {
    setLoading(true)
    let query = supabase.from('activos').select('*')

    if (filtros.tipo) query = query.eq('tipo', filtros.tipo)
    if (filtros.marca) query = query.eq('marca', filtros.marca)
    if (filtros.estado) query = query.eq('estado', filtros.estado)
    if (filtros.modelo) query = query.ilike('modelo', `%${filtros.modelo}%`)

    const { data, error } = await query.order('id', { ascending: true })
    if (error) {
      console.error('Error cargando activos:', error)
      setActivos([])
    } else {
      setActivos(data || [])
      if (showNuevoActivo) {
        const nuevoCodigo = generarCodigoNuevo(data)
        setFormData(prev => ({ ...prev, codigo: nuevoCodigo }))
      }
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchActivos()
  }, [filtros, showNuevoActivo])

  // Maneja la actualización de filtros
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFiltros(prev => ({ ...prev, [name]: value }))
  }

  // Maneja cambios en formulario nuevo activo
  const handleFormChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'costo' ? parseFloat(value) || 0 : value,
    }))
  }

  // Guarda nuevo activo en supabase
  const handleSubmit = async (e) => {
    e.preventDefault()
    const { codigo, tipo, marca, modelo, serie } = formData
    if (!codigo || !tipo || !marca || !modelo || !serie) {
      alert('Completa los campos obligatorios: código, tipo, marca, modelo y serie.')
      return
    }
    try {
      const { error } = await supabase.from('activos').insert([formData])
      if (error) throw error
      alert('Activo guardado correctamente!')
      fetchActivos()
      setShowNuevoActivo(false)
      setFormData({
        codigo: '',
        tipo: '',
        marca: '',
        modelo: '',
        serie: '',
        procesador: '',
        ram: '',
        almacenamiento: '',
        adquisicion: new Date().toISOString().slice(0, 10),
        costo: 0.0,
      })
    } catch (err) {
      alert('Error al guardar activo: ' + err.message)
    }
  }

  // Placeholders exportar
  const exportarPDF = () => alert('Funcionalidad Exportar PDF pendiente por implementar')
  const exportarExcel = () => alert('Funcionalidad Exportar Excel pendiente por implementar')

  return (
    <div className="bg-gray-900 min-h-screen p-8 text-white font-mono">
      <h1 className="text-3xl font-bold mb-2">Activos de Cómputo</h1>
      <p className="text-gray-400 mb-6">Gestión y control de equipos de cómputo registrados en el sistema</p>

      {/* Botones exportar y nuevo */}
      <div className="flex items-center justify-end mb-4 space-x-4">
        <button onClick={exportarPDF} className="bg-transparent border border-blue-500 hover:bg-blue-700 text-blue-500 hover:text-white font-semibold py-2 px-4 rounded">Exportar PDF</button>
        <button onClick={exportarExcel} className="bg-transparent border border-blue-500 hover:bg-blue-700 text-blue-500 hover:text-white font-semibold py-2 px-4 rounded">Exportar Excel</button>
        <button onClick={() => setShowNuevoActivo(true)} className="bg-blue-600 hover:bg-blue-800 text-white font-semibold py-2 px-6 rounded">+ Nuevo Equipo</button>
      </div>

      {/* Filtros */}
      <fieldset className="border border-gray-700 rounded p-4 mb-6">
        <legend className="text-lg font-semibold mb-2 flex items-center space-x-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-1 1h-4l-3 7-4-8H4a1 1 0 01-1-1V4z" />
          </svg>
          <span>Filtros</span>
        </legend>
        <div className="grid grid-cols-4 gap-4 mt-2">
          <select name="tipo" value={filtros.tipo} onChange={handleInputChange} className="bg-gray-800 p-2 rounded border border-gray-600">
            <option value="">Todos los tipos</option>
            {tiposEquipo.map(t => (<option key={t.value} value={t.value}>{t.label}</option>))}
          </select>
          <select name="marca" value={filtros.marca} onChange={handleInputChange} className="bg-gray-800 p-2 rounded border border-gray-600">
            <option value="">Todas las marcas</option>
            <option value="Lenovo">Lenovo</option>
            <option value="HP">HP</option>
            <option value="Dell">Dell</option>
            <option value="Apple">Apple</option>
          </select>
          <select name="estado" value={filtros.estado} onChange={handleInputChange} className="bg-gray-800 p-2 rounded border border-gray-600">
            <option value="">Todos los estados</option>
            <option value="activo">Activo</option>
            <option value="mantenimiento">En mantenimiento</option>
            <option value="baja">Dado de baja</option>
          </select>
          <input name="modelo" type="text" placeholder="Buscar por modelo..." value={filtros.modelo} onChange={handleInputChange} className="bg-gray-800 p-2 rounded border border-gray-600" />
        </div>
      </fieldset>

      {/* Tabla activos */}
      <div className="bg-gray-800 rounded p-4">
        <h2 className="text-xl font-semibold mb-4">Inventario de Equipos</h2>
        {loading ? (
          <p>Cargando equipos...</p>
        ) : activos.length === 0 ? (
          <p className="text-gray-400">No se encontraron equipos.</p>
        ) : (
          <table className="min-w-full table-auto border-collapse border border-gray-700">
            <thead>
              <tr className="bg-gray-700">
                <th className="border border-gray-600 px-4 py-2">Código</th>
                <th className="border border-gray-600 px-4 py-2">Tipo</th>
                <th className="border border-gray-600 px-4 py-2">Marca</th>
                <th className="border border-gray-600 px-4 py-2">Modelo</th>
                <th className="border border-gray-600 px-4 py-2">Serie</th>
                <th className="border border-gray-600 px-4 py-2">Adquisición</th>
                <th className="border border-gray-600 px-4 py-2">Estado</th>
                <th className="border border-gray-600 px-4 py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {activos.map((item) => (
                <tr key={item.id} className="odd:bg-gray-700 even:bg-gray-600 text-sm">
                  <td className="border border-gray-600 px-3 py-1">{item.codigo}</td>
                  <td className="border border-gray-600 px-3 py-1">{item.tipo}</td>
                  <td className="border border-gray-600 px-3 py-1">{item.marca}</td>
                  <td className="border border-gray-600 px-3 py-1">{item.modelo}</td>
                  <td className="border border-gray-600 px-3 py-1">{item.serie}</td>
                  <td className="border border-gray-600 px-3 py-1">{item.adquisicion}</td>
                  <td className="border border-gray-600 px-3 py-1 capitalize">{item.estado}</td>
                  <td className="border border-gray-600 px-3 py-1 space-x-2 text-center">
                    <button title="Ver" className="text-blue-400 hover:text-blue-600" onClick={() => alert(`Ver detalles equipo ID ${item.id}`)}>👁️</button>
                    <button title="Editar" className="text-green-400 hover:text-green-600" onClick={() => alert(`Editar equipo ID ${item.id}`)}>✏️</button>
                    <button title="Eliminar" className="text-red-400 hover:text-red-600" onClick={() => alert(`Eliminar equipo ID ${item.id}`)}>🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal nuevo equipo */}
      {showNuevoActivo && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md relative text-white">
            <button onClick={() => setShowNuevoActivo(false)} className="absolute top-3 right-3 text-gray-400 hover:text-white text-2xl font-bold" aria-label="Cerrar">&times;</button>

            <h2 className="text-xl font-bold mb-1">Registrar Nuevo Equipo</h2>
            <p className="text-gray-400 mb-6 text-sm">Ingresa las especificaciones técnicas del equipo</p>

            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-1">Código</label>
                <input
                  type="text"
                  name="codigo"
                  value={formData.codigo}
                  onChange={handleFormChange}
                  placeholder="Ejemplo: STR-0001"
                  className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600"
                  required
                />
              </div>

              <div>
                <label className="block mb-1">Tipo de equipo</label>
                <select name="tipo" value={formData.tipo} onChange={handleFormChange} className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600" required>
                  {tiposEquipo.map(t => (<option key={t.value} value={t.value}>{t.label}</option>))}
                </select>
              </div>

              <div>
                <label className="block mb-1">Marca</label>
                <input type="text" name="marca" placeholder="Ej. Dell, HP, Lenovo" value={formData.marca} onChange={handleFormChange} className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600" required />
              </div>

              <div>
                <label className="block mb-1">Modelo</label>
                <input type="text" name="modelo" placeholder="Ej. Latitude 5540" value={formData.modelo} onChange={handleFormChange} className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600" required />
              </div>

              <div>
                <label className="block mb-1">Número de serie</label>
                <input type="text" name="serie" placeholder="Ej. SN-4829301" value={formData.serie} onChange={handleFormChange} className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600" required />
              </div>

              <div>
                <label className="block mb-1">Procesador</label>
                <input type="text" name="procesador" placeholder="Ej. Intel Core i7" value={formData.procesador} onChange={handleFormChange} className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600" />
              </div>

              <div>
                <label className="block mb-1">RAM</label>
                <input type="text" name="ram" placeholder="Ej. 16 GB" value={formData.ram} onChange={handleFormChange} className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600" />
              </div>

              <div>
                <label className="block mb-1">Almacenamiento</label>
                <input type="text" name="almacenamiento" placeholder="Ej. 512 GB SSD" value={formData.almacenamiento} onChange={handleFormChange} className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600" />
              </div>

              <div>
                <label className="block mb-1">Fecha de adquisición</label>
                <input type="date" name="adquisicion" value={formData.adquisicion} onChange={handleFormChange} className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600" required />
              </div>

              <div>
                <label className="block mb-1">Costo (MXN)</label>
                <input type="number" step="0.01" min="0" name="costo" value={formData.costo} onChange={handleFormChange} className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600" required />
              </div>

              <div className="col-span-2 flex justify-end space-x-4 mt-4">
                <button type="button" onClick={() => setShowNuevoActivo(false)} className="bg-gray-700 px-6 py-2 rounded hover:bg-gray-600">Cancelar</button>
                <button type="submit" className="bg-blue-600 px-6 py-2 rounded hover:bg-blue-700">Guardar Equipo</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}