import { Link } from 'react-router-dom'
import { useFavorites } from '../context/FavoritesContext'

export default function ProductCard({ producto, onDelete }) {
  const { isFavorite, toggleFavorite } = useFavorites()
  const fav = isFavorite(producto.id)
  const esCritico = producto.stock <= producto.stock_minimo

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-3 mb-2">
          <span className="text-xs font-mono px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
            {producto.codigo_barra}
          </span>
          <button
            onClick={() => toggleFavorite(producto)}
            className={`p-1.5 rounded-full text-lg transition-transform active:scale-95 ${
              fav ? 'bg-red-50 text-red-500' : 'bg-slate-50 text-slate-300 hover:text-slate-400'
            }`}
            title={fav ? 'Quitar de favoritos' : 'Agregar a favoritos'}
            aria-label="Favorito"
          >
            {fav ? '❤️' : '🤍'}
          </button>
        </div>

        <Link
          to={`/productos/${producto.id}`}
          className="text-base font-bold text-slate-800 hover:text-blue-600 line-clamp-2 mb-2 transition-colors"
        >
          {producto.nombre}
        </Link>

        {producto.descripcion && (
          <p className="text-xs text-slate-500 line-clamp-2 mb-4">
            {producto.descripcion}
          </p>
        )}

        <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block">Precio</span>
            <span className="text-lg font-bold text-slate-900">
              ${Number(producto.precio).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <span
            className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
              esCritico
                ? 'bg-red-100 text-red-700 border border-red-200'
                : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
            }`}
          >
            {esCritico ? `Stock: ${producto.stock} (Crítico)` : `Stock: ${producto.stock}`}
          </span>
        </div>
      </div>

      <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 flex items-center justify-between text-xs font-medium">
        <Link
          to={`/productos/${producto.id}`}
          className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
        >
          Ver detalles →
        </Link>

        {onDelete && (
          <button
            onClick={() => onDelete(producto.id)}
            className="text-red-500 hover:text-red-700 transition-colors"
            title="Eliminar producto"
          >
            Eliminar
          </button>
        )}
      </div>
    </div>
  )
}
