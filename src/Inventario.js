import React, { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

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
    cantidad: '',
    motivo: '',
    fecha_movimiento: new Date().toISOString().slice(0, 10),
    notas: '',
  })

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

  // Obtener datos iniciales
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

  // Control formularios
  const handleNuevoMaterialChange = (e) => {
    const { name, value } = e.target
    setNuevoMaterialData(prev => ({
      ...prev,
      [name]: name.includes('stock') ? Number(value) : value,
    }))
  }

  const handleMovimientoChange = (e) => {
    const { name, value } = e.target
    setMovimientoData(prev => ({
      ...prev,
      [name]: name === 'cantidad' ? Number(value) : value,
    }))
  }

  // Guardar material
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
    } catch (err) {
      alert('Error al crear material: ' + err.message)
    }
  }

  // Guardar movimiento y actualizar stock
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
        cantidad: '',
        motivo: '',
        fecha_movimiento: new Date().toISOString().slice(0, 10),
        notas: '',
      })
    } catch (err) {
      alert('Error al registrar movimiento: ' + err.message)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8 font-mono text-white">
      <h1 className="text-3xl font-bold mb-2">Control de Inventario</h1>
      <p className="mb-6 text-gray-400">Gestión de materiales, movimientos y proveedores</p>

      <div className="flex flex-wrap gap-3 mb-6">
        <button className="bg-gray-800 py-2 px-4 rounded text-gray-300 font-semibold hover:bg-gray-700">Todas las categorías</button>
        <button className="bg-gray-800 py-2 px-4 rounded text-gray-300 font-semibold hover:bg-gray-700">Todas las unidades</button>
        <button className="bg-gray-800 py-2 px-4 rounded text-gray-300 font-semibold hover:bg-gray-700">Todos los estados</button>

        <form onSubmit={guardarNuevoMaterial} className="ml-auto flex gap-3">
          <button type="submit" className="bg-blue-600 py-2 px-5 rounded font-semibold hover:bg-blue-700">+ Nuevo Material</button>
        </form>

        <form onSubmit={guardarMovimiento} className="flex gap-3">
          <button type="submit" className="bg-green-600 py-2 px-5 rounded font-semibold hover:bg-green-700">Registrar Movimiento</button>
        </form>
      </div>

      {/* Tabla Materiales */}
      <table className="w-full border-collapse border-gray-700 border rounded-md mb-10">
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
            <tr><td colSpan="6" className="p-6 text-center text-gray-500">No se encontraron materiales.</td></tr>
          ) : materiales.map(mat => (
            <tr key={mat.id} className="even:bg-gray-800 odd:bg-gray-900">
              <td className="py-2 px-4 font-semibold">{mat.nombre}</td>
              <td className="py-2 px-4">
                <span className="bg-gray-700 px-2 py-1 rounded text-sm">{categorias.find(c => c.value === mat.categoria)?.label || mat.categoria}</span>
              </td>
              <td className="py-2 px-4 capitalize">{unidades.find(u => u.value === mat.unidad)?.label || mat.unidad}</td>
              <td className="py-2 px-4">{mat.stock_minimo}</td>
              <td className={`py-2 px-4 ${mat.stock_actual < mat.stock_minimo ? 'bg-red-600 text-white px-2 rounded' : ''}`}>
                {mat.stock_actual}
              </td>
              <td className="py-2 px-4 space-x-2">
                <button title="Editar" className="text-orange-400 hover:text-orange-500">✏️</button>
                <button title="Eliminar" className="text-gray-400 hover:text-gray-200">🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Tabla Movimientos */}
      <h2 className="mb-4 text-lg font-semibold">Movimientos Recientes</h2>
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
            <tr><td colSpan="6" className="p-6 text-center text-gray-500">No se encontraron movimientos.</td></tr>
          ) : movimientos.map(mov => (
            <tr key={mov.id} className="even:bg-gray-800 odd:bg-gray-900">
              <td className="py-2 px-4">{mov.materiales.nombre}</td>
              <td className="py-2 px-4 capitalize">{mov.tipo_movimiento}</td>
              <td className="py-2 px-4">{mov.cantidad}</td>
              <td className="py-2 px-4">{mov.motivo || '-'}</td>
              <td className="py-2 px-4">{new Date(mov.fecha_movimiento).toLocaleDateString()}</td>
              <td className="py-2 px-4">{mov.notas || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}