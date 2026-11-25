'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowRight, CheckCircle, Calculator } from 'lucide-react'
import { calculatePrice } from '@/lib/pricing'
import type { PriceEstimate } from '@/lib/pricing'

const schema = z.object({
  name:              z.string().min(2, 'Nome obrigatório'),
  email:             z.string().email('Email inválido'),
  category:          z.string().min(1, 'Escolhe uma categoria'),
  duration:          z.string().min(1, 'Escolhe a duração'),
  location:          z.string().min(1, 'Escolhe a localização'),
  photography_type:  z.string().min(1, 'Descreve o tipo de fotografia'),
  message:           z.string().optional(),
})
type FormData = z.infer<typeof schema>

const CATEGORIES = [
  { value: 'night',    label: 'Gazelle Night — Discoteca/Nightlife' },
  { value: 'cars',     label: 'Gazelle Cars — Fotografia Automóvel' },
  { value: 'people',   label: 'Gazelle People — Retratos/Branding' },
  { value: 'events',   label: 'Evento (Geral)' },
  { value: 'football', label: 'Futebol/Desporto' },
  { value: 'other',    label: 'Outro (Orçamento Personalizado)' },
]
const DURATIONS = [
  { value: '1h',     label: '1 hora' },
  { value: '1h30',   label: '1h30' },
  { value: '2h',     label: '2 horas' },
  { value: '3h',     label: '3 horas' },
  { value: '4h',     label: '4 horas' },
  { value: 'halfday',label: 'Meio dia (~5h)' },
  { value: 'fullday',label: 'Dia completo (~8h)' },
]
const LOCATIONS = [
  { value: 'local',  label: 'Santarém / Arredores (local)' },
  { value: 'near',   label: 'Até 50km de Santarém' },
  { value: 'far',    label: 'Mais de 50km (deslocação)' },
  { value: 'travel', label: 'Viagem / Outra cidade' },
]

type Step = 'form' | 'estimate' | 'sent'

export default function BookingPage() {
  const [step, setStep] = useState<Step>('form')
  const [estimate, setEstimate] = useState<PriceEstimate | null>(null)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<FormData | null>(null)

  const {
    register, handleSubmit, watch,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const cat = watch('category')
  const dur = watch('duration')
  const loc = watch('location')

  // Live estimate as user fills form
  const liveEstimate = cat && dur && loc
    ? calculatePrice({ category: cat, duration: dur, location: loc })
    : null

  function onSubmit(data: FormData) {
    const est = calculatePrice({
      category: data.category,
      duration: data.duration,
      location: data.location,
    })
    setEstimate(est)
    setFormData(data)
    setStep('estimate')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function confirmSend() {
    if (!formData || !estimate) return
    setLoading(true)
    try {
      await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          estimated_price_min: estimate.min,
          estimated_price_max: estimate.max,
        }),
      })
      setStep('sent')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gz-black pb-24">
      <div className="container mx-auto px-6 pt-18">
        {/* Header */}
        <div className="pt-10 pb-16">
          <p className="font-display text-xs tracking-widest uppercase text-gz-blue mb-4">Contacto</p>
          <h1 className="gz-section-title text-5xl mb-4">Pedir Orçamento</h1>
          <p className="text-gz-ghost font-light max-w-md">
            Preenche o formulário e recebe uma estimativa imediata. Sem compromisso.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl">
          {/* Left: Contact info */}
          <div className="space-y-10">
            <div>
              <p className="font-display text-xs tracking-widest uppercase text-gz-dim mb-6">
                Detalhes de Contacto
              </p>
              <div className="space-y-5">
                {[
                  { label: 'Email', value: 'contato@gazellephoto.com' },
                  { label: 'Telefone', value: '+351 999 999 999' },
                  { label: 'Localização', value: 'Santarém, Portugal' },
                  { label: 'Instagram', value: '@gazelle.photo' },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="gz-label">{label}</p>
                    <p className="text-gz-ghost font-light">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Live price preview */}
            {liveEstimate && (
              <div className="gz-card p-6 border-gz-blue/20">
                <div className="flex items-center gap-2 mb-4">
                  <Calculator size={14} className="text-gz-blue" />
                  <p className="font-display text-xs tracking-widest uppercase text-gz-blue">
                    Estimativa em tempo real
                  </p>
                </div>
                <p className="font-display text-3xl font-bold text-gz-white mb-1">
                  {liveEstimate.min}€ – {liveEstimate.max}€
                </p>
                <p className="text-gz-dim text-xs font-light">(valores aproximados, sem compromisso)</p>
                {liveEstimate.note && (
                  <p className="text-gz-blue text-xs mt-3 font-display">{liveEstimate.note}</p>
                )}
              </div>
            )}
          </div>

          {/* Right: Form / Estimate / Success */}
          <div>
            {step === 'form' && (
              <form onSubmit={handleSubmit(onSubmit)} className="gz-card p-8 space-y-6">
                <Field label="Nome" error={errors.name?.message}>
                  <input {...register('name')} className="gz-input" placeholder="O teu nome" />
                </Field>
                <Field label="Email" error={errors.email?.message}>
                  <input {...register('email')} type="email" className="gz-input" placeholder="teu@email.com" />
                </Field>
                <Field label="Tipo de Sessão" error={errors.category?.message}>
                  <select {...register('category')} className="gz-input">
                    <option value="">Escolhe o serviço</option>
                    {CATEGORIES.map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Duração Estimada" error={errors.duration?.message}>
                  <select {...register('duration')} className="gz-input">
                    <option value="">Escolhe a duração</option>
                    {DURATIONS.map(d => (
                      <option key={d.value} value={d.value}>{d.label}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Localização" error={errors.location?.message}>
                  <select {...register('location')} className="gz-input">
                    <option value="">Onde será a sessão?</option>
                    {LOCATIONS.map(l => (
                      <option key={l.value} value={l.value}>{l.label}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Tipo de Fotografia" error={errors.photography_type?.message}>
                  <input {...register('photography_type')} className="gz-input"
                    placeholder="Ex: retratos para Instagram, sessão automóvel exterior..." />
                </Field>
                <Field label="Mensagem (opcional)">
                  <textarea {...register('message')} rows={3} className="gz-input resize-none"
                    placeholder="Detalhes adicionais sobre a sessão..." />
                </Field>
                <button type="submit" className="gz-btn-primary w-full flex items-center justify-center gap-2">
                  Ver Estimativa de Preço <ArrowRight size={16} />
                </button>
              </form>
            )}

            {step === 'estimate' && estimate && formData && (
              <div className="gz-card p-8 space-y-6">
                <div>
                  <p className="font-display text-xs tracking-widest uppercase text-gz-blue mb-4">
                    Estimativa de Preço
                  </p>
                  <p className="font-display text-4xl font-bold text-gz-white mb-2">
                    {estimate.min}€ – {estimate.max}€
                  </p>
                  <p className="text-gz-dim text-sm font-light">Valores aproximados sem compromisso</p>
                </div>

                <div className="border-t border-gz-border pt-5 space-y-3">
                  {estimate.breakdown.map((b, i) => (
                    <div key={i} className="flex justify-between">
                      <span className="text-gz-ghost text-sm">{b.label}</span>
                      <span className="font-display text-sm text-gz-white">{b.value}</span>
                    </div>
                  ))}
                </div>

                {estimate.note && (
                  <p className="text-gz-blue text-sm font-display border-l-2 border-gz-blue/30 pl-3">
                    {estimate.note}
                  </p>
                )}

                <p className="text-gz-ghost text-sm font-light leading-relaxed">
                  Se estiveres de acordo, confirma para enviar a proposta a Gazelle.
                  Receberás uma confirmação por email.
                </p>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={confirmSend}
                    disabled={loading}
                    className="gz-btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? 'A enviar...' : 'Confirmar e Enviar Proposta'}
                  </button>
                  <button
                    onClick={() => setStep('form')}
                    className="gz-btn-ghost w-full text-sm"
                  >
                    Voltar e ajustar
                  </button>
                </div>
              </div>
            )}

            {step === 'sent' && (
              <div className="gz-card p-10 text-center space-y-4">
                <CheckCircle size={40} className="text-gz-blue mx-auto" />
                <h2 className="font-display text-2xl font-bold text-gz-white">
                  Proposta enviada!
                </h2>
                <p className="text-gz-ghost font-light leading-relaxed">
                  Gazelle irá analisar o teu pedido e entrar em contacto por email
                  em menos de 24 horas.
                </p>
                <button
                  onClick={() => { setStep('form'); setEstimate(null) }}
                  className="gz-btn-ghost mt-4"
                >
                  Fazer outro pedido
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children, error }: {
  label: string; children: React.ReactNode; error?: string
}) {
  return (
    <div>
      <label className="gz-label">{label}</label>
      {children}
      {error && <p className="text-red-400 text-xs mt-1.5 font-display">{error}</p>}
    </div>
  )
}
