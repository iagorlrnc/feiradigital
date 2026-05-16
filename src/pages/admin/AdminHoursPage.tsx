import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Clock, Save, AlertCircle, CheckCircle, Calendar, ArrowRight } from "lucide-react"
import { useAuthStore } from "../../store/authStore"
import { useStoreStore } from "../../store/storeStore"

const DAYS_OF_WEEK = [
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
  "Domingo",
]

interface DayHours {
  day: string
  open: string
  close: string
  closed: boolean
}

const DEFAULT_HOURS: DayHours[] = DAYS_OF_WEEK.map(day => ({
  day,
  open: "08:00",
  close: "18:00",
  closed: day === "Domingo"
}))

export default function AdminHoursPage() {
  const { user } = useAuthStore()
  const { myStore, fetchMyStore, updateStore } = useStoreStore()
  const navigate = useNavigate()

  const [hoursList, setHoursList] = useState<DayHours[]>(DEFAULT_HOURS)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    if (!user) {
      navigate("/")
      return
    }
    fetchMyStore(user.id)
  }, [user])

  useEffect(() => {
    if (myStore) {
      if (myStore.business_hours) {
        try {
          const savedHours = JSON.parse(myStore.business_hours)
          setHoursList(savedHours)
          setIsEditing(false)
        } catch (e) {
          // Fallback if it's plain text from previous version
          setIsEditing(true)
        }
      } else {
        setIsEditing(true)
      }
    }
  }, [myStore])

  const handleToggleDay = (index: number) => {
    if (!isEditing) return
    const newList = [...hoursList]
    newList[index].closed = !newList[index].closed
    setHoursList(newList)
  }

  const handleChangeTime = (index: number, field: 'open' | 'close', value: string) => {
    if (!isEditing) return
    const newList = [...hoursList]
    newList[index][field] = value
    setHoursList(newList)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !myStore) return

    setSaving(true)
    setError("")

    try {
      const { error: updateError } = await updateStore(myStore.id, {
        business_hours: JSON.stringify(hoursList),
      })

      if (updateError) throw new Error(updateError)

      setSuccess(true)
      setIsEditing(false)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar horários")
    } finally {
      setSaving(false)
    }
  }

  if (!myStore) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <div className="w-16 h-16 bg-palmas-blue/10 text-palmas-blue rounded-full flex items-center justify-center mb-4">
          <Clock size={32} />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Configure sua loja primeiro</h2>
        <p className="text-gray-500 max-w-sm mb-6">
          Você precisa configurar as informações básicas da sua loja antes de definir os horários.
        </p>
        <button onClick={() => navigate("/store")} className="btn-primary">
          Ir para Minha Loja
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto animate-fade-in mb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-palmas-text">Horário de Funcionamento</h1>
          <p className="text-gray-500 mt-1 text-sm">Organize os dias e turnos de atendimento ao público</p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-6 py-3 bg-palmas-blue text-white rounded-2xl text-sm font-bold shadow-lg shadow-palmas-blue/20 hover:-translate-y-0.5 transition-all"
          >
            Editar Horários
          </button>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm mb-6 animate-scale-in">
          <AlertCircle size={18} className="flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-100 rounded-2xl text-green-600 text-sm mb-6 animate-scale-in">
          <CheckCircle size={18} className="flex-shrink-0" />
          <p className="font-bold">Cronograma salvo com sucesso!</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card overflow-hidden">
          <div className="bg-gray-50/50 p-4 border-b border-gray-100 flex items-center gap-2 text-gray-500">
            <Calendar size={16} />
            <span className="text-xs font-bold uppercase tracking-widest">Grade de Horários</span>
          </div>

          <div className="divide-y divide-gray-100">
            {hoursList.map((item, index) => (
              <div
                key={item.day}
                className={`p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${item.closed ? 'bg-gray-50/30' : 'bg-white'}`}
              >
                <div className="flex items-center gap-4 min-w-[160px]">
                  <div
                    onClick={() => handleToggleDay(index)}
                    className={`w-12 h-6 rounded-full relative transition-colors cursor-pointer ${item.closed ? 'bg-gray-200' : 'bg-palmas-blue'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${item.closed ? 'left-1' : 'left-7'}`} />
                  </div>
                  <span className={`font-bold text-sm ${item.closed ? 'text-gray-400' : 'text-gray-700'}`}>
                    {item.day}
                  </span>
                </div>

                {!item.closed ? (
                  <div className="flex items-center gap-3">
                    <input
                      type="time"
                      value={item.open}
                      onChange={(e) => handleChangeTime(index, 'open', e.target.value)}
                      disabled={!isEditing}
                      className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-palmas-blue/20 outline-none transition-all disabled:opacity-50 disabled:bg-gray-50"
                    />
                    <ArrowRight size={14} className="text-gray-300" />
                    <input
                      type="time"
                      value={item.close}
                      onChange={(e) => handleChangeTime(index, 'close', e.target.value)}
                      disabled={!isEditing}
                      className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-palmas-blue/20 outline-none transition-all disabled:opacity-50 disabled:bg-gray-50"
                    />
                  </div>
                ) : (
                  <span className="text-xs font-black uppercase tracking-widest text-red-400 bg-red-50 px-3 py-1.5 rounded-lg border border-red-100">
                    Fechado
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {isEditing && (
          <div className="flex items-center gap-4 animate-fade-in">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary flex-1 flex items-center justify-center gap-2 h-14"
            >
              {saving ? "Processando..." : (
                <>
                  <Save size={20} /> Finalizar e Publicar
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                if (myStore.business_hours) {
                  setHoursList(JSON.parse(myStore.business_hours))
                }
                setIsEditing(false)
              }}
              className="btn-secondary h-14 px-10"
            >
              Descartar
            </button>
          </div>
        )}
      </form>

    </div>
  )
}
