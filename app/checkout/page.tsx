'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { loadPaymentWidget, PaymentWidgetInstance } from '@tosspayments/payment-widget-sdk'
import { createClient } from '@/lib/supabase'
import { useCartStore } from '@/store/cart'

const TOSS_CLIENT_KEY = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY!

export default function CheckoutPage() {
  const router = useRouter()
  const paymentWidgetRef = useRef<PaymentWidgetInstance | null>(null)
  const [user, setUser] = useState<any>(null)
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const { items, total, clear } = useCartStore()

  const shipping = total() >= 50000 ? 0 : 3000
  const orderTotal = total() + shipping

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/auth/login'); return }
      setUser(user)
    })
  }, [])

  useEffect(() => {
    if (!user || items.length === 0) return

    const orderId = `ORDER_${Date.now()}`

    loadPaymentWidget(TOSS_CLIENT_KEY, user.id)
      .then((widget) => {
        paymentWidgetRef.current = widget
        widget.renderPaymentMethods('#payment-widget', { value: orderTotal })
        widget.renderAgreement('#agreement-widget')
      })
      .catch(console.error)
  }, [user, orderTotal])

  const handlePay = async () => {
    if (!paymentWidgetRef.current || !user || !name.trim()) {
      alert('이름을 입력해주세요.')
      return
    }
    setLoading(true)
    const orderId = `ORDER_${Date.now()}`
    try {
      await paymentWidgetRef.current.requestPayment({
        orderId,
        orderName: items.length === 1
          ? (items[0].products?.name ?? '유니폼')
          : `${items[0].products?.name ?? '유니폼'} 외 ${items.length - 1}건`,
        customerName: name,
        customerEmail: user.email,
        successUrl: `${window.location.origin}/checkout/success`,
        failUrl: `${window.location.origin}/checkout/fail`,
      })
    } catch (e) {
      console.error(e)
      setLoading(false)
    }
  }

  if (items.length === 0) return (
    <div className="text-center py-24 text-gray-500">
      <p className="text-4xl mb-4">🛒</p>
      <p>장바구니가 비어 있습니다.</p>
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-black mb-8">결제하기</h1>

      {/* 구매자 정보 */}
      <div className="bg-[#111] border border-[#1e1e1e] rounded-xl p-6 mb-6">
        <h2 className="font-bold mb-4 text-gray-300">구매자 정보</h2>
        <div className="space-y-3">
          <div>
            <label className="text-gray-500 text-sm block mb-1">이름</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="홍길동"
              className="w-full bg-[#0d0d0d] border border-[#333] rounded-lg px-4 py-2.5 text-white outline-none focus:border-green-500 transition"
            />
          </div>
          <div>
            <label className="text-gray-500 text-sm block mb-1">이메일</label>
            <input
              value={user?.email ?? ''}
              readOnly
              className="w-full bg-[#0a0a0a] border border-[#1e1e1e] rounded-lg px-4 py-2.5 text-gray-500 cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      {/* 주문 상품 */}
      <div className="bg-[#111] border border-[#1e1e1e] rounded-xl p-6 mb-6">
        <h2 className="font-bold mb-4 text-gray-300">주문 상품</h2>
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-gray-300 truncate flex-1">{item.products?.name} ({item.size}) × {item.quantity}</span>
              <span className="text-white font-bold ml-4">{((item.products?.price ?? 0) * item.quantity).toLocaleString()}원</span>
            </div>
          ))}
          <div className="border-t border-[#1e1e1e] pt-3 flex justify-between font-black">
            <span>배송비</span>
            <span className={shipping === 0 ? 'text-green-400' : ''}>{shipping === 0 ? '무료' : `${shipping.toLocaleString()}원`}</span>
          </div>
          <div className="flex justify-between font-black text-lg">
            <span>총 결제금액</span>
            <span className="text-green-400">{orderTotal.toLocaleString()}원</span>
          </div>
        </div>
      </div>

      {/* 토스 결제 위젯 */}
      <div className="bg-[#111] border border-[#1e1e1e] rounded-xl p-6 mb-6">
        <div id="payment-widget" />
        <div id="agreement-widget" className="mt-4" />
      </div>

      <button
        onClick={handlePay}
        disabled={loading}
        className="w-full bg-green-500 hover:bg-green-400 disabled:opacity-50 text-black font-black py-4 rounded-xl text-lg transition"
      >
        {loading ? '처리 중...' : `${orderTotal.toLocaleString()}원 결제하기`}
      </button>
    </div>
  )
}
