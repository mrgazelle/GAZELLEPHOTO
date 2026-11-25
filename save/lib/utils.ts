import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow } from 'date-fns'
import { pt } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export function formatDate(date: string | Date, pattern = 'd MMM yyyy') {
  return format(new Date(date), pattern, { locale: pt })
}
export function formatRelative(date: string | Date) {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: pt })
}
export function slugify(text: string) {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}
export function statusLabel(status: string) {
  const labels: Record<string, string> = {
    scheduled: 'Agendado', ongoing: 'A decorrer',
    'post-production': 'Pós-produção', canceled: 'Cancelado', completed: 'Concluído',
  }
  return labels[status] ?? status
}
export function formatBytes(bytes: number) {
  if (bytes === 0) return '0 B'
  const k = 1024; const sizes = ['B','KB','MB','GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}
