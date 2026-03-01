// supabaseClient.js
import { createClient } from '@supabase/supabase-js'

// Reemplaza con tu URL y Anon Key reales obtenidos de Supabase
const supabaseUrl = 'https://qnvryqtnvsnhfpinktpv.supabase.co'
const supabaseAnonKey = 'sb_publishable_Kbcc-smHVSde5Y5F1U4JDQ_V4ot0X3J'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)