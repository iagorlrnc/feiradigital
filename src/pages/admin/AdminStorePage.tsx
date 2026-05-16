import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import {
  Save,
  MapPin,
  Store,
  AlertCircle,
  CheckCircle,
  Phone,
  Instagram,
  MessageCircle,
  Info,
  Camera,
  Loader2,
  Star,
  Plus,
  X,
  Image as ImageIcon,
} from "lucide-react"
import { useAuthStore } from "../../store/authStore"
import { useStoreStore } from "../../store/storeStore"
import FairMap from "../../components/FairMap"
import { CATEGORY_LABELS, supabase } from "../../lib/supabase"

const AISLES_X = [3, 7]
const AISLES_Y = [3]

function isAisle(x: number, y: number) {
  return AISLES_X.includes(x) || AISLES_Y.includes(y)
}

function posToLabel(x: number, y: number) {
  return `${String.fromCharCode(65 + y)}${x + 1}`
}

export default function AdminStorePage() {
  const { user } = useAuthStore()
  const {
    myStores,
    activeStoreId,
    stores,
    fetchMyStore,
    fetchAllStores,
    createStore,
    updateStore,
    setActiveStoreId,
    resetActiveStoreId,
  } = useStoreStore()
  
  const myStore = myStores.find(s => s.id === activeStoreId) || null
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "outros",
    phone: "",
    instagram: "",
    whatsapp: "",
    logo_url: "",
    banner_url: "",
    booth_x: 0,
    booth_y: 0,
    booth_label: "A1",
    is_featured: false,
    gallery: [] as string[],
  })
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState<'logo' | 'banner' | null>(null)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState<"info" | "map">("info")
  const [editingPos, setEditingPos] = useState<{ x: number; y: number } | null>(
    null,
  )

  const logoInputRef = useRef<HTMLInputElement>(null)
  const bannerInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!user) {
      navigate("/")
      return
    }
    fetchMyStore(user.id)
    fetchAllStores()
  }, [user])

  useEffect(() => {
    if (myStore) {
      setForm({
        name: myStore.name,
        description: myStore.description ?? "",
        category: myStore.category,
        phone: myStore.phone ?? "",
        instagram: myStore.instagram ?? "",
        whatsapp: myStore.whatsapp ?? "",
        logo_url: myStore.logo_url ?? "",
        banner_url: myStore.banner_url ?? "",
        booth_x: myStore.booth_x,
        booth_y: myStore.booth_y,
        booth_label: myStore.booth_label,
        is_featured: myStore.is_featured ?? false,
        gallery: myStore.gallery ?? [],
      })
      setEditingPos({ x: myStore.booth_x, y: myStore.booth_y })
      setIsEditing(false)
    } else {
      // Clear form for new store
      setForm({
        name: "",
        description: "",
        category: "outros",
        phone: "",
        instagram: "",
        whatsapp: "",
        logo_url: "",
        banner_url: "",
        booth_x: 0,
        booth_y: 0,
        booth_label: "A1",
        is_featured: false,
        gallery: [],
      })
      setEditingPos(null)
      setIsEditing(true)
    }
  }, [myStore, activeStoreId])

  function update(field: string, value: string | number | boolean | string[]) {
    if (!isEditing) return
    setForm((prev) => ({ ...prev, [field]: value }))
    setError("")
    setSuccess(false)
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'banner') {
    if (!isEditing) return
    const file = e.target.files?.[0]
    if (!file || !user) return

    setUploading(type)
    setError("")

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${type}_${Math.random()}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('store-assets')
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('store-assets')
        .getPublicUrl(filePath)

      update(type === 'logo' ? 'logo_url' : 'banner_url', publicUrl)
    } catch (err) {
      console.error(err)
      setError("Erro ao fazer upload da imagem. Verifique se o bucket 'store-assets' existe e tem permissão pública.")
    } finally {
      setUploading(null)
    }
  }

  async function handleGalleryUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!isEditing) return
    const files = e.target.files
    if (!files || files.length === 0 || !user) return

    const remainingSlots = 5 - form.gallery.length
    if (remainingSlots <= 0) {
      setError("Você já atingiu o limite de 5 fotos na galeria.")
      return
    }

    const filesToUpload = Array.from(files).slice(0, remainingSlots)
    setSaving(true)

    try {
      const newUrls = [...form.gallery]

      for (const file of filesToUpload) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${user.id}/gallery_${Math.random()}.${fileExt}`
        const filePath = `${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('store-assets')
          .upload(filePath, file, { upsert: true })

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('store-assets')
          .getPublicUrl(filePath)

        newUrls.push(publicUrl)
      }

      update('gallery', newUrls)
    } catch (err) {
      console.error(err)
      setError("Erro ao fazer upload das imagens da galeria.")
    } finally {
      setSaving(false)
    }
  }

  function removeGalleryImage(index: number) {
    if (!isEditing) return
    const newGallery = [...form.gallery]
    newGallery.splice(index, 1)
    update('gallery', newGallery)
  }

  function handleSelectPosition(x: number, y: number) {
    if (!isEditing) return
    if (isAisle(x, y)) return
    const occupied = stores.find(
      (s) => s.booth_x === x && s.booth_y === y && s.id !== myStore?.id,
    )
    if (occupied) {
      setError(`A posição ${posToLabel(x, y)} já está ocupada pela loja "${occupied.name}"`)
      return
    }
    setEditingPos({ x, y })
    setForm(prev => ({
      ...prev,
      booth_x: x,
      booth_y: y,
      booth_label: posToLabel(x, y),
    }))
    setError("")
  }

  function handleMapSelectStore(store: any) {
    if (store && myStores.some(s => s.id === store.id)) {
      setActiveStoreId(store.id)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) {
      setError("Você precisa estar autenticado")
      return
    }
    if (!form.name.trim()) {
      setError("Nome da loja é obrigatório")
      return
    }
    if (!editingPos) {
      setError("Selecione uma posição no mapa")
      return
    }

    setSaving(true)
    setError("")

    try {
      const storeData = {
        name: form.name.trim(),
        description: form.description,
        category: form.category,
        phone: form.phone,
        instagram: form.instagram,
        whatsapp: form.whatsapp,
        logo_url: form.logo_url,
        banner_url: form.banner_url,
        owner_id: user.id,
        booth_x: editingPos.x,
        booth_y: editingPos.y,
        booth_label: posToLabel(editingPos.x, editingPos.y),
        is_featured: form.is_featured,
        gallery: form.gallery,
      }

      console.log("Saving store data...", storeData)
      const result = myStore
        ? await updateStore(myStore.id, storeData)
        : await createStore({ ...storeData, status: "pending" })

      if (result.error) {
        throw new Error(result.error)
      }

      setSuccess(true)
      setIsEditing(false)

      // Fetch fresh data but don't let it block the UI if it's slow
      fetchMyStore(user.id).catch(console.error)
      fetchAllStores().catch(console.error)

      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      console.error("Error saving store:", err)
      setError(err instanceof Error ? err.message : "Erro inesperado ao salvar")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={`${activeTab === 'map' ? 'max-w-5xl' : 'max-w-2xl'} mx-auto animate-fade-in transition-all duration-500`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-palmas-text">
            {myStore ? "Minha Loja" : "Configurar loja"}
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            {myStore
              ? "Gerencie as informações públicas da sua banca"
              : "Configure sua presença na feira digital"}
          </p>
        </div>
        {myStore && (
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${isEditing
                ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                : "bg-palmas-blue text-white shadow-lg shadow-palmas-blue/20 hover:-translate-y-0.5"
              }`}
          >
            {isEditing ? "Cancelar Edição" : "Editar Informações"}
          </button>
        )}
      </div>

      {/* Store Selector (Loja 1, Loja 2) */}
      {(myStores.length > 0 || !activeStoreId) && (
        <div className="flex gap-2 mb-4 p-1 bg-white rounded-2xl border border-gray-100 shadow-sm mt-8">
          {myStores.map((s, index) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setActiveStoreId(s.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
                activeStoreId === s.id
                  ? "bg-palmas-dark text-white shadow-lg"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Store size={16} />
              Loja {index + 1}
            </button>
          ))}
          {myStores.length < 2 && (
            <button
              type="button"
              onClick={() => {
                resetActiveStoreId()
                setActiveTab('info')
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
                !activeStoreId
                  ? "bg-palmas-blue text-white shadow-lg"
                  : "text-gray-400 border border-dashed border-gray-200 hover:bg-gray-50"
              }`}
            >
              <Plus size={16} />
              Nova Loja
            </button>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-white rounded-2xl border border-gray-100 mb-8 shadow-sm">
        {(["info", "map"] as const).map((tab) => (
          <button
            type="button"
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === tab
              ? "bg-palmas-blue text-white shadow-lg shadow-palmas-blue/20"
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
          >
            {tab === "info" ? (
              <><Store size={16} /> Informações</>
            ) : (
              <><MapPin size={16} /> Posição no Mapa</>
            )}
          </button>
        ))}
      </div>

      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm mb-6 animate-scale-in">
          <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Atenção</p>
            <p className="opacity-90">{error}</p>
          </div>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-100 rounded-2xl text-green-600 text-sm mb-6 animate-scale-in">
          <CheckCircle size={18} className="flex-shrink-0" />
          <p className="font-bold text-green-700">Dados salvos com sucesso!</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {activeTab === "info" && (
          <div className="space-y-6">
            {/* Imagens (Banner e Logo) */}
            <div className="card overflow-hidden">
              <div
                className={`h-48 bg-gray-100 relative group transition-all ${isEditing ? 'cursor-pointer' : 'cursor-default'}`}
                onClick={() => isEditing && bannerInputRef.current?.click()}
              >
                {form.banner_url ? (
                  <img src={form.banner_url} alt="Banner" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-2">
                    <Camera size={32} />
                    <span className="text-xs font-bold uppercase tracking-widest">Adicionar Capa</span>
                  </div>
                )}
                <div className={`absolute inset-0 bg-black/40 ${isEditing ? 'opacity-0 group-hover:opacity-100' : 'opacity-0'} transition-opacity flex items-center justify-center text-white text-sm font-bold`}>
                  {uploading === 'banner' ? <Loader2 className="animate-spin" /> : 'Alterar Capa'}
                </div>
                <input
                  ref={bannerInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, 'banner')}
                />
              </div>

              <div className="px-8 pb-8">
                <div className="relative -mt-12 mb-6 flex items-end gap-6">
                  <div
                    className={`w-24 h-24 bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all border-4 border-white overflow-hidden group relative ${isEditing ? 'cursor-pointer' : 'cursor-default'}`}
                    onClick={() => isEditing && logoInputRef.current?.click()}
                  >
                    {form.logo_url ? (
                      <img src={form.logo_url} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <Camera size={24} />
                      </div>
                    )}
                    <div className={`absolute inset-0 bg-black/40 ${isEditing ? 'opacity-0 group-hover:opacity-100' : 'opacity-0'} transition-opacity flex items-center justify-center text-white text-[10px] font-bold`}>
                      {uploading === 'logo' ? <Loader2 className="animate-spin" /> : 'LOGO'}
                    </div>
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, 'logo')}
                    />
                  </div>
                  <div className="pb-2">
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Status da Loja</p>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${myStore?.status === 'active' ? 'bg-green-50 text-green-600 border-green-100' :
                      myStore?.status === 'pending' ? 'bg-yellow-50 text-yellow-600 border-yellow-100' :
                        'bg-red-50 text-red-600 border-red-100'
                      }`}>
                      {myStore?.status === 'active' ? 'Publicada' : myStore?.status === 'pending' ? 'Em Análise' : 'Suspensa'}
                    </span>
                  </div>
                </div>

                <div className="grid gap-6">
                  <div>
                    <label className="label">Nome da loja *</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => update("name", e.target.value)}
                      className="input-field"
                      placeholder="Ex: Barraca da Dona Maria"
                      required
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <label className="label">Categoria</label>
                      <select
                        value={form.category}
                        onChange={(e) => update("category", e.target.value)}
                        className="input-field"
                        disabled={!isEditing}
                      >
                        {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                          <option key={key} value={key}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="label">Banca Selecionada</label>
                      <div className="input-field bg-gray-50 flex items-center justify-between text-gray-500 font-bold">
                        <span>{form.booth_label || 'Não selecionada'}</span>
                        <button type="button" onClick={() => setActiveTab('map')} disabled={!isEditing} className={`text-xs hover:underline ${isEditing ? 'text-palmas-blue' : 'text-gray-400 cursor-not-allowed'}`}>Alterar no mapa</button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="label">Descrição da Loja</label>
                    <textarea
                      value={form.description}
                      onChange={(e) => update("description", e.target.value)}
                      className="input-field resize-none h-32"
                      placeholder="Descreva sua loja, produtos e diferenciais..."
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <label className="label">Telefone de Contato</label>
                      <div className="relative">
                        <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="tel"
                          value={form.phone}
                          onChange={(e) => update("phone", e.target.value)}
                          className="input-field pl-11"
                          placeholder="(00) 00000-0000"
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="label">WhatsApp (Link Direto)</label>
                      <div className="relative">
                        <MessageCircle size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="tel"
                          value={form.whatsapp}
                          onChange={(e) => update("whatsapp", e.target.value)}
                          className="input-field pl-11"
                          placeholder="Ex: 5563984000000"
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="label">Instagram (@usuario)</label>
                    <div className="relative">
                      <Instagram size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={form.instagram}
                        onChange={(e) => update("instagram", e.target.value)}
                        className="input-field pl-11"
                        placeholder="Ex: minha.loja"
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="label mb-0">Galeria de Fotos (Até 5)</label>
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 bg-gray-100 px-2 py-0.5 rounded-lg">
                        {form.gallery.length}/5 fotos
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-5 gap-3">
                      {form.gallery.map((url, index) => (
                        <div key={index} className="relative aspect-square rounded-xl overflow-hidden group border border-gray-100 shadow-sm hover:shadow-md transition-all">
                          <img src={url} alt={`Gallery ${index + 1}`} className="w-full h-full object-cover" />
                          {isEditing && (
                            <button
                              type="button"
                              onClick={() => removeGalleryImage(index)}
                              className="absolute inset-0 bg-red-500/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                            >
                              <X size={20} />
                            </button>
                          )}
                        </div>
                      ))}
                      
                      {isEditing && form.gallery.length < 5 && (
                        <label className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-palmas-blue hover:bg-palmas-blue/5 transition-all text-gray-400 hover:text-palmas-blue group">
                          <Plus size={24} className="group-hover:scale-110 transition-transform" />
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={handleGalleryUpload}
                          />
                        </label>
                      )}
                      
                      {!isEditing && form.gallery.length === 0 && (
                        <div className="col-span-5 py-8 flex flex-col items-center justify-center text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                          <ImageIcon size={32} className="mb-2 opacity-50" />
                          <p className="text-xs font-bold uppercase tracking-widest">Nenhuma foto na galeria</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl transition-colors ${form.is_featured ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-400'}`}>
                          <Star size={20} fill={form.is_featured ? "currentColor" : "none"} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-700">Loja em Destaque</p>
                          <p className="text-xs text-gray-500">Exibir sua banca na seção de destaque da feira</p>
                        </div>
                      </div>
                      <div
                        onClick={() => isEditing && update("is_featured", !form.is_featured)}
                        className={`w-12 h-6 rounded-full relative transition-all cursor-pointer ${!form.is_featured ? 'bg-gray-200' : 'bg-palmas-blue shadow-lg shadow-palmas-blue/20'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${!form.is_featured ? 'left-1' : 'left-7'}`} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "map" && (
          <div className="card p-6 overflow-hidden animate-scale-in">
            <div className="flex items-start gap-3 p-4 bg-palmas-blue/10 border border-palmas-blue/20 rounded-2xl mb-6 text-sm">
              <Info size={18} className="text-palmas-blue flex-shrink-0 mt-0.5" />
              <div className="text-gray-700 leading-relaxed">
                Clique em uma célula <strong className="text-palmas-dark">disponível</strong> no mapa para escolher a posição da sua banca.
                {editingPos && (
                  <span className="block mt-2 px-3 py-1 bg-white/50 w-fit rounded-lg border border-palmas-blue/20 text-palmas-blue font-bold">
                    Selecionado: {posToLabel(editingPos.x, editingPos.y)}
                  </span>
                )}
              </div>
            </div>

            <FairMap
              key={activeStoreId || 'new'}
              stores={stores}
              editable={isEditing}
              editingPosition={editingPos}
              onSelectPosition={handleSelectPosition}
              currentStoreId={myStore?.id}
              myStoreIds={myStores.map(s => s.id)}
              onSelectStore={handleMapSelectStore}
            />
          </div>
        )}

        {isEditing && (
          <div className="mt-4">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-lg animate-spin" />{" "}
                  Salvando...
                </>
              ) : (
                <>
                  <Save size={18} /> Salvar Alterações
                </>
              )}
            </button>
          </div>
        )}
      </form>
    </div>
  )
}
