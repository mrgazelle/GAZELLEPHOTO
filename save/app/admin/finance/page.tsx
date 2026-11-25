import { createServerSupabase } from '@/lib/supabase-server'
import { TrendingUp, Calendar, Tag } from 'lucide-react'

export default async function FinancePage() {
  const supabase = createServerSupabase()
  const [{ data: byMonth }, { data: byCategory }, { data: events }] = await Promise.all([
    supabase.from('revenue_by_month').select('*'),
    supabase.from('revenue_by_category').select('*'),
    supabase.from('events').select('title, date, price_logged, status').not('price_logged', 'is', null).order('date', { ascending: false }),
  ])
  const total = (byMonth ?? []).reduce((s: number, r: any) => s + Number(r.total ?? 0), 0)
  return (
    <div className="max-w-4xl">
      <div className="mb-10">
        <h1 className="font-display text-3xl font-bold text-gz-white mb-1">Finanças</h1>
        <p className="text-gz-dim text-sm">Receita total registada</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <div className="gz-card p-6 md:col-span-1">
          <div className="flex items-center gap-2 mb-3"><TrendingUp size={14} className="text-gz-blue" /><p className="gz-label mb-0">Total Geral</p></div>
          <p className="font-display text-4xl font-bold text-gz-white">{total.toFixed(0)}€</p>
        </div>
        <div className="gz-card p-6"><p className="gz-label mb-3">Por Mês</p>
          <div className="space-y-2">{(byMonth ?? []).slice(0,5).map((r: any) => (
            <div key={r.month} className="flex justify-between text-sm">
              <span className="text-gz-ghost">{r.month}</span>
              <span className="font-display text-gz-white">{Number(r.total).toFixed(0)}€</span>
            </div>))}</div>
        </div>
        <div className="gz-card p-6"><p className="gz-label mb-3">Por Categoria</p>
          <div className="space-y-2">{(byCategory ?? []).map((r: any) => (
            <div key={r.category} className="flex justify-between text-sm">
              <span className="text-gz-ghost">{r.category}</span>
              <span className="font-display text-gz-white">{Number(r.total).toFixed(0)}€</span>
            </div>))}</div>
        </div>
      </div>
      <div className="gz-card overflow-hidden">
        <div className="px-6 py-4 border-b border-gz-border"><p className="font-display text-xs tracking-widest uppercase text-gz-ghost">Eventos com Receita Registada</p></div>
        <table className="w-full"><thead className="border-b border-gz-border"><tr>
          {['Evento','Data','Valor'].map(h=><th key={h} className="px-5 py-3 text-left font-display text-xs tracking-widest uppercase text-gz-dim">{h}</th>)}
        </tr></thead><tbody className="divide-y divide-gz-border/50">
          {(events ?? []).map((e: any) => (
            <tr key={e.title+e.date}><td className="px-5 py-3 text-gz-white text-sm">{e.title}</td>
              <td className="px-5 py-3 text-gz-ghost text-sm">{e.date}</td>
              <td className="px-5 py-3 font-display text-gz-blue">{e.price_logged}€</td></tr>
          ))}
        </tbody></table>
      </div>
    </div>
  )
}
