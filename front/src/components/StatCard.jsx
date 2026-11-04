export default function StatCard({ icon, label, value, color = 'blue' }) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    yellow: 'bg-amber-50 text-amber-600 border-amber-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    green: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 flex items-center gap-4">
      <div
        className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl border ${
          colorClasses[color] || colorClasses.blue
        }`}
      >
        {icon}
      </div>
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {label}
        </span>
        <h3 className="text-2xl font-bold text-slate-800 mt-1">{value}</h3>
      </div>
    </div>
  )
}
