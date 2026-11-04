import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="max-w-md mx-auto text-center py-16 px-4">
      <span className="text-6xl block mb-4">🚧</span>
      <h1 className="text-3xl font-extrabold text-slate-900">404</h1>
      <h2 className="text-lg font-bold text-slate-700 mt-1">Página no encontrada</h2>
      <p className="text-xs text-slate-500 mt-2 mb-6">
        La ruta solicitada no existe o ha sido movida dentro del catálogo de la ferretería.
      </p>
      <Link
        to="/"
        className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors inline-block"
      >
        Volver al inicio
      </Link>
    </div>
  )
}
