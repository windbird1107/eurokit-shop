'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { loadTossPayments, TossPaymentsWidgets } from '@tosspayments/tosspayments-sdk'
import { createClient } from '@/lib/supabase'
import { useCartStore } from '@/store/cart'

const TOSS_CLIENT_KEY = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY!

export default function CheckoutPage() {
  const router = useRouter()
  const widgetsRef = useRef<TossPaymentsWidgets | null>(null)
  const [user, setUser] = useState<any>(null)
  const [ready, setReady] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const { items, total } = useCartStore()

  const shipping = total() >= 50000 ? 0 : 3000
  const orderTotal = total() + shipping

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUser(user)
        setEmail(user.email ?? '')
      }
      setReady(true)
    })
  }, [])

  useEffect(() => {
    if (!ready || items.length === 0) return

    // 비회원은 랜덤 키, 로그인 유저는 user.id 사용 (특수문자 포함 필수)
    const customerKey = user
      ? user.id
      : `GUEST-${Date.now()}`

    loadTossPayments(TOSS_CLIENT_KEY).then(async (tossPayments) => {
      const widgets = tossPayments.widgets({ customerKey })
      widgetsRef.current = widgets

      // v2: amount를 먼저 설정
      await widgets.setAmount({ value: orderTotal, currency: 'KRW' })
      await widgets.renderPaymentMethods({ selector: '#payment-widget' })
      await widgets.renderAgreement({ selector: '#agreement-widget' })
    }).catch(console.error)
  }, [ready, orderTotal])

  const handlePay = async () => {
    if (!widgetsRef.current) return
    if (!name.trim()) { alert('이름을 입력해주세요.'); return }
    if (!email.trim() || !email.includes('@')) { alert('이메일을 올바르게 입력해주세요.'); return }

    setLoading(true)
    const orderId = `ORDER-${Date.now()}`
    try {
      // v2: requestPayment에 amount 없음 (setAmount로 이미 설정)
      await widgetsRef.current.requestPayment({
        orderId,
        orderName: items.length === 1
          ? (items[0].products?.name ?? '유니폼')
          : `${items[0].products?.name ?? '유니폼'} 외 ${items.length - 1}건`,
        customerName: name,
        customerEmail: email,
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

      {!user && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl px-5 py-3 mb-6 flex items-center gap-3">
          <span className="text-yellow-400 text-lg">👤</span>
          <p className="text-yellow-300 text-sm">
            비회원으로 구매하고 있어요.{' '}
            <a href="/auth/login" className="underline font-bold">로그인</a>하면 주문 내역을 확인할 수 있어요.
          </p>
        </div>
      )}

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
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              readOnly={!!user}
              placeholder="example@email.com"
              className={`w-full border rounded-lg px-4 py-2.5 text-white outline-none transition ${
                user
                  ? 'bg-[#0a0a0a] border-[#1e1e1e] text-gray-500 cursor-not-allowed'
                  : 'bg-[#0d0d0d] border-[#333] focus:border-green-500'
              }`}
            />
            {!user && <p className="text-gray-600 text-xs mt-1">주문 확인 이메일을 보내드려요</p>}
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
