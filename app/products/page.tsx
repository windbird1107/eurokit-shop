import { createClient } from "@/lib/supabase-server";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";
import type { Product } from "@/types";

interface Props {
  searchParams: Promise<{ league?: string; kit_type?: string; is_new?: string }>;
}

export default async function ProductsPage({ searchParams }: Props) {
  const params = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("products")
    .select("*, clubs(name, slug, logo_url, league_id, leagues(name, slug))")
    .order("created_at", { ascending: false });

  if (params.league) {
    const { data: league } = await supabase.from("leagues").select("id").eq("slug", params.league).single();
    if (league) {
      const { data: clubs } = await supabase.from("clubs").select("id").eq("league_id", league.id);
      if (clubs && clubs.length > 0) {
        query = query.in("club_id", clubs.map((c) => c.id));
      }
    }
  }
  if (params.kit_type) query = query.eq("kit_type", params.kit_type);
  if (params.is_new === "true") query = query.eq("is_new", true);

  const { data: products } = await query;
  const { data: leagues } = await supabase.from("leagues").select("*").order("display_order");

  const kitTypes = [
    { value: "", label: "전체" },
    { value: "home", label: "홈" },
    { value: "away", label: "어웨이" },
    { value: "third", label: "써드" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-black mb-8">전체 상품</h1>

      {/* 필터 */}
      <div className="flex flex-wrap gap-2 mb-8">
        <Link
          href="/products"
          className={`px-4 py-1.5 rounded-full text-sm font-bold border transition ${
            !params.league && !params.kit_type ? "bg-green-500 text-black border-green-500" : "border-[#333] text-gray-400 hover:border-green-500 hover:text-white"
          }`}
        >
          전체 리그
        </Link>
        {leagues?.map((l) => (
          <Link
            key={l.slug}
            href={`/products?league=${l.slug}`}
            className={`px-4 py-1.5 rounded-full text-sm font-bold border transition ${
              params.league === l.slug ? "bg-green-500 text-black border-green-500" : "border-[#333] text-gray-400 hover:border-green-500 hover:text-white"
            }`}
          >
            {l.name}
          </Link>
        ))}
        <span className="w-px bg-[#333] mx-1" />
        {kitTypes.map((k) => (
          <Link
            key={k.value}
            href={k.value ? `/products?${params.league ? `league=${params.league}&` : ""}kit_type=${k.value}` : (params.league ? `/products?league=${params.league}` : "/products")}
            className={`px-4 py-1.5 rounded-full text-sm font-bold border transition ${
              (k.value === "" && !params.kit_type) || params.kit_type === k.value
                ? "bg-white/10 text-white border-white/30"
                : "border-[#333] text-gray-400 hover:border-white/30 hover:text-white"
            }`}
          >
            {k.label}
          </Link>
        ))}
      </div>

      {/* 상품 그리드 */}
      {products && products.length > 0 ? (
        <>
          <p className="text-gray-500 text-sm mb-4">{products.length}개 상품</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {(products as Product[]).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-20 text-gray-500">
          <p className="text-4xl mb-4">👕</p>
          <p>해당 조건의 상품이 없습니다.</p>
        </div>
      )}
    </div>
  );
}
