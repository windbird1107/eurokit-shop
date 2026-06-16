'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 6) { setError('비밀번호는 6자 이상이어야 합니다.'); return }
    setError(''); setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({ email, password })
    setLoading(false)
    if (error) { setError(error.message); return }
    setSuccess(true)
  }

  if (success) return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-5xl mb-4">📧</p>
        <h2 className="text-xl font-black mb-2">이메일을 확인해주세요!</h2>
        <p className="text-gray-400 text-sm mb-6">{email}로 인증 메일을 보냈습니다.</p>
        <Link href="/auth/login" className="bg-green-500 text-black font-black px-6 py-2.5 rounded-xl hover:bg-green-400 transition">
          로그인하기
        </Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black">EURO<span className="text-green-400">KIT</span></h1>
          <p className="text-gray-400 mt-2 text-sm">회원가입 후 특별 혜택을 누리세요</p>
        </div>

        <form onSubmit={handleSignup} className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-8 space-y-4">
          <div>
            <label className="text-gray-400 text-sm block mb-1">이메일</label>
            <input
              type="email" required value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              className="w-full bg-[#0d0d0d] border border-[#333] rounded-lg px-4 py-2.5 text-white outline-none focus:border-green-500 transition"
            />
          </div>
          <div>
            <label className="text-gray-400 text-sm block mb-1">비밀번호 (6자 이상)</label>
            <input
              type="password" required value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#0d0d0d] border border-[#333] rounded-lg px-4 py-2.5 text-white outline-none focus:border-green-500 transition"
            />
          </div>
          {error && <p className="text-red-400 text-sm bg-red-500/10 px-3 py-2 rounded-lg">{error}</p>}
          <button
            type="submit" disabled={loading}
            className="w-full bg-green-500 hover:bg-green-400 disabled:opacity-50 text-black font-black py-3 rounded-xl transition"
          >
            {loading ? '가입 중...' : '회원가입'}
          </button>
          <p className="text-center text-gray-500 text-sm">
            이미 계정이 있으신가요?{' '}
            <Link href="/auth/login" className="text-green-400 hover:underline font-bold">로그인</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
