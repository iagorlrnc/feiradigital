import { useState, useEffect } from 'react'
import { Save, Shield, Globe, Info, Calendar, Users } from 'lucide-react'
import { useSettingsStore } from '../../store/settingsStore'

export default function CeoSettingsPage() {
  const { settings, fetchSettings, updateSettings } = useSettingsStore()
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    fair_name: '',
    domain: '',
    description: '',
    approval_required: true,
    start_date: '',
    end_date: '',
    visitor_count_display: ''
  })

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  useEffect(() => {
    if (settings) {
      setFormData({
        fair_name: settings.fair_name || '',
        domain: settings.domain || '',
        description: settings.description || '',
        approval_required: settings.approval_required,
        start_date: settings.start_date || '',
        end_date: settings.end_date || '',
        visitor_count_display: settings.visitor_count_display || ''
      })
    }
  }, [settings])

  const handleSave = async () => {
    setSaving(true)
    const { error } = await updateSettings(formData)
    setSaving(false)
    if (error) alert('Erro ao salvar: ' + error)
    else alert('Configurações salvas com sucesso!')
  }

  return (
    <div className="animate-fade-in max-w-4xl pb-20">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-palmas-text">Configurações do Sistema</h1>
        <p className="text-gray-600 mt-1">Gerencie as preferências globais da plataforma</p>
      </div>

      <div className="space-y-6">
        {/* General Settings */}
        <div className="card p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-palmas-blue/10 rounded-2xl flex items-center justify-center text-palmas-blue shadow-sm">
              <Globe size={24} />
            </div>
            <div>
              <h2 className="font-bold text-gray-800 text-lg">Informações da Feira</h2>
              <p className="text-xs text-gray-500">Dados públicos exibidos no site</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div className="sm:col-span-1">
              <label className="label">Nome da Feira</label>
              <input 
                type="text" 
                className="input-field" 
                value={formData.fair_name}
                onChange={e => setFormData({ ...formData, fair_name: e.target.value })}
              />
            </div>
            <div className="sm:col-span-1">
              <label className="label">Domínio Principal</label>
              <input 
                type="text" 
                className="input-field" 
                value={formData.domain}
                onChange={e => setFormData({ ...formData, domain: e.target.value })}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Descrição da Home</label>
              <textarea 
                className="input-field resize-none h-32" 
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Dates & Stats */}
        <div className="card p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600 shadow-sm">
              <Calendar size={24} />
            </div>
            <div>
              <h2 className="font-bold text-gray-800 text-lg">Período e Estatísticas</h2>
              <p className="text-xs text-gray-500">Datas do evento e números de destaque</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            <div>
              <label className="label">Início da Feira</label>
              <input 
                type="date" 
                className="input-field" 
                value={formData.start_date}
                onChange={e => setFormData({ ...formData, start_date: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Término da Feira</label>
              <input 
                type="date" 
                className="input-field" 
                value={formData.end_date}
                onChange={e => setFormData({ ...formData, end_date: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Visitantes (Exibição)</label>
              <div className="relative">
                <Users size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  className="input-field pl-11" 
                  placeholder="Ex: 15k+"
                  value={formData.visitor_count_display}
                  onChange={e => setFormData({ ...formData, visitor_count_display: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Security & Access */}
        <div className="card p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center text-red-600 shadow-sm">
              <Shield size={24} />
            </div>
            <div>
              <h2 className="font-bold text-gray-800 text-lg">Segurança e Fluxo</h2>
              <p className="text-xs text-gray-500">Controle de acesso e aprovações</p>
            </div>
          </div>

          <div className="space-y-4">
            <label className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl cursor-pointer hover:bg-gray-100 transition-all border border-transparent hover:border-gray-200">
              <input 
                type="checkbox" 
                className="w-5 h-5 text-palmas-blue rounded-lg border-gray-300"
                checked={formData.approval_required}
                onChange={e => setFormData({ ...formData, approval_required: e.target.checked })}
              />
              <div>
                <div className="text-sm font-bold text-gray-900">Aprovação Manual Obrigatória</div>
                <div className="text-xs text-gray-500">Novas lojas precisam de aprovação do CEO para serem exibidas publicamente</div>
              </div>
            </label>
          </div>
        </div>

        {/* Save Bar */}
        <div className="sticky bottom-4 left-0 right-0 flex items-center justify-between p-5 bg-palmas-dark rounded-3xl shadow-2xl z-50 border border-white/10 backdrop-blur-md">
          <div className="flex items-center gap-3 text-white/70 text-xs px-2">
            <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
              <Info size={16} />
            </div>
            <div>
              <p className="font-bold text-white">Pronto para salvar?</p>
              <p>As alterações refletirão na Home instantaneamente.</p>
            </div>
          </div>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="bg-palmas-blue hover:bg-palmas-blue/90 text-white py-3 px-8 rounded-2xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-palmas-blue/20 transition-all active:scale-95 disabled:opacity-50"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save size={18} />
            )}
            Salvar Alterações
          </button>
        </div>
      </div>
    </div>
  )
}

