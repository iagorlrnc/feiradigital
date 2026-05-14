import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  ShoppingBag,
  User,
  Mail,
  Lock,
  Phone,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  ChevronRight,
  ChevronLeft,
} from "lucide-react"
import { useAuthStore } from "../../store/authStore"

const STEPS = ["Dados Pessoais", "Dados de Acesso", "Confirmação"]

export default function AdminRegisterPage() {
  const { signUp } = useAuthStore()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    email: "",
    password: "",
    confirm_password: "",
  })

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setError("")
  }

  function validateStep() {
    if (step === 0) {
      if (!form.full_name.trim()) return "Digite seu nome completo"
      if (!form.phone.trim()) return "Digite seu telefone"
    }
    if (step === 1) {
      if (!form.email.trim()) return "Digite seu e-mail"
      if (form.password.length < 6)
        return "Senha deve ter pelo menos 6 caracteres"
      if (form.password !== form.confirm_password)
        return "As senhas não coincidem"
    }
    return null
  }

  function nextStep() {
    const err = validateStep()
    if (err) {
      setError(err)
      return
    }
    setStep((s) => s + 1)
  }

  const [localLoading, setLocalLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const err = validateStep()
    if (err) {
      setError(err)
      return
    }

    setLocalLoading(true)
    setError("")

    try {
      const result = await signUp({
        email: form.email,
        password: form.password,
        full_name: form.full_name,
        phone: form.phone,
        role: "admin",
      })

      if (result.error) {
        setError(result.error)
        setLocalLoading(false)
        return
      }

      // Se chegamos aqui, os dados foram enviados com sucesso
      if (result.data?.session) {
        navigate("/admin/dashboard")
      } else {
        // Redireciona para login informando que deu certo
        navigate("/admin/login", { 
          state: { message: "Cadastro realizado com sucesso! Faça login para continuar." } 
        })
      }
    } catch (err) {
      setError("Erro inesperado ao cadastrar. Tente fazer login.")
    } finally {
      setLocalLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-9 h-9 bg-palmas-blue rounded-md flex items-center justify-center">
            <ShoppingBag size={18} className="text-white" />
          </div>
          <span className="font-display text-xl font-bold text-palmas-text">
            FeiraTech
          </span>
        </div>

        <div className="mb-8">
          <h2 className="font-display text-3xl font-bold text-palmas-text">
            Cadastrar loja
          </h2>
          <p className="text-gray-600 mt-2 text-sm">
            Crie sua conta de lojista na feira
          </p>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((label, i) => (
            <div key={i} className="flex items-center gap-2 flex-1">
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-all flex-shrink-0 ${
                  i < step
                    ? "bg-green-600 text-white"
                    : i === step
                      ? "bg-palmas-blue text-white shadow-lg shadow-md"
                      : "bg-gray-100 text-gray-500"
                }`}
              >
                {i < step ? <CheckCircle size={14} /> : i + 1}
              </div>
              <span
                className={`text-xs hidden sm:block transition-colors ${i === step ? "text-gray-800" : "text-gray-500"}`}
              >
                {label}
              </span>
              {i < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-px transition-colors ${i < step ? "bg-green-600" : "bg-gray-200"}`}
                />
              )}
            </div>
          ))}
        </div>

        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-md text-red-400 text-sm mb-6 animate-scale-in">
            <AlertCircle size={16} className="flex-shrink-0" />
            {error}
          </div>
        )}

        <form
          onSubmit={
            step === 2
              ? handleSubmit
              : (e) => {
                  e.preventDefault()
                  nextStep()
                }
          }
          className="card p-6 space-y-4"
        >
          {/* Step 0: Personal data */}
          {step === 0 && (
            <>
              <div>
                <label className="label">Nome completo *</label>
                <div className="relative">
                  <User
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                  />
                  <input
                    type="text"
                    value={form.full_name}
                    onChange={(e) => update("full_name", e.target.value)}
                    className="input-field pl-11"
                    placeholder="Seu nome completo"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="label">Telefone *</label>
                <div className="relative">
                  <Phone
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                  />
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    className="input-field pl-11"
                    placeholder="(00) 00000-0000"
                    required
                  />
                </div>
              </div>
            </>
          )}

          {/* Step 1: Access data */}
          {step === 1 && (
            <>
              <div>
                <label className="label">E-mail *</label>
                <div className="relative">
                  <Mail
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                  />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    className="input-field pl-11"
                    placeholder="seu@email.com"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="label">Senha *</label>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => update("password", e.target.value)}
                    className="input-field pl-11 pr-11"
                    placeholder="Mínimo 6 caracteres"
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
              <div>
                <label className="label">Confirmar senha *</label>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                  />
                  <input
                    type="password"
                    value={form.confirm_password}
                    onChange={(e) => update("confirm_password", e.target.value)}
                    className="input-field pl-11"
                    placeholder="Repita a senha"
                    required
                  />
                </div>
              </div>
            </>
          )}

          {/* Step 2: Confirmation */}
          {step === 2 && (
            <div className="space-y-3">
              <h3 className="font-medium text-gray-800">
                Confirme seus dados
              </h3>
              <div className="space-y-2 text-sm">
                {[
                  { label: "Nome", value: form.full_name },
                  { label: "Telefone", value: form.phone },
                  { label: "E-mail", value: form.email },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="flex justify-between items-center py-2 border-b border-gray-200"
                  >
                    <span className="text-gray-500">{label}</span>
                    <span className="text-gray-800 font-medium">{value}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-3">
                Após o cadastro, você poderá configurar os detalhes da sua loja
                e escolher sua posição no mapa da feira. A aprovação final é
                feita pela administração.
              </p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            {step > 0 && (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="btn-secondary flex items-center gap-2"
              >
                <ChevronLeft size={16} /> Voltar
              </button>
            )}
            <button
              type="submit"
              disabled={localLoading}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              {localLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-lg animate-spin" />
                  Cadastrando...
                </>
              ) : step < 2 ? (
                <>
                  Continuar <ChevronRight size={16} />
                </>
              ) : (
                <>
                  Criar conta <CheckCircle size={16} />
                </>
              )}
            </button>
          </div>
        </form>

        <p className="text-center text-gray-500 text-sm mt-6">
          Já tem conta?{" "}
          <Link
            to="/admin/login"
            className="text-palmas-blue hover:text-palmas-dark font-medium"
          >
            Entrar
          </Link>
        </p>
      </div>
    </div>
  )
}
