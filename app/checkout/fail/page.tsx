'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function FailContent() {
  const router = useRouter()
  const p = useSearchParams()
  return (
    <div className="text-center py-24">
      <p className="text-5xl mb-4">❌</p>
      <h1 className="text-2xl font-black mb-2 text-red-400">결제가 취소되었습니다</h1>
      <p className="text-gray-500 mb-2">{p.get('message') ?? '결제가 완료되지 않았습니다.'}</p>
      <p className="text-gray-600 text-sm mb-8">오류코드: {p.get('code')}</p>
      <div className="flex gap-3 justify-center">
        <button onClick={() => router.push('/cart')} className="bg-green-500 text-black font-black px-6 py-2.5 rounded-xl hover:bg-green-400 transition">장바구니로</button>
        <button onClick={() => router.push('/')} className="border border-[#333] text-white px-6 py-2.5 rounded-xl hover:border-white/50 transition">홈으로</button>
      </div>
    </div>
  )
}

export default function FailPage() {
  return <Suspense><FailContent /></Suspense>
}
