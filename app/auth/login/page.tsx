'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(''); setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) { setError('이메일 또는 비밀번호가 틀렸습니다.'); return }
    router.push('/')
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black">EURO<span className="text-green-400">KIT</span></h1>
          <p className="text-gray-400 mt-2 text-sm">로그인 후 쇼핑을 시작하세요</p>
        </div>

        <form onSubmit={handleLogin} className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-8 space-y-4">
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
            <label className="text-gray-400 text-sm block mb-1">비밀번호</label>
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
            {loading ? '로그인 중...' : '로그인'}
          </button>
          <p className="text-center text-gray-500 text-sm">
            계정이 없으신가요?{' '}
            <Link href="/auth/signup" className="text-green-400 hover:underline font-bold">회원가입</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
