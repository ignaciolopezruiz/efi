import { Link } from 'react-router-dom'
import { useFavorites } from '../context/FavoritesContext'
import ProductCard from '../components/ProductCard'

export default function Favoritos() {
  const { favorites, clearFavorites } = useFavorites()

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2">
            <span>❤️</span>
            <span>Productos Favoritos</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Artículos guardados en tu lista de seguimiento personal (gestión de estado global con Context API).
          </p>
        </div>

        {favorites.length > 0 && (
          <button
            onClick={clearFavorites}
            className="px-4 py-2 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 transition-colors self-start"
          >
            Vaciar lista de favoritos
          </button>
        )}
      </div>

      {favorites.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm max-w-lg mx-auto">
          <span className="text-5xl block mb-3">🤍</span>
          <h2 className="text-lg font-bold text-slate-800">
            Tu lista de favoritos está vacía
          </h2>
          <p className="text-xs text-slate-500 mt-1 mb-6">
            Podés guardar herramientas y artículos del catálogo haciendo clic en el icono del corazón.
          </p>
          <Link
            to="/productos"
            className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors inline-block"
          >
            Explorar catálogo
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((prod) => (
            <ProductCard key={prod.id} producto={prod} />
          ))}
        </div>
      )}
    </div>
  )
}
