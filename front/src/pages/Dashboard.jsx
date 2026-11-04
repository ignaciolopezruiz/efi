import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import StatCard from '../components/StatCard'
import LoadingSpinner from '../components/LoadingSpinner'
import Alert from '../components/Alert'

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalProductos: 0,
    stockCritico: 0,
    totalCategorias: 0,
    totalProveedores: 0,
  })
  const [lowStock, setLowStock] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true

    async function loadDashboard() {
      try {
        setLoading(true)
        setError(null)

        const [prodRes, catRes, provRes] = await Promise.all([
          api.getProductos(1, 100),
          api.getCategorias(1, 100),
          api.getProveedores(1, 100),
        ])

        if (!isMounted) return

        const productos = prodRes.items || []
        const categorias = catRes.items || []
        const proveedores = provRes.items || []
        const criticos = productos.filter((p) => p.stock <= p.stock_minimo)

        setStats({
          totalProductos: productos.length,
          stockCritico: criticos.length,
          totalCategorias: categorias.length,
          totalProveedores: proveedores.length,
        })
        setLowStock(criticos)
      } catch (err) {
        if (isMounted) {
          setError(`No se pudieron cargar las métricas: ${err.message}`)
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadDashboard()

    return () => {
      isMounted = false
    }
  }, [])

  if (loading) {
    return <LoadingSpinner text="Consultando métricas del sistema..." />
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
          Tablero Principal
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Resumen general del inventario, estado de alertas y stock de la ferretería.
        </p>
      </div>

      <Alert type="error" message={error} onClose={() => setError(null)} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon="📦"
          label="Total Productos"
          value={stats.totalProductos}
          color="blue"
        />
        <StatCard
          icon="⚠️"
          label="Stock Crítico"
          value={stats.stockCritico}
          color="yellow"
        />
        <StatCard
          icon="🏷️"
          label="Categorías"
          value={stats.totalCategorias}
          color="purple"
        />
        <StatCard
          icon="🏭"
          label="Proveedores"
          value={stats.totalProveedores}
          color="green"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>🚨</span>
              <span>Alertas de Stock Bajo</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Productos con cantidad menor o igual al punto de reorden
            </p>
          </div>
          <span className="px-3 py-1 bg-amber-50 text-amber-700 text-xs font-semibold rounded-full border border-amber-200">
            {lowStock.length} alerta{lowStock.length !== 1 ? 's' : ''}
          </span>
        </div>

        {lowStock.length === 0 ? (
          <div className="p-12 text-center">
            <span className="text-4xl block mb-2">🎉</span>
            <p className="text-sm font-semibold text-slate-700">
              No hay productos con stock crítico
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Todos los artículos se encuentran por encima de su stock mínimo configurado.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-6">Código</th>
                  <th className="py-3 px-6">Artículo</th>
                  <th className="py-3 px-6">Stock Actual</th>
                  <th className="py-3 px-6">Stock Mínimo</th>
                  <th className="py-3 px-6 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {lowStock.map((prod) => (
                  <tr key={prod.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-6 font-mono text-xs text-slate-600">
                      {prod.codigo_barra}
                    </td>
                    <td className="py-3.5 px-6 font-medium text-slate-800">
                      {prod.nombre}
                    </td>
                    <td className="py-3.5 px-6">
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-red-100 text-red-700 border border-red-200">
                        {prod.stock} un.
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-slate-500">
                      {prod.stock_minimo} un.
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <Link
                        to={`/productos/${prod.id}`}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-800 underline"
                      >
                        Ver detalle
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          to="/productos"
          className="p-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl shadow-sm hover:from-blue-700 hover:to-blue-800 transition-all flex items-center justify-between group"
        >
          <div>
            <h3 className="text-lg font-bold">Explorar Catálogo Completo</h3>
            <p className="text-xs text-blue-100 mt-1">
              Buscá herramientas, filtrá por categorías y gestioná tus favoritos.
            </p>
          </div>
          <span className="text-2xl transform group-hover:translate-x-1 transition-transform">
            →
          </span>
        </Link>

        <Link
          to="/administracion"
          className="p-6 bg-slate-900 text-white rounded-xl shadow-sm hover:bg-slate-800 transition-all flex items-center justify-between group"
        >
          <div>
            <h3 className="text-lg font-bold">Administración de Inventario</h3>
            <p className="text-xs text-slate-400 mt-1">
              Registrá nuevos artículos y gestioná altas y bajas del catálogo.
            </p>
          </div>
          <span className="text-2xl transform group-hover:translate-x-1 transition-transform">
            →
          </span>
        </Link>
      </div>
    </div>
  )
}
