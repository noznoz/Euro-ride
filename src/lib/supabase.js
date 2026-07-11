import { createClient } from '@supabase/supabase-js'

// Backend connection for the Jeddah Chapter shared mode.
//
// The publishable (anon) key is SAFE to ship in the client — it only allows
// what the Row-Level-Security policies in supabase/schema.sql permit. The
// secret/service_role key must NEVER go here.
//
// These built-in defaults let the app run in shared mode straight from
// GitHub Pages without any GitHub secrets. Environment variables, when set,
// still override them (handy for pointing a local dev build at a test project).
const DEFAULT_URL = 'https://ftibsnbgmppwagjkjsvc.supabase.co'
const DEFAULT_ANON_KEY = 'sb_publishable_2LoA3Iz01mnQ3rauKXTmwQ_FDw-RiY2'

const url = import.meta.env.VITE_SUPABASE_URL || DEFAULT_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_ANON_KEY

// True whenever we have real credentials (defaults count).
export const isConfigured =
  !!url && !!anonKey &&
  url !== 'YOUR_SUPABASE_URL_HERE' &&
  anonKey !== 'YOUR_SUPABASE_ANON_KEY_HERE'

export const supabase = isConfigured
  ? createClient(url, anonKey)
  : createClient('https://placeholder.supabase.co', 'placeholder-anon-key')
