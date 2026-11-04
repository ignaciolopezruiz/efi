import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import { useFavorites } from '../context/FavoritesContext'
import LoadingSpinner from '../components/LoadingSpinner'
import Alert from '../components/Alert'

export default function DetalleProducto() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isFavorite, toggleFavorite } = useFavorites()

  const [producto, setProducto] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true

    async function fetchDetalle() {
      try {
        setLoading(true)
        setError(null)
        const data = await api.getProductoById(id)
        if (isMounted) {
          setProducto(data)
        }
      } catch (err) {
        if (isMounted) {
          setError(`No se pudo obtener el producto: ${err.message}`)
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchDetalle()

    return () => {
      isMounted = false
    }
  }, [id])

  if (loading) {
    return <LoadingSpinner text="Consultando detalles del producto..." />
  }

  if (error || !producto) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Alert type="error" message={error || 'Producto no encontrado'} />
        <div className="bg-white p-8 rounded-xl border border-slate-200 text-center shadow-sm">
          <span className="text-4xl block mb-2">🔎</span>
          <h2 className="text-xl font-bold text-slate-800">Artículo Inexistente</h2>
          <p className="text-sm text-slate-500 mt-2">
            El identificador #{id} no coincide con ningún producto activo en el catálogo.
          </p>
          <button
            onClick={() => navigate('/productos')}
            className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            ← Volver al catálogo
          </button>
        </div>
      </div>
    )
  }

  const fav = isFavorite(producto.id)
  const esCritico = producto.stock <= producto.stock_minimo

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link
          to="/productos"
          className="text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
        >
          ← Volver al catálogo
        </Link>
        <span className="text-xs font-mono text-slate-400">
          ID de registro: #{producto.id}
        </span>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <span className="px-3 py-1 bg-slate-100 text-slate-700 font-mono text-xs font-semibold rounded-md inline-block mb-3">
                SKU: {producto.codigo_barra}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                {producto.nombre}
              </h1>
            </div>

            <button
              onClick={() => toggleFavorite(producto)}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 border transition-all ${
                fav
                  ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <span>{fav ? '❤️' : '🤍'}</span>
              <span>{fav ? 'En Favoritos' : 'Guardar en Favoritos'}</span>
            </button>
          </div>

          <div className="p-5 bg-slate-50 rounded-xl border border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">
                Precio Unitario
              </span>
              <div className="text-3xl font-black text-slate-900 mt-1">
                ${Number(producto.precio).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
              </div>
            </div>

            <div>
              <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">
                Disponibilidad en Depósito
              </span>
              <div className="flex items-center gap-3 mt-1">
                <span
                  className={`text-lg font-bold px-3 py-1 rounded-lg border ${
                    esCritico
                      ? 'bg-red-100 text-red-700 border-red-200'
                      : 'bg-emerald-100 text-emerald-700 border-emerald-200'
                  }`}
                >
                  {producto.stock} unidades
                </span>
                <span className="text-xs text-slate-500">
                  (Mínimo deseado: {producto.stock_minimo})
                </span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">
              Descripción del Producto
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              {producto.descripcion || 'Sin descripción técnica adicional registrada.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-100">
            <div className="p-5 rounded-xl border border-blue-100 bg-blue-50/50">
              <span className="text-xs font-bold uppercase text-blue-600 tracking-wider">
                Categoría Asociada
              </span>
              <h4 className="text-base font-bold text-slate-900 mt-1">
                {producto.categoria?.nombre || `ID #${producto.categoria_id}`}
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                {producto.categoria?.descripcion || 'Clasificación de artículos del catálogo'}
              </p>
            </div>

            <div className="p-5 rounded-xl border border-emerald-100 bg-emerald-50/50">
              <span className="text-xs font-bold uppercase text-emerald-600 tracking-wider">
                Proveedor Oficial
              </span>
              <h4 className="text-base font-bold text-slate-900 mt-1">
                {producto.proveedor?.nombre || `ID #${producto.proveedor_id}`}
              </h4>
              <p className="text-xs text-slate-500 mt-1 font-mono">
                CUIT: {producto.proveedor?.cuit || 'No registrado'}
              </p>
              {producto.proveedor?.email && (
                <p className="text-xs text-slate-500 mt-0.5">
                  Contacto: {producto.proveedor.email}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
