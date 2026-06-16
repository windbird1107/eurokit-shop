'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem } from '@/types'

interface CartStore {
  items: CartItem[]
  setItems: (items: CartItem[]) => void
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
  updateQty: (id: string, qty: number) => void
  clear: () => void
  total: () => number
  count: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      setItems: (items) => set({ items }),
      addItem: (item) => {
        const existing = get().items.find((i) => i.id === item.id)
        if (existing) {
          set({ items: get().items.map((i) => i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i) })
        } else {
          set({ items: [...get().items, item] })
        }
      },
      removeItem: (id) => set({ items: get().items.filter((i) => i.id !== id) }),
      updateQty: (id, qty) => {
        if (qty <= 0) { get().removeItem(id); return }
        set({ items: get().items.map((i) => i.id === id ? { ...i, quantity: qty } : i) })
      },
      clear: () => set({ items: [] }),
      total: () => get().items.reduce((s, i) => s + (i.products?.price ?? 0) * i.quantity, 0),
      count: () => get().items.reduce((s, i) => s + i.quantity, 0),
    }),
    { name: 'jersey-cart' }
  )
)
