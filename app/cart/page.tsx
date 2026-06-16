'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase'
import { useCartStore } from '@/store/cart'
import type { CartItem } from '@/types'

export default function CartPage() {
  const router = useRouter()
  const { items, setItems, updateQty, removeItem, total, count } = useCartStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push('/auth/login'); return }
      const { data } = await supabase
        .from('cart_items')
        .select('*, products(id, name, price, original_price, image_url, slug, sizes)')
        .eq('user_id', user.id)
      setItems((data ?? []) as CartItem[])
      setLoading(false)
    })
  }, [])

  const handleQty = async (item: CartItem, delta: number) => {
    const supabase = createClient()
    const newQty = item.quantity + delta
    if (newQty <= 0) {
      await supabase.from('cart_items').delete().eq('id', item.id)
      removeItem(item.id)
    } else {
      await supabase.from('cart_items').update({ quantity: newQty }).eq('id', item.id)
      updateQty(item.id, newQty)
    }
  }

  const handleRemove = async (id: string) => {
    const supabase = createClient()
    await supabase.from('cart_items').delete().eq('id', id)
    removeItem(id)
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh] text-gray-500">
      <p>로딩 중...</p>
    </div>
  )

  if (items.length === 0) return (
    <div className="max-w-2xl mx-auto px-4 py-24 text-center">
      <p className="text-6xl mb-4">🛒</p>
      <p className="text-xl font-bold text-gray-300 mb-2">장바구니가 비어 있어요</p>
      <p className="text-gray-500 mb-8">마음에 드는 유니폼을 담아보세요!</p>
      <button onClick={() => router.push('/products')} className="bg-green-500 hover:bg-green-400 text-black font-black px-8 py-3 rounded-xl transition">
        상품 보러 가기
      </button>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-black mb-8">장바구니 ({count()}개)</h1>
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="bg-[#111] border border-[#1e1e1e] rounded-xl p-4 flex gap-4 items-center">
              <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-[#0d0d0d] flex-shrink-0">
                {item.products?.image_url
                  ? <Image src={item.products.image_url} alt={item.products?.name ?? ''} fill className="object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-2xl">👕</div>
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold text-sm truncate">{item.products?.name}</p>
                <p className="text-gray-400 text-xs mb-2">사이즈: {item.size}</p>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleQty(item, -1)} className="w-7 h-7 border border-[#333] rounded text-white hover:bg-[#1e1e1e] transition text-lg leading-none">−</button>
                  <span className="text-white font-bold w-6 text-center">{item.quantity}</span>
                  <button onClick={() => handleQty(item, 1)} className="w-7 h-7 border border-[#333] rounded text-white hover:bg-[#1e1e1e] transition text-lg leading-none">+</button>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-white font-black">{((item.products?.price ?? 0) * item.quantity).toLocaleString()}원</p>
                <button onClick={() => handleRemove(item.id)} className="text-gray-600 hover:text-red-400 text-xs mt-1 transition">삭제</button>
              </div>
            </div>
          ))}
        </div>

        {/* 주문 요약 */}
        <div className="md:col-span-1">
          <div className="bg-[#111] border border-[#1e1e1e] rounded-xl p-6 sticky top-24">
            <h2 className="font-black text-lg mb-4">주문 요약</h2>
            <div className="space-y-2 text-sm text-gray-400 mb-4">
              <div className="flex justify-between">
                <span>상품 합계</span>
                <span>{total().toLocaleString()}원</span>
              </div>
              <div className="flex justify-between">
                <span>배송비</span>
                <span className={total() >= 50000 ? 'text-green-400' : ''}>
                  {total() >= 50000 ? '무료' : '3,000원'}
                </span>
              </div>
            </div>
            <div className="border-t border-[#1e1e1e] pt-4 flex justify-between font-black text-lg mb-6">
              <span>총 결제금액</span>
              <span className="text-green-400">{(total() + (total() >= 50000 ? 0 : 3000)).toLocaleString()}원</span>
            </div>
            <button
              onClick={() => router.push('/checkout')}
              className="w-full bg-green-500 hover:bg-green-400 text-black font-black py-3 rounded-xl transition"
            >
              결제하기
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
