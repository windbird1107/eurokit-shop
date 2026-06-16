import Link from 'next/link'
import Image from 'next/image'
import type { Product } from '@/types'

const kitTypeLabel: Record<string, string> = {
  home: '홈', away: '어웨이', third: '써드', goalkeeper: '골키퍼', special: '스페셜'
}

export default function ProductCard({ product }: { product: Product }) {
  const discount = product.original_price
    ? Math.round((1 - product.price / product.original_price) * 100)
    : 0

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="bg-[#111] border border-[#1e1e1e] rounded-xl overflow-hidden hover:border-green-500/50 transition-all duration-300">
        <div className="relative aspect-square bg-[#0d0d0d] overflow-hidden">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl">👕</div>
          )}
          <div className="absolute top-3 left-3 flex flex-col gap-1">
            {product.is_new && (
              <span className="bg-green-500 text-black text-xs font-black px-2 py-0.5 rounded">NEW</span>
            )}
            {discount > 0 && (
              <span className="bg-red-500 text-white text-xs font-black px-2 py-0.5 rounded">-{discount}%</span>
            )}
          </div>
          <span className="absolute top-3 right-3 bg-black/70 text-gray-300 text-xs px-2 py-0.5 rounded">
            {kitTypeLabel[product.kit_type] ?? product.kit_type}
          </span>
        </div>
        <div className="p-4">
          {product.clubs && (
            <div className="flex items-center gap-2 mb-2">
              {product.clubs.logo_url && (
                <div className="relative w-5 h-5 flex-shrink-0">
                  <Image
                    src={product.clubs.logo_url}
                    alt={product.clubs.name}
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
              )}
              <p className="text-green-400 text-xs font-bold truncate">{product.clubs.name}</p>
            </div>
          )}
          <h3 className="text-white text-sm font-semibold leading-snug mb-2 line-clamp-2">{product.name}</h3>
          <div className="flex items-baseline gap-2">
            {product.original_price && (
              <span className="text-gray-500 text-xs line-through">{product.original_price.toLocaleString()}원</span>
            )}
            <span className="text-white font-black text-base">{product.price.toLocaleString()}원</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
