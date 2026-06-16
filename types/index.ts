export interface League {
  id: string
  name: string
  country: string
  slug: string
  logo_url: string | null
  display_order: number
}

export interface Club {
  id: string
  name: string
  slug: string
  league_id: string | null
  logo_url: string | null
  leagues?: League
}

export interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  price: number
  original_price: number | null
  club_id: string | null
  season: string | null
  kit_type: 'home' | 'away' | 'third' | 'goalkeeper' | 'special'
  sizes: string[]
  image_url: string | null
  stock: number
  is_featured: boolean
  is_new: boolean
  created_at: string
  clubs?: Club
}

export interface CartItem {
  id: string
  user_id: string
  product_id: string
  size: string
  quantity: number
  products?: Product
}

export interface Order {
  id: string
  user_id: string | null
  payment_key: string | null
  order_id: string
  status: 'pending' | 'paid' | 'preparing' | 'shipped' | 'delivered' | 'cancelled'
  total: number
  buyer_name: string | null
  buyer_email: string | null
  created_at: string
}
