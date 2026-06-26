import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatCard({ title, value, sub, icon: Icon, color = 'gold', trend, onClick }) {
  const palette = {
    gold:   { ring: 'ring-gold-200 dark:ring-gold-800',   iconBg: 'bg-gold-50 dark:bg-gold-900/20',   iconColor: 'text-gold-600 dark:text-gold-400' },
    blue:   { ring: 'ring-blue-200 dark:ring-blue-800',   iconBg: 'bg-blue-50 dark:bg-blue-900/20',   iconColor: 'text-blue-600 dark:text-blue-400' },
    green:  { ring: 'ring-green-200 dark:ring-green-800', iconBg: 'bg-green-50 dark:bg-green-900/20', iconColor: 'text-green-600 dark:text-green-400' },
    purple: { ring: 'ring-purple-200 dark:ring-purple-800',iconBg:'bg-purple-50 dark:bg-purple-900/20',iconColor:'text-purple-600 dark:text-purple-400' },
    red:    { ring: 'ring-red-200 dark:ring-red-800',     iconBg: 'bg-red-50 dark:bg-red-900/20',     iconColor: 'text-red-600 dark:text-red-400' },
  };
  const p = palette[color] || palette.gold;

  return (
    <div
      onClick={onClick}
      className={`card p-5 transition-all duration-150 ${onClick ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-md' : ''}`}
    >
      <div className="flex items-start justify-between mb-3">
        {Icon && (
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${p.iconBg}`}>
            <Icon size={16} className={p.iconColor} />
          </div>
        )}
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-[11px] font-semibold ${trend >= 0 ? 'text-green-600' : 'text-red-500'}`}>
            {trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-ink-800 dark:text-ink-100 leading-none mb-1">{value ?? '—'}</p>
      <p className="text-xs text-ink-500 dark:text-ink-400 font-medium">{title}</p>
      {sub && <p className="text-[11px] text-ink-400 dark:text-ink-500 mt-0.5">{sub}</p>}
    </div>
  );
}
