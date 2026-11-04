import { useState, useEffect } from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import { api } from '../api/client'
import Alert from '../components/Alert'

export default function CatalogoLayout() {
  const [categorias, setCategorias] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true

    async function fetchCategorias() {
      try {
        const res = await api.getCategorias(1, 100)
        if (isMounted) {
          setCategorias(res.items || [])
        }
      } catch (err) {
        if (isMounted) {
          setError(`No se pudieron cargar las categorías: ${err.message}`)
        }
      }
    }

    fetchCategorias()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Catálogo de Productos
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Listado general de herramientas, accesorios y materiales de ferretería.
          </p>
        </div>
      </div>

      <Alert type="error" message={error} onClose={() => setError(null)} />

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
          Filtrar por Categoría (Subrutas Anidadas):
        </span>
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <NavLink
            to="/productos"
            end
            className={({ isActive }) =>
              `px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`
            }
          >
            Todas las categorías
          </NavLink>

          {categorias.map((cat) => (
            <NavLink
              key={cat.id}
              to={`/productos/categoria/${cat.id}`}
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`
              }
            >
              {cat.nombre}
            </NavLink>
          ))}
        </div>
      </div>

      <Outlet />
    </div>
  )
}
