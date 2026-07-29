'use client'
import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Check, X } from 'lucide-react'
import { createClient } from '@/lib/supabase'

interface Category {
  id: string; name: string; slug: string; icon?: string
}

const ICONS = ['moon', 'car', 'user', 'building', 'calendar', 'trophy', 'camera', 'music', 'star', 'heart']

function slugify(text: string) {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading]       = useState(true)
  const [editingId, setEditingId]   = useState<string | null>(null)
  const [showNew, setShowNew]       = useState(false)
  const [form, setForm]             = useState({ name: '', slug: '', icon: '' })
  const [saving, setSaving]         = useState(false)

  async function getToken() {
    const { data: { session } } = await createClient().auth.getSession()
    return session?.access_token ?? ''
  }

  async function load() {
    const res = await fetch('/api/categories')
    const data = await res.json()
    setCategories(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function startEdit(cat: Category) {
    setEditingId(cat.id)
    setForm({ name: cat.name, slug: cat.slug, icon: cat.icon ?? '' })
    setShowNew(false)
  }

  function startNew() {
    setShowNew(true)
    setEditingId(null)
    setForm({ name: '', slug: '', icon: '' })
  }

  function updateForm(key: string, value: string) {
    setForm(prev => ({
      ...prev,
      [key]: value,
      ...(key === 'name' ? { slug: slugify(value) } : {}),
    }))
  }

  async function save() {
    if (!form.name.trim()) return
    setSaving(true)
    const token = await getToken()

    const payload = { name: form.name.trim(), slug: form.slug || slugify(form.name), icon: form.icon || null }

    if (editingId) {
      // Editar — como usa UUID, muda automaticamente em todas as fotos/eventos
      await fetch(`/api/categories/${editingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      })
    } else {
      // Nova
      await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      })
    }

    setEditingId(null)
    setShowNew(false)
    setForm({ name: '', slug: '', icon: '' })
    await load()
    setSaving(false)
  }

  async function remove(cat: Category) {
    if (!confirm(`Apagar categoria "${cat.name}"?\n\nAs fotos e eventos com esta categoria ficam sem categoria mas não são apagados.`)) return
    const token = await getToken()
    await fetch(`/api/categories/${cat.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    await load()
  }

  return (
    <div className="max-w-2xl">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="font-display text-3xl font-bold text-gz-white mb-1">Categorias</h1>
          <p className="text-gz-dim text-sm">{categories.length} categorias</p>
        </div>
        <button onClick={startNew} className="gz-btn-primary flex items-center gap-2 text-sm">
          <Plus size={14} /> Nova Categoria
        </button>
      </div>

      {/* Formulário nova categoria */}
      {showNew && (
        <CategoryForm
          form={form}
          updateForm={updateForm}
          onSave={save}
          onCancel={() => setShowNew(false)}
          saving={saving}
          title="Nova Categoria"
        />
      )}

      {/* Lista */}
      {loading ? (
        <div className="flex justify-center py-16">
          <span className="w-6 h-6 border-2 border-gz-blue/30 border-t-gz-blue rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">
          {categories.map(cat => (
            <div key={cat.id}>
              {editingId === cat.id ? (
                <CategoryForm
                  form={form}
                  updateForm={updateForm}
                  onSave={save}
                  onCancel={() => setEditingId(null)}
                  saving={saving}
                  title={`Editar — ${cat.name}`}
                />
              ) : (
                <div className="gz-card px-5 py-4 flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-gz-blue/10 border border-gz-blue/20 rounded-lg
                                    flex items-center justify-center text-gz-blue text-xs font-bold">
                      {cat.icon?.[0]?.toUpperCase() ?? cat.name[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="font-display text-sm font-bold text-gz-white">{cat.name}</p>
                      <p className="text-gz-dim text-xs mt-0.5">/{cat.slug}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => startEdit(cat)}
                      className="w-8 h-8 border border-gz-border rounded-lg flex items-center justify-center
                                 text-gz-dim hover:text-gz-blue hover:border-gz-blue/40 transition-colors"
                    >
                      <Edit size={13} />
                    </button>
                    <button
                      onClick={() => remove(cat)}
                      className="w-8 h-8 border border-gz-border rounded-lg flex items-center justify-center
                                 text-gz-dim hover:text-red-400 hover:border-red-400/40 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {!loading && categories.length === 0 && (
        <div className="text-center py-16 text-gz-dim">
          <p className="font-display mb-4">Sem categorias ainda.</p>
          <button onClick={startNew} className="gz-btn-primary">Criar primeira</button>
        </div>
      )}
    </div>
  )
}

function CategoryForm({ form, updateForm, onSave, onCancel, saving, title }: {
  form: { name: string; slug: string; icon: string }
  updateForm: (k: string, v: string) => void
  onSave: () => void
  onCancel: () => void
  saving: boolean
  title: string
}) {
  return (
    <div className="gz-card p-6 mb-3 border-gz-blue/20">
      <p className="font-display text-xs tracking-widest uppercase text-gz-blue mb-4">{title}</p>
      <div className="space-y-4">
        <div>
          <label className="gz-label">Nome *</label>
          <input
            value={form.name}
            onChange={e => updateForm('name', e.target.value)}
            className="gz-input"
            placeholder="Ex: Nightlife"
            autoFocus
            onKeyDown={e => e.key === 'Enter' && onSave()}
          />
        </div>
        <div>
          <label className="gz-label">Slug (gerado automaticamente)</label>
          <input
            value={form.slug}
            onChange={e => updateForm('slug', e.target.value)}
            className="gz-input font-mono text-sm text-gz-blue"
            placeholder="nightlife"
          />
          <p className="text-gz-border text-xs mt-1">
            Usado nos filtros do portfolio. Muda com cuidado.
          </p>
        </div>
        <div className="flex gap-3 pt-1">
          <button onClick={onSave} disabled={saving || !form.name.trim()}
            className="gz-btn-primary flex items-center gap-2 text-sm disabled:opacity-50">
            <Check size={14} />
            {saving ? 'A guardar...' : 'Guardar'}
          </button>
          <button onClick={onCancel} className="gz-btn-ghost text-sm flex items-center gap-2">
            <X size={14} /> Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}
