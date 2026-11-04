import { useState, useEffect } from 'react'
import { api } from '../api/client'
import ProductCard from '../components/ProductCard'
import LoadingSpinner from '../components/LoadingSpinner'
import Alert from '../components/Alert'

export default function Catalogo() {
  const [productos, setProductos] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true

    async function loadData() {
      try {
        setLoading(true)
        setError(null)
        const res = await api.getProductos(1, 100)
        if (isMounted) {
          setProductos(res.items || [])
        }
      } catch (err) {
        if (isMounted) {
          setError(`Error al cargar el catálogo: ${err.message}`)
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadData()

    return () => {
      isMounted = false
    }
  }, [])

  const filtered = productos.filter((p) => {
    const q = searchTerm.toLowerCase()
    return (
      p.nombre.toLowerCase().includes(q) ||
      p.codigo_barra.toLowerCase().includes(q)
    )
  })

  if (loading) {
    return <LoadingSpinner text="Cargando catálogo de productos..." />
  }

  return (
    <div className="space-y-6">
      <Alert type="error" message={error} onClose={() => setError(null)} />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:max-w-md relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre o código de barra..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
          />
          <span className="absolute left-3 top-2.5 text-slate-400">🔍</span>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600 font-bold"
            >
              ✕
            </button>
          )}
        </div>

        <span className="text-xs font-semibold text-slate-500">
          Mostrando {filtered.length} de {productos.length} artículos
        </span>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-slate-200 shadow-sm">
          <span className="text-4xl block mb-2">🔍</span>
          <p className="text-base font-bold text-slate-800">
            No se encontraron productos
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Intentá con otros términos de búsqueda o limpiá los filtros.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((prod) => (
            <ProductCard key={prod.id} producto={prod} />
          ))}
        </div>
      )}
    </div>
  )
}
