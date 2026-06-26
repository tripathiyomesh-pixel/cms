const CONFIGS = {
  // Product status
  active:      { label: 'Active',      cls: 'badge badge-green' },
  published:   { label: 'Published',   cls: 'badge badge-green' },
  draft:       { label: 'Draft',       cls: 'badge badge-gold' },
  inactive:    { label: 'Inactive',    cls: 'badge badge-gray' },
  archived:    { label: 'Archived',    cls: 'badge badge-gray' },
  sold:        { label: 'Sold',        cls: 'badge badge-red' },
  // Enquiry / lead
  new:         { label: 'New',         cls: 'badge badge-blue' },
  contacted:   { label: 'Contacted',   cls: 'badge badge-gold' },
  qualified:   { label: 'Qualified',   cls: 'badge bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' },
  quoted:      { label: 'Quoted',      cls: 'badge badge-gold' },
  won:         { label: 'Won',         cls: 'badge badge-green' },
  lost:        { label: 'Lost',        cls: 'badge badge-red' },
  // Appointment
  pending:     { label: 'Pending',     cls: 'badge badge-gold' },
  confirmed:   { label: 'Confirmed',   cls: 'badge badge-blue' },
  completed:   { label: 'Completed',   cls: 'badge badge-green' },
  cancelled:   { label: 'Cancelled',   cls: 'badge badge-gray' },
  no_show:     { label: 'No Show',     cls: 'badge badge-red' },
  // Order
  processing:  { label: 'Processing',  cls: 'badge badge-blue' },
  shipped:     { label: 'Shipped',     cls: 'badge bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' },
  delivered:   { label: 'Delivered',   cls: 'badge badge-green' },
  refunded:    { label: 'Refunded',    cls: 'badge badge-red' },
};

export default function StatusBadge({ status, label: overrideLabel }) {
  const cfg = CONFIGS[status?.toLowerCase?.()] || {
    label: overrideLabel || status || '—',
    cls: 'badge badge-gray',
  };
  return <span className={cfg.cls}>{overrideLabel || cfg.label}</span>;
}
