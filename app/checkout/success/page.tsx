'use client'
import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense } from 'react'
import { useCartStore } from '@/store/cart'

function SuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [msg, setMsg] = useState('')
  const clear = useCartStore((s) => s.clear)

  useEffect(() => {
    const paymentKey = searchParams.get('paymentKey')
    const orderId = searchParams.get('orderId')
    const amount = searchParams.get('amount')

    if (!paymentKey || !orderId || !amount) { setStatus('error'); setMsg('잘못된 요청입니다.'); return }

    fetch('/api/payments/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentKey, orderId, amount: Number(amount) }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) { setStatus('success'); clear() }
        else { setStatus('error'); setMsg(data.message ?? '결제 실패') }
      })
      .catch(() => { setStatus('error'); setMsg('서버 오류') })
  }, [])

  if (status === 'loading') return (
    <div className="text-center py-24 text-gray-400">
      <div className="animate-spin text-4xl mb-4">⚙️</div>
      <p>결제 확인 중...</p>
    </div>
  )

  if (status === 'error') return (
    <div className="text-center py-24">
      <p className="text-4xl mb-4">❌</p>
      <p className="text-xl font-bold text-red-400 mb-2">결제 실패</p>
      <p className="text-gray-500 mb-8">{msg}</p>
      <button onClick={() => router.push('/cart')} className="bg-green-500 text-black font-black px-8 py-3 rounded-xl">장바구니로 돌아가기</button>
    </div>
  )

  return (
    <div className="text-center py-24">
      <div className="text-6xl mb-4">✅</div>
      <h1 className="text-2xl font-black mb-2">결제가 완료되었습니다!</h1>
      <p className="text-gray-400 mb-2">주문 ID: {searchParams.get('orderId')}</p>
      <p className="text-gray-400 mb-8">결제 금액: {Number(searchParams.get('amount')).toLocaleString()}원</p>
      <div className="flex gap-3 justify-center">
        <button onClick={() => router.push('/')} className="border border-[#333] text-white px-6 py-2.5 rounded-xl hover:border-green-500 transition">홈으로</button>
        <button onClick={() => router.push('/products')} className="bg-green-500 text-black font-black px-6 py-2.5 rounded-xl hover:bg-green-400 transition">쇼핑 계속하기</button>
      </div>
    </div>
  )
}

export default function SuccessPage() {
  return <Suspense><SuccessContent /></Suspense>
}
