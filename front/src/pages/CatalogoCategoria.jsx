import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../api/client'
import ProductCard from '../components/ProductCard'
import LoadingSpinner from '../components/LoadingSpinner'
import Alert from '../components/Alert'

export default function CatalogoCategoria() {
  const { catId } = useParams()
  const [productos, setProductos] = useState([])
  const [categoria, setCategoria] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true

    async function loadFilteredData() {
      try {
        setLoading(true)
        setError(null)

        const [prodRes, catRes] = await Promise.all([
          api.getProductos(1, 100),
          api.getCategorias(1, 100),
        ])

        if (!isMounted) return

        const allProducts = prodRes.items || []
        const currentCat = (catRes.items || []).find((c) => c.id === Number(catId))

        setCategoria(currentCat || null)
        const filtered = allProducts.filter((p) => p.categoria_id === Number(catId))
        setProductos(filtered)
      } catch (err) {
        if (isMounted) {
          setError(`Error al consultar la categoría: ${err.message}`)
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadFilteredData()

    return () => {
      isMounted = false
    }
  }, [catId])

  if (loading) {
    return <LoadingSpinner text="Cargando productos de la categoría..." />
  }

  return (
    <div className="space-y-6">
      <Alert type="error" message={error} onClose={() => setError(null)} />

      <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wide">
            Categoría seleccionada
          </span>
          <h2 className="text-lg font-bold text-blue-950">
            {categoria ? categoria.nombre : `Categoría #${catId}`}
          </h2>
          {categoria?.descripcion && (
            <p className="text-xs text-blue-800 mt-0.5">{categoria.descripcion}</p>
          )}
        </div>
        <Link
          to="/productos"
          className="text-xs font-semibold px-3 py-1.5 bg-white text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
        >
          Ver todo el catálogo
        </Link>
      </div>

      {productos.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-slate-200 shadow-sm">
          <span className="text-4xl block mb-2">📦</span>
          <p className="text-base font-bold text-slate-800">
            No hay productos registrados en esta categoría
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Podés dar de alta artículos para esta categoría en la sección de administración.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {productos.map((prod) => (
            <ProductCard key={prod.id} producto={prod} />
          ))}
        </div>
      )}
    </div>
  )
}
