import React, { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

function Modal({ children, onClose }) {
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 p-6 rounded-lg w-full max-w-md relative"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-200 text-xl font-bold"
          aria-label="Cerrar"
          type="button"
        >
          ×
        </button>
      </div>
    </div>
  )
}

export default function Inventario() {
  const [materiales, setMateriales] = useState([])
  const [movimientos, setMovimientos] = useState([])

  const [nuevoMaterialData, setNuevoMaterialData] = useState({
    nombre: '',
    categoria: '',
    unidad: '',
    stock_minimo: 0,
    stock_actual: 0,
  })

  const [movimientoData, setMovimientoData] = useState({
    material_id: '',
    tipo_movimiento: '',
    cantidad: 0,
    motivo: '',
    fecha_movimiento: new Date().toISOString().slice(0, 10),
    notas: '',
  })

  // Estados para mostrar modales
  const [mostrarFormularioMaterial, setMostrarFormularioMaterial] = useState(false)
  const [mostrarFormularioMovimiento, setMostrarFormularioMovimiento] = useState(false)

  // Opciones
  const categorias = [
    { value: 'papeleria', label: 'Papelería y Oficina' },
    { value: 'limpieza', label: 'Limpieza' },
    { value: 'informatico', label: 'Informático' },
  ]
  const unidades = [
    { value: 'pieza', label: 'Pieza' },
    { value: 'caja', label: 'Caja' },
    { value: 'litro', label: 'Litro' },
  ]
  const motivosSalida = [
    { value: 'uso interno', label: 'Uso Interno' },
    { value: 'venta', label: 'Venta' },
    { value: 'deterioro', label: 'Deterioro' },
    { value: 'otro', label: 'Otro' },
  ]

  useEffect(() => {
    fetchMateriales()
    fetchMovimientos()
  }, [])

  const fetchMateriales = async () => {
    const { data, error } = await supabase.from('materiales').select('*').order('id', { ascending: false })
    if (error) console.error(error)
    else setMateriales(data || [])
  }

  const fetchMovimientos = async () => {
    const { data, error } = await supabase.from('movimientos')
      .select('*, materiales!inner(nombre)')
      .order('fecha_movimiento', { ascending: false })
    if (error) console.error(error)
    else setMovimientos(data || [])
  }

  const handleNuevoMaterialChange = (e) => {
    const { name, value } = e.target
    setNuevoMaterialData(prev => ({
      ...prev,
      [name]: name.includes('stock') ? parseInt(value) || 0 : value
    }))
  }

  const handleMovimientoChange = (e) => {
    const { name, value } = e.target
    setMovimientoData(prev => ({
      ...prev,
      [name]: name === 'cantidad' ? Number(value) : value
    }))
  }

  const guardarNuevoMaterial = async (e) => {
    e.preventDefault()
    try {
      const { error } = await supabase.from('materiales').insert([nuevoMaterialData])
      if (error) throw error
      alert('Material creado con éxito')
      fetchMateriales()
      setNuevoMaterialData({
        nombre: '',
        categoria: '',
        unidad: '',
        stock_minimo: 0,
        stock_actual: 0,
      })
      setMostrarFormularioMaterial(false)
    } catch (err) {
      alert('Error al crear material: ' + err.message)
    }
  }

  const guardarMovimiento = async (e) => {
    e.preventDefault()
    try {
      if (!movimientoData.material_id || !movimientoData.tipo_movimiento || !movimientoData.cantidad || movimientoData.cantidad <= 0) {
        alert('Por favor completa los campos obligatorios con cantidad válida')
        return
      }

      const { error: errorMovimiento } = await supabase.from('movimientos').insert([movimientoData])
      if (errorMovimiento) throw errorMovimiento

      const { data: material, error: errorMaterial } = await supabase
        .from('materiales')
        .select('stock_actual')
        .eq('id', movimientoData.material_id)
        .single()
      if (errorMaterial) throw errorMaterial

      let nuevoStock = material.stock_actual
      if (movimientoData.tipo_movimiento === 'entrada') {
        nuevoStock += movimientoData.cantidad
      } else if (movimientoData.tipo_movimiento === 'salida') {
        nuevoStock = Math.max(0, nuevoStock - movimientoData.cantidad)
      }

      const { error: errorActualizar } = await supabase
        .from('materiales')
        .update({ stock_actual: nuevoStock })
        .eq('id', movimientoData.material_id)
      if (errorActualizar) throw errorActualizar

      alert('Movimiento registrado y stock actualizado.')
      fetchMateriales()
      fetchMovimientos()
      setMovimientoData({
        material_id: '',
        tipo_movimiento: '',
        cantidad: 0,
        motivo: '',
        fecha_movimiento: new Date().toISOString().slice(0, 10),
        notas: '',
      })
      setMostrarFormularioMovimiento(false)
    } catch (err) {
      alert('Error al registrar movimiento: ' + err.message)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8 font-mono text-white">
      <h1 className="text-3xl font-bold mb-2">Control de Inventario</h1>
      <p className="mb-6 text-gray-400">Gestión de materiales, movimientos y proveedores</p>

      <div className="flex flex-wrap gap-3 mb-6">
        <button className="bg-gray-800 py-2 px-4 rounded text-gray-300 font-semibold hover:bg-gray-700">
          Todas las categorías
        </button>
        <button className="bg-gray-800 py-2 px-4 rounded text-gray-300 font-semibold hover:bg-gray-700">
          Todas las unidades
        </button>
        <button className="bg-gray-800 py-2 px-4 rounded text-gray-300 font-semibold hover:bg-gray-700">
          Todos los estados
        </button>

        <button
          type="button"
          onClick={() => setMostrarFormularioMaterial(true)}
          className="bg-blue-600 py-2 px-5 rounded font-semibold hover:bg-blue-700 ml-auto"
        >
          + Nuevo Material
        </button>

        <button
          type="button"
          onClick={() => setMostrarFormularioMovimiento(true)}
          className="bg-green-600 py-2 px-5 rounded font-semibold hover:bg-green-700"
        >
          Registrar Movimiento
        </button>
      </div>

      {/* Modal Nuevo Material */}
      {mostrarFormularioMaterial && (
        <Modal onClose={() => setMostrarFormularioMaterial(false)}>
          <h3 className="text-xl font-semibold mb-4 text-white">Nuevo Material</h3>

          <form onSubmit={guardarNuevoMaterial} className="space-y-4">
            <div>
              <label className="block mb-1 text-gray-300">Nombre del Material</label>
              <input
                type="text"
                name="nombre"
                value={nuevoMaterialData.nombre}
                onChange={handleNuevoMaterialChange}
                placeholder="Ej. Papel Bond A4"
                className="w-full p-3 bg-gray-800 rounded border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                autoFocus
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 text-gray-300">Categoría</label>
                <select
                  name="categoria"
                  value={nuevoMaterialData.categoria}
                  onChange={handleNuevoMaterialChange}
                  className="w-full p-3 bg-gray-800 rounded border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Seleccionar...</option>
                  {categorias.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-1 text-gray-300">Unidad de Medida</label>
                <select
                  name="unidad"
                  value={nuevoMaterialData.unidad}
                  onChange={handleNuevoMaterialChange}
                  className="w-full p-3 bg-gray-800 rounded border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Seleccionar...</option>
                  {unidades.map(uni => (
                    <option key={uni.value} value={uni.value}>{uni.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 text-gray-300">Stock Mínimo</label>
                <input
                  type="number"
                  name="stock_minimo"
                  min="0"
                  value={nuevoMaterialData.stock_minimo}
                  onChange={handleNuevoMaterialChange}
                  className="w-full p-3 bg-gray-800 rounded border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block mb-1 text-gray-300">Stock Actual</label>
                <input
                  type="number"
                  name="stock_actual"
                  min="0"
                  value={nuevoMaterialData.stock_actual}
                  onChange={handleNuevoMaterialChange}
                  className="w-full p-3 bg-gray-800 rounded border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setMostrarFormularioMaterial(false)}
                className="px-4 py-2 rounded bg-gray-700 text-gray-400 hover:bg-gray-600"
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
              >
                Guardar Material
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal Registrar Movimiento */}
      {mostrarFormularioMovimiento && (
        <Modal onClose={() => setMostrarFormularioMovimiento(false)}>
          <h3 className="text-xl font-semibold mb-4 text-white">Registrar Movimiento</h3>

          <form onSubmit={guardarMovimiento} className="space-y-4">
            <div>
              <label className="block mb-1 text-gray-300">Material</label>
              <select
                name="material_id"
                value={movimientoData.material_id}
                onChange={handleMovimientoChange}
                className="w-full p-3 bg-gray-800 rounded border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              >
                <option value="">Seleccionar material...</option>
                {materiales.map(mat => (
                  <option key={mat.id} value={mat.id}>
                    {mat.nombre} (Stock: {mat.stock_actual})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 text-gray-300">Tipo de Movimiento</label>
                <select
                  name="tipo_movimiento"
                  value={movimientoData.tipo_movimiento}
                  onChange={handleMovimientoChange}
                  className="w-full p-3 bg-gray-800 rounded border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                >
                  <option value="">Seleccionar...</option>
                  <option value="entrada">Entrada</option>
                  <option value="salida">Salida</option>
                </select>
              </div>

              <div>
                <label className="block mb-1 text-gray-300">Cantidad</label>
                <input
                  type="number"
                  name="cantidad"
                  min="1"
                  value={movimientoData.cantidad}
                  onChange={handleMovimientoChange}
                  className="w-full p-3 bg-gray-800 rounded border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block mb-1 text-gray-300">Motivo (solo para Salida)</label>
              <select
                name="motivo"
                value={movimientoData.motivo}
                onChange={handleMovimientoChange}
                className="w-full p-3 bg-gray-800 rounded border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                disabled={movimientoData.tipo_movimiento !== 'salida'}
              >
                <option value="">Seleccionar motivo...</option>
                {motivosSalida.map(motivo => (
                  <option key={motivo.value} value={motivo.value}>
                    {motivo.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1 text-gray-300">Fecha del Movimiento</label>
              <input
                type="date"
                name="fecha_movimiento"
                value={movimientoData.fecha_movimiento}
                onChange={handleMovimientoChange}
                className="w-full p-3 bg-gray-800 rounded border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>

            <div>
              <label className="block mb-1 text-gray-300">Notas (opcional)</label>
              <textarea
                name="notas"
                value={movimientoData.notas}
                onChange={handleMovimientoChange}
                placeholder="Observaciones adicionales..."
                rows="3"
                className="w-full p-3 bg-gray-800 rounded border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setMostrarFormularioMovimiento(false)}
                className="px-4 py-2 rounded bg-gray-700 text-gray-400 hover:bg-gray-600"
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
              >
                Guardar Movimiento
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Tabla Materiales */}
      <table className="w-full border-collapse border border-gray-700 rounded-md mb-10">
        <thead className="bg-gray-800 text-gray-300">
          <tr>
            <th className="py-3 px-4 text-left">Material</th>
            <th className="py-3 px-4 text-left">Categoría</th>
            <th className="py-3 px-4 text-left">Unidad</th>
            <th className="py-3 px-4 text-left">Stock Mín.</th>
            <th className="py-3 px-4 text-left">Stock Actual</th>
            <th className="py-3 px-4 text-left">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {materiales.length === 0 ? (
            <tr>
              <td colSpan="6" className="p-6 text-center text-gray-500">
                No se encontraron materiales.
              </td>
            </tr>
          ) : (
            materiales.map((mat) => (
              <tr
                key={mat.id}
                className="even:bg-gray-800 odd:bg-gray-900 hover:bg-gray-700 transition-colors"
              >
                <td className="py-2 px-4 font-semibold">{mat.nombre}</td>
                <td className="py-2 px-4">
                  <span className="bg-gray-700 px-2 py-1 rounded text-sm">
                    {categorias.find((c) => c.value === mat.categoria)?.label || mat.categoria}
                  </span>
                </td>
                <td className="py-2 px-4 capitalize">
                  {unidades.find((u) => u.value === mat.unidad)?.label || mat.unidad}
                </td>
                <td className="py-2 px-4">{mat.stock_minimo}</td>
                <td
                  className={`py-2 px-4 font-semibold ${
                    mat.stock_actual < mat.stock_minimo
                      ? 'bg-red-600 text-white px-2 rounded'
                      : 'text-green-400'
                  }`}
                >
                  {mat.stock_actual}
                </td>
                <td className="py-2 px-4 space-x-2">
                  <button
                    title="Editar"
                    className="text-orange-400 hover:text-orange-500 p-1 rounded hover:bg-orange-500/20 transition-colors"
                  >
                    ✏️
                  </button>
                  <button
                    title="Eliminar"
                    className="text-red-400 hover:text-red-500 p-1 rounded hover:bg-red-500/20 transition-colors"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Tabla Movimientos */}
      <h2 className="mb-4 text-lg font-semibold">Movimientos Recientes</h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-700 rounded-md overflow-hidden text-gray-300">
          <thead className="bg-gray-800">
            <tr>
              <th className="py-2 px-4 text-left">Material</th>
              <th className="py-2 px-4 text-left">Tipo</th>
              <th className="py-2 px-4 text-left">Cantidad</th>
              <th className="py-2 px-4 text-left">Motivo</th>
              <th className="py-2 px-4 text-left">Fecha</th>
              <th className="py-2 px-4 text-left">Notas</th>
            </tr>
          </thead>
          <tbody>
            {movimientos.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-6 text-center text-gray-500">
                  No se encontraron movimientos.
                </td>
              </tr>
            ) : (
              movimientos.map((mov) => (
                <tr
                  key={mov.id}
                  className="even:bg-gray-800 odd:bg-gray-900 hover:bg-gray-700 transition-colors"
                >
                  <td className="py-2 px-4 font-medium">{mov.materiales?.nombre || 'N/A'}</td>
                  <td
                    className={`py-2 px-4 capitalize px-2 py-1 rounded font-medium ${
                      mov.tipo_movimiento === 'entrada'
                        ? 'bg-green-600 text-white'
                        : 'bg-red-600 text-white'
                    }`}
                  >
                    {mov.tipo_movimiento}
                  </td>
                  <td className="py-2 px-4 font-semibold">{mov.cantidad}</td>
                  <td className="py-2 px-4">{mov.motivo || '-'}</td>
                  <td className="py-2 px-4">{new Date(mov.fecha_movimiento).toLocaleDateString()}</td>
                  <td className="py-2 px-4 max-w-xs truncate" title={mov.notas}>{mov.notas || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
