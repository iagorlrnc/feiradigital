import { useEffect, useState } from 'react'
import { Users, Search, Mail, Phone, Calendar, ShieldCheck, ShieldOff, Trash2 } from 'lucide-react'
import { supabase, type Profile } from '../../lib/supabase'

export default function CeoAccountsPage() {
  const [accounts, setAccounts] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  async function fetchAccounts() {
    setLoading(true)
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'admin')
      .order('created_at', { ascending: false })
    setAccounts(data ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchAccounts() }, [])

  async function handleDelete(id: string) {
    try {
      const { error } = await supabase.from('profiles').delete().eq('id', id)
      if (error) throw error
      
      alert('Conta removida com sucesso!')
      setConfirmDelete(null)
      fetchAccounts()
    } catch (err) {
      console.error('Error deleting account:', err)
      alert('Erro ao excluir conta. Verifique se você tem permissões de CEO.')
      setConfirmDelete(null)
    }
  }

  const filtered = accounts.filter(a =>
    !search ||
    a.full_name.toLowerCase().includes(search.toLowerCase()) ||
    a.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold text-palmas-text">Contas Admin</h1>
        <p className="text-gray-600 mt-1 text-sm">Controle de acesso dos lojistas cadastrados</p>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          placeholder="Buscar por nome ou e-mail..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input-field pl-11"
        />
      </div>

      {/* Stats */}
      <div className="flex items-center gap-3 mb-6">
        <div className="badge bg-gray-100 text-gray-700 border border-gray-300">
          <Users size={12} /> {accounts.length} contas
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Carregando contas...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-4xl mb-3">👥</div>
            <p className="text-gray-500">Nenhuma conta encontrada</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200/50">
            {filtered.map(account => (
              <div key={account.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-100 transition-colors">
                {/* Avatar */}
                <div className="w-10 h-10 bg-gradient-to-br from-palmas-blue to-palmas-dark rounded-md flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {(account.full_name || account.email).charAt(0).toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-palmas-text text-sm">{account.full_name || '(sem nome)'}</div>
                  <div className="flex flex-wrap items-center gap-3 mt-1">
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <Mail size={11} /> {account.email}
                    </span>
                    {account.phone && (
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <Phone size={11} /> {account.phone}
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <Calendar size={11} /> {new Date(account.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>

                {/* Role badge */}
                <span className="badge bg-gray-100 text-gray-700 border border-gray-300 text-xs hidden sm:flex">
                  <ShieldCheck size={11} /> Admin
                </span>

                {/* Delete */}
                <button
                  onClick={() => setConfirmDelete(account.id)}
                  className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                  title="Remover conta"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info box */}
      <div className="mt-6 p-4 bg-white border border-gray-200 rounded-md text-sm text-gray-500">
        <p className="flex items-center gap-2">
          <ShieldOff size={14} />
          Para revogar acesso completamente, exclua a conta. O usuário não poderá mais fazer login.
        </p>
      </div>

      {/* Confirm delete modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setConfirmDelete(null)} />
          <div className="relative card p-6 max-w-sm w-full animate-scale-in">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-500/20 rounded-md flex items-center justify-center mx-auto mb-4">
                <Trash2 size={20} className="text-red-400" />
              </div>
              <h3 className="font-display text-lg font-semibold text-palmas-text mb-2">Remover conta</h3>
              <p className="text-gray-600 text-sm mb-6">
                O lojista perderá o acesso ao painel. As lojas associadas precisarão ser gerenciadas manualmente.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmDelete(null)} className="btn-secondary flex-1">Cancelar</button>
                <button
                  onClick={() => handleDelete(confirmDelete)}
                  className="flex-1 bg-red-600 hover:bg-red-500 text-white font-medium px-4 py-3 rounded-md transition-all"
                >
                  Remover
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
