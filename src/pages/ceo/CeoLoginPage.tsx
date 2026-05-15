import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Crown, Mail, Lock, AlertCircle, Eye, EyeOff } from "lucide-react"
import { useAuthStore } from "../../store/authStore"

export default function CeoLoginPage() {
  const { signIn, loading } = useAuthStore()
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isValidating, setIsValidating] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setIsValidating(true)

    const { error: signInError } = await signIn(email, password)
    if (signInError) {
      setError(signInError)
      setIsValidating(false)
      return
    }

    // Aguardar o profile ser carregado (até 5 segundos)
    let attempts = 0
    const maxAttempts = 50 // 50 * 100ms = 5 segundos

    const checkProfile = setInterval(() => {
      attempts++

      const currentUser = useAuthStore.getState().user

      // Se o user foi carregado, validar role
      if (currentUser && currentUser.id) {
        clearInterval(checkProfile)

        if (currentUser.role !== "ceo") {
          setError("Acesso negado. Apenas contas Dev podem acessar esta área.")
          setIsValidating(false)
          return
        }

        // Login bem-sucedido e role correto
        setIsValidating(false)
        navigate("/dashboard")
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
    <div className="min-h-screen flex items-center justify-center p-6">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-green-500/5 rounded-lg blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-palmas-blue to-palmas-dark rounded-md flex items-center justify-center shadow-2xl shadow-md mx-auto mb-4">
            <Crown size={28} className="text-white" />
          </div>
          <h1 className="font-display text-3xl font-bold text-palmas-text">
            Dev Panel
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Acesso restrito à administração
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-md text-red-400 text-sm mb-6 animate-scale-in">
            <AlertCircle size={16} className="flex-shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
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
                placeholder="dev@feira.com"
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
              "Acessar painel"
            )}
          </button>
        </form>

        <p className="text-center text-gray-500 text-xs mt-6">
          Acesso exclusivo para administradores Dev
        </p>
      </div>
    </div>
  )
}
