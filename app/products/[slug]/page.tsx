'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase'
import { useCartStore } from '@/store/cart'
import TeamBadge from '@/components/TeamBadge'
import type { Product } from '@/types'

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [selectedSize, setSelectedSize] = useState('')
  const [qty, setQty] = useState(1)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState('')
  const addItem = useCartStore((s) => s.addItem)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('products')
      .select('*, clubs(name, slug, leagues(name))')
      .eq('slug', slug)
      .single()
      .then(({ data }) => {
        if (data) { setProduct(data as Product); setSelectedSize(data.sizes?.[0] ?? 'M') }
      })
  }, [slug])

  const handleAddToCart = async () => {
    if (!product) return
    if (!selectedSize) { setToast('사이즈를 선택해주세요'); return }

    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      // 로그인 유저: DB + Zustand
      const { data: existing } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id).eq('product_id', product.id).eq('size', selectedSize)
        .single()

      if (existing) {
        await supabase.from('cart_items')
          .update({ quantity: existing.quantity + qty })
          .eq('id', existing.id)
        addItem({ ...existing, quantity: qty, products: product })
      } else {
        const { data: item } = await supabase.from('cart_items')
          .insert({ user_id: user.id, product_id: product.id, size: selectedSize, quantity: qty })
          .select().single()
        if (item) addItem({ ...item, products: product })
      }
    } else {
      // 비회원: Zustand(로컬)만 사용
      const guestItem = {
        id: `guest_${product.id}_${selectedSize}`,
        user_id: '',
        product_id: product.id,
        size: selectedSize,
        quantity: qty,
        created_at: new Date().toISOString(),
        products: product,
      }
      addItem(guestItem)
    }

    setLoading(false)
    setToast('장바구니에 담았습니다! 🛒')
    setTimeout(() => setToast(''), 2500)
  }

  const handleBuyNow = async () => {
    await handleAddToCart()
    router.push('/cart')
  }

  if (!product) return (
    <div className="flex items-center justify-center min-h-[60vh] text-gray-500">
      <div className="animate-pulse text-center"><p className="text-4xl mb-2">👕</p><p>로딩 중...</p></div>
    </div>
  )

  const discount = product.original_price
    ? Math.round((1 - product.price / product.original_price) * 100)
    : 0

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-black font-bold px-6 py-3 rounded-full shadow-lg">
          {toast}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-10">
        {/* 이미지 */}
        <div className="relative aspect-square bg-[#111] rounded-2xl overflow-hidden border border-[#1e1e1e]">
          {product.image_url ? (
            <Image src={product.image_url} alt={product.name} fill className="object-contain p-8" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-8xl">👕</div>
          )}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {product.is_new && <span className="bg-green-500 text-black text-xs font-black px-2 py-1 rounded">NEW</span>}
            {discount > 0 && <span className="bg-red-500 text-white text-xs font-black px-2 py-1 rounded">-{discount}%</span>}
          </div>
        </div>

        {/* 정보 */}
        <div className="flex flex-col gap-6">
          {product.clubs && (
            <div className="flex items-center gap-3">
              <TeamBadge name={product.clubs.name} size="md" />
              <div>
                <p className="text-green-400 font-bold text-sm">{(product.clubs as any).leagues?.name}</p>
                <p className="text-gray-300 text-lg font-black">{product.clubs.name}</p>
              </div>
            </div>
          )}
          <h1 className="text-2xl font-black leading-tight">{product.name}</h1>

          <div>
            {product.original_price && (
              <p className="text-gray-500 line-through text-base">{product.original_price.toLocaleString()}원</p>
            )}
            <p className="text-3xl font-black text-white">{product.price.toLocaleString()}원</p>
            {discount > 0 && <p className="text-green-400 text-sm font-bold mt-1">{discount}% 할인</p>}
          </div>

          {product.description && (
            <p className="text-gray-400 text-sm leading-relaxed border-t border-[#1e1e1e] pt-4">{product.description}</p>
          )}

          <div>
            <p className="text-gray-400 text-sm font-bold mb-2">사이즈 선택</p>
            <div className="flex flex-wrap gap-2">
              {(product.sizes || ['S','M','L','XL','XXL']).map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedSize(s)}
                  className={`px-4 py-2 rounded-lg border text-sm font-bold transition ${
                    selectedSize === s
                      ? 'bg-green-500 text-black border-green-500'
                      : 'border-[#333] text-gray-300 hover:border-green-500'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <p className="text-gray-400 text-sm font-bold">수량</p>
            <div className="flex items-center border border-[#333] rounded-lg overflow-hidden">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-3 py-2 text-white hover:bg-[#1e1e1e] transition">−</button>
              <span className="px-4 py-2 text-white font-bold">{qty}</span>
              <button onClick={() => setQty(qty + 1)} className="px-3 py-2 text-white hover:bg-[#1e1e1e] transition">+</button>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleAddToCart}
              disabled={loading}
              className="flex-1 border border-green-500 text-green-400 hover:bg-green-500/10 font-bold py-3 rounded-xl transition"
            >
              장바구니 담기
            </button>
            <button
              onClick={handleBuyNow}
              disabled={loading}
              className="flex-1 bg-green-500 hover:bg-green-400 text-black font-black py-3 rounded-xl transition"
            >
              바로 구매
            </button>
          </div>

          <div className="bg-[#111] rounded-xl p-4 border border-[#1e1e1e] text-sm text-gray-400 space-y-1">
            <p>✅ 시즌: {product.season}</p>
            <p>✅ 재고: {product.stock}개 남음</p>
            <p>✅ 무료배송 (5만원 이상)</p>
          </div>
        </div>
      </div>
    </div>
  )
}
