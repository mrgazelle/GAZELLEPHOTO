export type UserRole = 'admin' | 'user'

export type EventStatus =
  | 'scheduled'
  | 'ongoing'
  | 'post-production'
  | 'canceled'
  | 'completed'

export interface Profile {
  id: string
  email: string
  role: UserRole
  full_name?: string
  created_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  icon?: string
  created_at: string
}

export interface Event {
  id: string
  title: string
  slug: string
  description?: string
  poster_url?: string
  date: string
  time_start?: string
  time_end?: string
  location?: string
  status: EventStatus
  is_public: boolean
  token?: string
  category_id?: string
  category?: Category
  price_logged?: number
  photo_count?: number
  created_at: string
}

export interface ExifData {
  shutter_speed?: string
  iso?: number
  aperture?: string
  focal_length?: string
  camera?: string
  lens?: string
  taken_at?: string
}

export interface Photo {
  id: string
  event_id: string
  url: string
  thumbnail_url: string
  public_id: string
  exif_data?: ExifData
  taken_at?: string
  width?: number
  height?: number
  created_at: string
}

export interface Favorite {
  id: string
  user_id: string
  photo_id: string
  photo?: Photo
  created_at: string
}

export interface BookingRequest {
  id: string
  user_id?: string
  name: string
  email: string
  category: string
  duration: string
  location: string
  photography_type: string
  message?: string
  estimated_price_min?: number
  estimated_price_max?: number
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected'
  created_at: string
}

export interface EventSubscription {
  id: string
  email: string
  user_id?: string
  event_id: string
  created_at: string
}

export interface FinancialSummary {
  total: number
  by_week: { week: string; total: number }[]
  by_month: { month: string; total: number }[]
  by_category: { category: string; total: number }[]
}

// Pricing engine types
export interface PricingRule {
  category: string
  base_price: number
  hourly_rate: number
  min_hours: number
  extras: Record<string, number>
}
