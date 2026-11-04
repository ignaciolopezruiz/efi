export default function Alert({ type = 'error', message, onClose }) {
  if (!message) return null

  const isError = type === 'error'

  return (
    <div
      className={`flex items-start justify-between p-4 mb-6 rounded-lg border ${
        isError
          ? 'bg-red-50 border-red-200 text-red-800'
          : 'bg-emerald-50 border-emerald-200 text-emerald-800'
      }`}
    >
      <div className="flex items-center gap-3">
        <span className="text-xl">{isError ? '⚠️' : '✅'}</span>
        <p className="text-sm font-medium">{message}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 font-bold ml-4"
          aria-label="Cerrar alerta"
        >
          ×
        </button>
      )}
    </div>
  )
}
