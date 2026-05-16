import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Profile {
  id: string
  email: string
  full_name: string
  phone: string
  role: 'ceo' | 'admin' | 'user'
  created_at: string
}

export interface Store {
  id: string
  owner_id: string
  name: string
  description: string
  category: string
  logo_url?: string
  banner_url?: string
  phone?: string
  instagram?: string
  whatsapp?: string
  booth_x: number
  booth_y: number
  booth_label: string
  status: 'pending' | 'active' | 'suspended'
  plan: 'basico' | 'profissional' | 'premium'
  is_featured: boolean
  business_hours?: string
  gallery?: string[]
  created_at: string
  updated_at: string
  offer_expires_at?: string
  cooldown_expires_at?: string
  profiles?: Profile
  products?: Product[]
}

export interface Product {
  id: string
  store_id: string
  name: string
  description?: string
  price: number
  image_url?: string
  is_active: boolean
  created_at: string
}

export interface FairSettings {
  id: string
  fair_name: string
  domain?: string
  description?: string
  approval_required: boolean
  theme_color: string
  start_date: string
  end_date: string
  visitor_count_display: string
  updated_at: string
}

export type StoreCategory =
  | 'alimentacao'
  | 'moda'
  | 'artesanato'
  | 'eletronicos'
  | 'beleza'
  | 'servicos'
  | 'outros'

export const CATEGORY_LABELS: Record<StoreCategory, string> = {
  alimentacao: 'Alimentação',
  moda: 'Moda',
  artesanato: 'Artesanato',
  eletronicos: 'Eletrônicos',
  beleza: 'Beleza',
  servicos: 'Serviços',
  outros: 'Outros',
}

export const CATEGORY_ICONS: Record<StoreCategory, string> = {
  alimentacao: '🍽️',
  moda: '👗',
  artesanato: '🎨',
  eletronicos: '📱',
  beleza: '💄',
  servicos: '🔧',
  outros: '📦',
}
