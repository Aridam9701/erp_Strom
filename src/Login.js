import React, { useState } from 'react'
import { supabase } from './supabaseClient'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    else setError('')
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
      <form onSubmit={handleLogin} className="bg-gray-800 p-8 rounded max-w-md w-full">
        <h2 className="text-2xl mb-6 font-semibold">Iniciar Sesión</h2>

        <label className="block mb-1" htmlFor="email">Correo</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full p-2 rounded bg-gray-700 mb-4 text-white border border-gray-600"
          required
        />

        <label className="block mb-1" htmlFor="password">Contraseña</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full p-2 rounded bg-gray-700 mb-4 text-white border border-gray-600"
          required
        />

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <button type="submit" className="bg-blue-600 w-full py-2 rounded hover:bg-blue-700 font-semibold">
          Entrar
        </button>
      </form>
    </div>
  )
}