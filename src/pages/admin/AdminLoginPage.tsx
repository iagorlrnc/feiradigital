import { useState } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { ShoppingBag, Mail, Lock, AlertCircle, CheckCircle, Eye, EyeOff } from "lucide-react"
import { useAuthStore } from "../../store/authStore"
import { getSubdomainUrl } from "../../lib/subdomain"

export default function AdminLoginPage() {
  const { signIn, loading } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(location.state?.message || "")
  const [isValidating, setIsValidating] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setIsValidating(true)

    const { error } = await signIn(email, password)
    if (error) {
      setError(error)
      setIsValidating(false)
      return
    }

    // Aguardar o profile ser carregado (até 5 segundos)
    let attempts = 0
    const maxAttempts = 50 // 50 * 100ms = 5 segundos

    const checkProfile = setInterval(() => {
      attempts++

      const currentUser = useAuthStore.getState().user

      // Se o user foi carregado, redirecionar conforme role
      if (currentUser && currentUser.id) {
        clearInterval(checkProfile)
        setIsValidating(false)

        if (currentUser.role === "ceo") {
          // Redirecionar para CEO
          window.location.href = getSubdomainUrl("ceo", "/ceo/dashboard")
        } else {
          // Admin ou user - ficar no admin
          navigate("/admin/dashboard")
        }
        return
      }

      // Timeout
      if (attempts >= maxAttempts) {
        clearInterval(checkProfile)
        setError("Erro ao carregar perfil. Tente novamente.")
        setIsValidating(false)
      }
    }, 100)
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel - decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-gray-200 via-gray-200 to-gray-200 relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-palmas-blue rounded-lg -translate-y-1/2 translate-x-1/2 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-green-500 rounded-lg translate-y-1/2 -translate-x-1/2 blur-3xl" />
        </div>
        <div className="relative text-center">
          <div className="w-20 h-20 bg-palmas-blue rounded-md flex items-center justify-center shadow-2xl shadow-md mx-auto mb-6">
            <ShoppingBag size={36} className="text-white" />
          </div>
          <h1 className="font-display text-4xl font-bold text-palmas-text leading-tight">
            Gerencie sua
            <br />
            loja na feira
          </h1>
          <p className="mt-4 text-gray-600 max-w-xs">
            Acesse o painel para atualizar informações, posição no mapa e
            detalhes da sua banca.
          </p>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm animate-fade-in">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-9 h-9 bg-palmas-blue rounded-md flex items-center justify-center">
              <ShoppingBag size={18} className="text-white" />
            </div>
            <span className="font-display text-xl font-bold text-palmas-text">
              FeiraTech
            </span>
          </div>

          <div className="mb-8">
            <h2 className="font-display text-3xl font-bold text-palmas-text">
              Entrar
            </h2>
            <p className="text-gray-600 mt-2 text-sm">
              Acesse o painel do lojista
            </p>
          </div>

          {success && (
            <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/30 rounded-md text-green-500 text-sm mb-6 animate-scale-in">
              <CheckCircle size={16} className="flex-shrink-0" />
              {success}
            </div>
          )}

          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-md text-red-400 text-sm mb-6 animate-scale-in">
              <AlertCircle size={16} className="flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">E-mail</label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-11"
                  placeholder="seu@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="label">Senha</label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-11 pr-11"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || isValidating}
              className="btn-primary w-full mt-2"
            >
              {loading || isValidating ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-lg animate-spin" />
                  {loading ? "Entrando..." : "Verificando acesso..."}
                </span>
              ) : (
                "Entrar"
              )}
            </button>
          </form>

          <p className="text-center text-gray-500 text-sm mt-6">
            Ainda não tem conta?{" "}
            <Link
              to="/admin/register"
              className="text-palmas-blue hover:text-palmas-dark font-medium"
            >
              Cadastrar loja
            </Link>
          </p>

          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <Link
              to="/"
              className="text-gray-500 hover:text-gray-700 text-xs transition-colors"
            >
              ← Voltar para a feira
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
