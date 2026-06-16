'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useCartStore } from '@/store/cart'
import { createClient } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

export default function Navbar() {
  const count = useCartStore((s) => s.count())
  const [user, setUser] = useState<User | null>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  return (
    <nav className="bg-[#0a0a0a] border-b border-[#1e1e1e] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        <Link href="/" className="text-white font-black text-xl tracking-tight">
          EURO<span className="text-green-400">KIT</span>
        </Link>

        <div className="hidden md:flex gap-8 text-sm text-gray-300">
          <Link href="/products" className="hover:text-white transition">전체 상품</Link>
          <Link href="/products?league=premier-league" className="hover:text-white transition">프리미어리그</Link>
          <Link href="/products?league=la-liga" className="hover:text-white transition">라리가</Link>
          <Link href="/products?league=bundesliga" className="hover:text-white transition">분데스리가</Link>
          <Link href="/products?league=serie-a" className="hover:text-white transition">세리에A</Link>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="text-gray-400 text-sm hidden sm:block">{user.email?.split('@')[0]}</span>
              <button onClick={logout} className="text-gray-400 hover:text-white text-sm transition">로그아웃</button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="text-gray-300 hover:text-white text-sm transition">로그인</Link>
              <Link href="/auth/signup" className="bg-green-500 hover:bg-green-400 text-black text-sm font-bold px-3 py-1.5 rounded transition">회원가입</Link>
            </>
          )}
          <Link href="/cart" className="relative">
            <span className="text-2xl">🛒</span>
            {count > 0 && (
              <span className="absolute -top-2 -right-2 bg-green-500 text-black text-xs font-black w-5 h-5 rounded-full flex items-center justify-center">
                {count > 9 ? '9+' : count}
              </span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  )
}
