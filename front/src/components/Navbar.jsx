import { NavLink, Link } from 'react-router-dom'
import { useFavorites } from '../context/FavoritesContext'

export default function Navbar() {
  const { count } = useFavorites()

  const navLinkClass = ({ isActive }) =>
    `px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
      isActive
        ? 'bg-blue-50 text-blue-700 shadow-sm'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
    }`

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3">
            <span className="text-2xl p-2 bg-blue-50 rounded-xl border border-blue-100">🛠️</span>
            <div>
              <span className="text-lg font-bold text-slate-900 leading-tight block">
                Ferretería Industrial
              </span>
              <span className="text-xs text-slate-500 font-medium block">
                EFI — PP1 React
              </span>
            </div>
          </Link>

          <nav className="flex items-center gap-1 sm:gap-2">
            <NavLink to="/" end className={navLinkClass}>
              <span>📊</span>
              <span>Tablero</span>
            </NavLink>

            <NavLink to="/productos" className={navLinkClass}>
              <span>📦</span>
              <span>Catálogo</span>
            </NavLink>

            <NavLink to="/favoritos" className={navLinkClass}>
              <span>❤️</span>
              <span>Favoritos</span>
              {count > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs font-bold bg-red-500 text-white rounded-full">
                  {count}
                </span>
              )}
            </NavLink>

            <NavLink to="/administracion" className={navLinkClass}>
              <span>⚙️</span>
              <span>Administración</span>
            </NavLink>
          </nav>
        </div>
      </div>
    </header>
  )
}
