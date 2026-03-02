
import React, { useEffect, useState, useCallback } from 'react'
import { supabase } from './supabaseClient'

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([])
  const [filtros, setFiltros] = useState({
    rol: '',
    estado: '',
  })

  // Estado para controlar el modal y el formulario
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    contraseña: '',
    rol: '',
  })

const fetchUsuarios = useCallback(async () => {
  let query = supabase.from('usuarios').select('*')
  if (filtros.rol) query = query.eq('rol', filtros.rol)
  if (filtros.estado) query = query.eq('estado', filtros.estado)

  const { data, error } = await query.order('nombre', { ascending: true })
  if (error) console.error(error)
  else setUsuarios(data || [])
}, [filtros, setUsuarios])

  useEffect(() => {
    fetchUsuarios()
  }, [fetchUsuarios])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFiltros((prev) => ({ ...prev, [name]: value }))
  }

  // Controlar cambios en el formulario modal
  const handleFormChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Enviar formulario para crear usuario
  const handleFormSubmit = async (e) => {
    e.preventDefault()
    const { nombre, correo, contraseña, rol } = formData

    if (!nombre || !correo || !contraseña || !rol) {
      alert('Por favor completa todos los campos.')
      return
    }
    if (contraseña.length < 8) {
      alert('La contraseña debe tener al menos 8 caracteres.')
      return
    }

    // Crear usuario en Supabase Auth
  /*  const { data: authData, error: authError } = await supabase.auth.signUp({
      email: correo,
      password: contraseña,
    })

    if (authError) {
      console.error('Error creando usuario en Auth:', authError)
      alert(`Error: ${authError.message}`)
      return
    } */

    // Insertar info adicional en tabla usuarios
   /* const { data: userData, error: dbError } = await supabase.from('usuarios').insert([
      {
        id: authData.user.id,
        nombre,
        correo,
        rol,
        estado: 'activo',
      }
    ])

    if (dbError) {
      console.error('Error guardando info usuario:', dbError)
      alert(`Error guardando datos usuario: ${dbError.message}`)
      return
    }*/

    alert('Usuario creado con éxito.')
    fetchUsuarios()
    setShowModal(false)
    setFormData({ nombre: '', correo: '', contraseña: '', rol: '' })
  }

  return (
    <>
      <div className="bg-gray-900 min-h-screen p-8 text-white font-mono">
        <h1 className="text-3xl font-bold mb-4">Gestión de Usuarios</h1>

        <div className="flex space-x-4 mb-6">
          <select name="rol" value={filtros.rol} onChange={handleChange} className="bg-gray-800 p-2 rounded border border-gray-700">
            <option value="">Todos los roles</option>
            <option value="administrador">Administrador</option>
            <option value="encargado_inventario">Encargado de Inventario</option>
            <option value="encargado_ti">Encargado de TI</option>
          </select>

          <select name="estado" value={filtros.estado} onChange={handleChange} className="bg-gray-800 p-2 rounded border border-gray-700">
            <option value="">Todos los estados</option>
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
          </select>

          <button
            onClick={() => setShowModal(true)}
            className="ml-auto bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
          >
            + Nuevo Usuario
          </button>
        </div>

        <table className="min-w-full border-collapse border border-gray-700">
          <thead className="bg-gray-700">
            <tr>
              <th className="border border-gray-600 text-left px-3 py-2">Nombre</th>
              <th className="border border-gray-600 px-3 py-2">Correo Electrónico</th>
              <th className="border border-gray-600 px-3 py-2">Rol</th>
              <th className="border border-gray-600 px-3 py-2">Estado</th>
              <th className="border border-gray-600 px-3 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center py-4 text-gray-400">
                  No se encontraron usuarios.
                </td>
              </tr>
            )}
            {usuarios.map((u) => (
              <tr key={u.id} className="odd:bg-gray-800 even:bg-gray-700 border border-gray-600">
                <td className="border px-3 py-1">{u.nombre}</td>
                <td className="border px-3 py-1">{u.correo}</td>
                <td className="border px-3 py-1">
                  <span className="bg-blue-600 px-3 py-1 rounded text-white text-xs">
                    {u.rol.replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="border px-3 py-1">
                  <span className={`px-3 py-1 rounded text-sm ${u.estado === 'activo' ? 'bg-green-500 text-white' : 'bg-red-600 text-white'}`}>
                    {u.estado}
                  </span>
                </td>
                <td className="border px-3 py-1 space-x-3 text-center">
                  <button title="Editar" className="text-green-400 hover:text-green-600">✏️</button>
                  <button title="Ver" className="text-blue-400 hover:text-blue-600">👁️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal para crear nuevo usuario */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg w-full max-w-md p-6 relative text-white">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-white font-bold text-xl"
              aria-label="Cerrar formulario"
            >
              &times;
            </button>

            <h2 className="text-xl font-semibold mb-6">Nuevo Usuario</h2>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-white">
              <div>
                <label htmlFor="nombre" className="block mb-1">Nombre completo</label>
                <input
                  id="nombre"
                  name="nombre"
                  type="text"
                  placeholder="Ej. María González"
                  value={formData.nombre}
                  onChange={handleFormChange}
                  required
                  className="w-full p-2 rounded bg-gray-700 border border-gray-600 placeholder-gray-400 text-white"
                />
              </div>

              <div>
                <label htmlFor="correo" className="block mb-1">Correo electrónico</label>
                <input
                  id="correo"
                  name="correo"
                  type="email"
                  placeholder="usuario@empresa.com"
                  value={formData.correo}
                  onChange={handleFormChange}
                  required
                  className="w-full p-2 rounded bg-gray-700 border border-gray-600 placeholder-gray-400 text-white"
                />
              </div>

              <div>
                <label htmlFor="contraseña" className="block mb-1">Contraseña</label>
                <input
                  id="contraseña"
                  name="contraseña"
                  type="password"
                  placeholder="Mínimo 8 caracteres"
                  value={formData.contraseña}
                  onChange={handleFormChange}
                  required
                  minLength={8}
                  className="w-full p-2 rounded bg-gray-700 border border-gray-600 placeholder-gray-400 text-white"
                />
              </div>

              <div>
                <label htmlFor="rol" className="block mb-1">Rol en el sistema</label>
                <select
                  id="rol"
                  name="rol"
                  value={formData.rol}
                  onChange={handleFormChange}
                  required
                  className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white"
                >
                  <option value="">Seleccionar rol...</option>
                  <option value="administrador">Administrador</option>
                  <option value="encargado_inventario">Encargado de Inventario</option>
                  <option value="encargado_ti">Encargado de TI</option>
                </select>
              </div>

              <div className="flex justify-end space-x-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
                >
                  Crear Usuario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
