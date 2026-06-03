import ProductCard from './ProductCard'
import { SkeletonGrid } from '../ui/SkeletonCard'

export default function ProductGrid({ products = [], loading = false, skeletonCount = 6 }) {
  if (loading) return <SkeletonGrid count={skeletonCount} />

  if (!products.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="text-5xl mb-4">📦</div>
        <p className="text-gray-400 font-medium">No products found</p>
        <p className="text-gray-600 text-sm mt-1">Try a different category or search</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 px-4">
      {products.map((p, i) => (
        <ProductCard key={p.productId || i} product={p} index={i} />
      ))}
    </div>
  )
}
