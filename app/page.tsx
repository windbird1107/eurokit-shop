import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase-server";
import ProductCard from "@/components/ProductCard";
import type { Product, League } from "@/types";

export default async function Home() {
  const supabase = await createClient();

  const { data: featured } = await supabase
    .from("products")
    .select("*, clubs(name, slug, leagues(name))")
    .eq("is_featured", true)
    .order("created_at", { ascending: false })
    .limit(8);

  const { data: newArrivals } = await supabase
    .from("products")
    .select("*, clubs(name, slug, leagues(name))")
    .eq("is_new", true)
    .order("created_at", { ascending: false })
    .limit(4);

  const { data: leagues } = await supabase
    .from("leagues")
    .select("*")
    .order("display_order");

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-[#0a0a0a] border-b border-[#1e1e1e] py-24 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#16a34a15_0%,_transparent_70%)]" />
        <div className="relative max-w-3xl mx-auto">
          <span className="inline-block bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-bold px-3 py-1 rounded-full mb-6 tracking-widest">
            2024/25 SEASON
          </span>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-4">
            EURO<span className="text-green-400">KIT</span>
          </h1>
          <p className="text-gray-400 text-lg mb-8">
            유럽 명문 클럽 공식 유니폼 · 맨유 · 레알 · 바르사 · 바이에른
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/products" className="bg-green-500 hover:bg-green-400 text-black font-black px-8 py-3 rounded-lg transition text-sm tracking-wide">
              전체 상품 보기
            </Link>
            <Link href="/products?kit_type=home" className="border border-[#333] hover:border-green-500 text-white px-8 py-3 rounded-lg transition text-sm">
              홈 유니폼만
            </Link>
          </div>
        </div>
      </section>

      {/* Leagues */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-lg font-black text-gray-300 mb-5 tracking-wider uppercase">리그별 보기</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {(leagues as League[])?.map((l) => (
            <Link
              key={l.slug}
              href={`/products?league=${l.slug}`}
              className="bg-[#111] border border-[#1e1e1e] hover:border-green-500/60 rounded-xl p-5 text-center transition group flex flex-col items-center gap-3"
            >
              {l.logo_url ? (
                <div className="relative w-14 h-14">
                  <Image
                    src={l.logo_url}
                    alt={l.name}
                    fill
                    className="object-contain drop-shadow-lg"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="w-14 h-14 rounded-full bg-[#1e1e1e] flex items-center justify-center text-2xl">🏆</div>
              )}
              <p className="text-white text-xs font-bold group-hover:text-green-400 transition leading-tight">{l.name}</p>
              <p className="text-gray-600 text-xs">{l.country}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* New Arrivals */}
      {newArrivals && newArrivals.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-black text-gray-300 tracking-wider uppercase">
              🆕 신상품
            </h2>
            <Link href="/products?is_new=true" className="text-green-400 text-sm hover:underline">전체 보기 →</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {(newArrivals as Product[]).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Featured */}
      {featured && featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-black text-gray-300 tracking-wider uppercase">
              ⭐ 추천 상품
            </h2>
            <Link href="/products" className="text-green-400 text-sm hover:underline">전체 보기 →</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {(featured as Product[]).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
