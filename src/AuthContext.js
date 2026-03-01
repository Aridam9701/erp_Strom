import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [rol, setRol] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setUser(data.session.user)
        fetchUserRol(data.session.user.id)
      } else {
        setUser(null)
        setRol(null)
      }
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user)
        fetchUserRol(session.user.id)
      } else {
        setUser(null)
        setRol(null)
      }
      setLoading(false)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  const fetchUserRol = async (userId) => {
    const { data, error } = await supabase
      .from('usuarios')
      .select('rol')
      .eq('id', userId)
      .single()
    if (!error && data?.rol) {
      setRol(data.rol)
    } else {
      setRol(null)
    }
  }

  return (
    <AuthContext.Provider value={{ user, rol, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)