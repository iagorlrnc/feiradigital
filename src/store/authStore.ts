import { create } from "zustand"
import { supabase, type Profile } from "../lib/supabase"

interface AuthState {
  user: Profile | null
  loading: boolean
  initialized: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signUp: (data: SignUpData) => Promise<{ data: any; error: string | null }>
  signOut: () => Promise<void>
  fetchProfile: (userId: string) => Promise<void>
  init: () => Promise<void>
}

interface SignUpData {
  email: string
  password: string
  full_name: string
  phone: string
  role?: "admin" | "ceo"
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: false,
  initialized: false,

  init: async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session?.user) {
        await get().fetchProfile(session.user.id)
      }
    } catch (err) {
      console.error("Auth init error:", err)
    } finally {
      set({ initialized: true })
    }

    supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await get().fetchProfile(session.user.id)
      } else {
        set({ user: null })
      }
    })
  },

  fetchProfile: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single()
      
      if (error) throw error
      if (data) set({ user: data })
    } catch (err) {
      console.error("Error fetching profile:", err)
      // On error, we might want to clear user to avoid stale state
      set({ user: null })
    }
  },

  signIn: async (email, password) => {
    set({ loading: true })
    try {
      const normalizedEmail = email.trim().toLowerCase()

      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      })

      if (error) {
        set({ loading: false })
        const rawMessage = error.message ?? "Erro ao entrar"

        if (rawMessage.toLowerCase().includes("invalid login credentials")) {
          return { error: "Credenciais inválidas. Verifique e-mail e senha." }
        }

        if (rawMessage.toLowerCase().includes("email not confirmed")) {
          return {
            error: "E-mail não confirmado. Verifique sua caixa de entrada.",
          }
        }

        return { error: rawMessage }
      }

      const authUserId = data?.user?.id
      if (authUserId) {
        await get().fetchProfile(authUserId)
      }

      set({ loading: false })
      return { error: null }
    } catch (err) {
      set({ loading: false })
      return { error: err instanceof Error ? err.message : "Erro ao entrar" }
    }
  },

  signUp: async ({ email, password, full_name, phone, role = "admin" }) => {
    set({ loading: true })
    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name, phone, role } },
      })

      if (authError) {
        return { data: null, error: authError.message ?? "Erro ao cadastrar" }
      }

      return { data, error: null }
    } catch (err) {
      return { 
        data: null, 
        error: err instanceof Error ? err.message : "Erro inesperado ao cadastrar" 
      }
    } finally {
      set({ loading: false })
    }
  },

  signOut: async () => {
    try {
      await supabase.auth.signOut()
    } catch (err) {
      console.error("Error signing out:", err)
    } finally {
      set({ user: null })
      localStorage.clear()
      sessionStorage.clear()
    }
  },
}))
