import { useState, useEffect, useCallback } from 'react'
import { getProducts } from '../services/productService'

export function useProducts({ category, q, limit: limitCount = 20 } = {}) {
  const [products, setProducts] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)
  const [total,    setTotal]    = useState(0)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = { limit: limitCount, sort: 'newest' }
      if (category && category !== 'All') params.category = category
      if (q) params.q = q
      const data = await getProducts(params)
      setProducts(data.products || [])
      setTotal(data.total || 0)
    } catch (err) {
      setError(err.message)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [category, q, limitCount])

  useEffect(() => { fetch() }, [fetch])

  return { products, loading, error, total, refetch: fetch }
}
