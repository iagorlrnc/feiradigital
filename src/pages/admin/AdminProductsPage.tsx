import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import {
  Plus,
  Search,
  Package,
  Trash2,
  Edit2,
  Save,
  X,
  Loader2,
  AlertCircle,
  CheckCircle,
  DollarSign,
  Camera,
} from "lucide-react"
import { useAuthStore } from "../../store/authStore"
import { useStoreStore } from "../../store/storeStore"
import { supabase, type Product } from "../../lib/supabase"

export default function AdminProductsPage() {
  const { user } = useAuthStore()
  const {
    myStores,
    activeStoreId,
    products,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    setActiveStoreId,
  } = useStoreStore()

  const myStore = myStores.find((s) => s.id === activeStoreId) || null
  const navigate = useNavigate()

  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [search, setSearch] = useState("")
  const [uploading, setUploading] = useState(false)

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    image_url: "",
    is_active: true,
  })

  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!user) {
      navigate("/")
      return
    }
    if (activeStoreId) {
      // Clear current products list to avoid showing old data while loading
      fetchProducts(activeStoreId)
    }
  }, [user, activeStoreId])

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.description?.toLowerCase().includes(search.toLowerCase())
  )

  const handleEdit = (product: Product) => {
    setForm({
      name: product.name,
      description: product.description || "",
      price: product.price.toString(),
      image_url: product.image_url || "",
      is_active: product.is_active,
    })
    setEditingId(product.id)
    setIsAdding(true)
  }

  const handleCancel = () => {
    setIsAdding(false)
    setEditingId(null)
    setForm({
      name: "",
      description: "",
      price: "",
      image_url: "",
      is_active: true,
    })
    setError("")
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    setUploading(true)
    setError("")

    try {
      const fileExt = file.name.split(".").pop()
      const fileName = `${user.id}/prod_${Math.random()}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError } = await supabase.storage
        .from("store-assets")
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      const {
        data: { publicUrl },
      } = supabase.storage.from("store-assets").getPublicUrl(filePath)

      setForm((prev) => ({ ...prev, image_url: publicUrl }))
    } catch (err) {
      console.error(err)
      setError("Erro ao fazer upload da imagem.")
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeStoreId) return

    setLoading(true)
    setError("")

    const price = parseFloat(form.price)
    if (isNaN(price)) {
      setError("Preço inválido")
      setLoading(false)
      return
    }

    const productData = {
      store_id: activeStoreId,
      name: form.name,
      description: form.description,
      price: price,
      image_url: form.image_url,
      is_active: form.is_active,
    }

    try {
      const result = editingId
        ? await updateProduct(editingId, productData)
        : await createProduct(productData)

      if (result.error) throw new Error(result.error)

      setSuccess(editingId ? "Produto atualizado!" : "Produto criado!")
      handleCancel()
      fetchProducts(activeStoreId)
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar produto")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja excluir este produto?")) return

    try {
      const { error } = await deleteProduct(id)
      if (error) throw new Error(error)
      setSuccess("Produto excluído!")
      if (activeStoreId) fetchProducts(activeStoreId)
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      setError("Erro ao excluir produto")
    }
  }

  if (!myStore) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <div className="w-16 h-16 bg-palmas-blue/10 text-palmas-blue rounded-full flex items-center justify-center mb-4">
          <Package size={32} />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Configure sua loja primeiro</h2>
        <p className="text-gray-500 max-w-sm mb-6">
          Você precisa configurar as informações básicas da sua loja antes de gerenciar produtos.
        </p>
        <button onClick={() => navigate("/store")} className="btn-primary">
          Ir para Minha Loja
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-palmas-text">Produtos - {myStore.name}</h1>
          <p className="text-gray-500 mt-1">Gerencie os itens disponíveis na sua banca</p>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-6 py-3 bg-palmas-blue text-white rounded-2xl text-sm font-bold shadow-lg shadow-palmas-blue/20 hover:-translate-y-0.5 transition-all"
          >
            <Plus size={18} /> Adicionar Produto
          </button>
        )}
      </div>

      {/* Store Selector (if multi-store) */}
      {myStores.length > 1 && (
        <div className="flex gap-2 mb-8 p-1 bg-white rounded-2xl border border-gray-100 shadow-sm">
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
              <Package size={16} />
              Loja {index + 1}
            </button>
          ))}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm mb-6 animate-scale-in">
          <AlertCircle size={18} className="flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-100 rounded-2xl text-green-600 text-sm mb-6 animate-scale-in">
          <CheckCircle size={18} className="flex-shrink-0" />
          <p className="font-bold">{success}</p>
        </div>
      )}

      {isAdding ? (
        <div className="card p-8 animate-scale-in">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-gray-900">
              {editingId ? "Editar Produto" : "Novo Produto"}
            </h2>
            <button
              onClick={handleCancel}
              className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Image Upload */}
              <div>
                <label className="label">Imagem do Produto</label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-palmas-blue hover:bg-palmas-blue/5 transition-all group overflow-hidden relative"
                >
                  {form.image_url ? (
                    <>
                      <img
                        src={form.image_url}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                        Alterar Imagem
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-gray-400 shadow-sm group-hover:scale-110 transition-transform">
                        <Camera size={24} />
                      </div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                        {uploading ? "Enviando..." : "Carregar Foto"}
                      </p>
                    </>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </div>

              {/* Form Fields */}
              <div className="space-y-6">
                <div>
                  <label className="label">Nome do Produto *</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                    className="input-field"
                    placeholder="Ex: Pastel de Carne"
                  />
                </div>

                <div>
                  <label className="label">Preço (R$) *</label>
                  <div className="relative">
                    <DollarSign
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={form.price}
                      onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
                      className="input-field pl-12"
                      placeholder="0,00"
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Descrição (Opcional)</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                    className="input-field h-32 resize-none"
                    placeholder="Detalhes do produto, ingredientes..."
                  />
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
                  <div
                    onClick={() => setForm((prev) => ({ ...prev, is_active: !prev.is_active }))}
                    className={`w-12 h-6 rounded-full relative transition-colors cursor-pointer ${
                      form.is_active ? "bg-palmas-blue" : "bg-gray-200"
                    }`}
                  >
                    <div
                      className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                        form.is_active ? "left-7" : "left-1"
                      }`}
                    />
                  </div>
                  <span className="text-sm font-bold text-gray-700">Produto Ativo</span>
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading || uploading}
                className="btn-primary flex-1 flex items-center justify-center gap-2 h-14"
              >
                {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                {editingId ? "Salvar Alterações" : "Criar Produto"}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="btn-secondary h-14 px-8"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Search bar */}
          <div className="relative">
            <Search
              size={20}
              className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Buscar produtos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-14 pr-6 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-4 focus:ring-palmas-blue/5 transition-all outline-none"
            />
          </div>

          {/* Products Grid */}
          {filteredProducts.length > 0 ? (
            <div key={activeStoreId} className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-fade-in">
              {filteredProducts.map((product) => (
                <div key={product.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group overflow-hidden flex items-center p-3 gap-4 animate-scale-in">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0 relative">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-200">
                        <Package size={32} />
                      </div>
                    )}
                    <div className="absolute top-1 left-1">
                      <div className={`w-2 h-2 rounded-full shadow-sm ${product.is_active ? 'bg-green-500' : 'bg-gray-400'}`} />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-bold text-gray-900 truncate text-base">{product.name}</h3>
                      <span className="font-display font-black text-palmas-blue text-sm whitespace-nowrap">
                        R$ {product.price.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2 mt-1 leading-relaxed">
                      {product.description || "Sem descrição."}
                    </p>
                    
                    <div className="flex items-center gap-3 mt-3">
                      <button
                        onClick={() => handleEdit(product)}
                        className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-palmas-blue transition-colors"
                      >
                        <Edit2 size={12} /> Editar
                      </button>
                      <div className="w-1 h-1 rounded-full bg-gray-200" />
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={12} /> Excluir
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
              <Package size={48} className="mx-auto text-gray-200 mb-4" />
              <p className="text-gray-500 font-medium">Nenhum produto encontrado</p>
              <button
                onClick={() => setIsAdding(true)}
                className="mt-4 text-palmas-blue font-bold hover:underline"
              >
                Adicionar seu primeiro produto
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
