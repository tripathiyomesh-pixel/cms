/**
 * Toggle — reusable on/off switch
 * OFF: grey bg, white dot on LEFT
 * ON:  accent color bg, white dot on RIGHT with shadow
 *
 * Usage: <Toggle checked={value} onChange={fn} />
 */
export default function Toggle({ checked, onChange, disabled=false, size='md' }) {
  const sizes = {
    sm: { track:'w-8 h-4',   dot:'w-3 h-3',   on:'translate-x-4', off:'translate-x-0.5' },
    md: { track:'w-11 h-6',  dot:'w-5 h-5',   on:'translate-x-5', off:'translate-x-0.5' },
    lg: { track:'w-14 h-7',  dot:'w-6 h-6',   on:'translate-x-7', off:'translate-x-0.5' },
  };
  const s = sizes[size] || sizes.md;

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={[
        'relative inline-flex flex-shrink-0 items-center rounded-full',
        'border-2 border-transparent',
        'transition-colors duration-200 ease-in-out',
        'focus:outline-none focus:ring-2 focus:ring-gold-400 focus:ring-offset-2',
        s.track,
        checked
          ? 'bg-gold-500'
          : 'bg-ink-200 dark:bg-ink-600',
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
      ].join(' ')}
    >
      <span
        className={[
          'pointer-events-none inline-block rounded-full',
          'bg-white shadow-md',
          'transform transition-transform duration-200 ease-in-out',
          s.dot,
          checked ? s.on : s.off,
        ].join(' ')}
      />
    </button>
  );
}
