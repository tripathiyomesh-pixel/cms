/**
 * Topbar — per-page header (title + subtitle + page-specific action buttons)
 * Notification bell and user menu are in TopNavBar (always visible)
 */
export default function Topbar({ title, subtitle, actions }) {
  if (!title && !subtitle && !actions) return null;
  return (
    <div className="flex items-center justify-between px-5 py-3 bg-white dark:bg-ink-900 border-b border-ink-200/40 dark:border-ink-800 flex-shrink-0">
      <div className="min-w-0">
        <h1 className="text-sm font-semibold text-ink-800 dark:text-ink-100 truncate leading-none">{title}</h1>
        {subtitle && <p className="text-[11px] text-ink-400 truncate mt-0.5">{subtitle}</p>}
      </div>
      {actions && (
        <div className="flex items-center gap-2 flex-shrink-0 ml-4">{actions}</div>
      )}
    </div>
  );
}
