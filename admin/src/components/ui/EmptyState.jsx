export default function EmptyState({ icon, title, message, actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {icon && (
        <div className="text-4xl mb-4 select-none">{icon}</div>
      )}
      <h3 className="text-sm font-semibold text-ink-700 dark:text-ink-200 mb-1">{title}</h3>
      {message && (
        <p className="text-xs text-ink-400 dark:text-ink-500 max-w-xs mb-5">{message}</p>
      )}
      {actionLabel && onAction && (
        <button onClick={onAction} className="btn-gold">
          {actionLabel}
        </button>
      )}
    </div>
  );
}
