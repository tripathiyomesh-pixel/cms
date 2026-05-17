const DEFAULT_BADGES = [
  { emoji:'🏆', label:'GIA & IGI Certified' },
  { emoji:'💎', label:'Conflict-free diamonds' },
  { emoji:'🔄', label:'30-day returns' },
  { emoji:'✨', label:'Lifetime polishing' },
  { emoji:'📦', label:'Insured shipping' },
  { emoji:'🛡️', label:'Authenticity guaranteed' },
];

export default function TrustBadges() {
  return (
    <section className="bg-ink-50 border-y border-ink-100 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
          {DEFAULT_BADGES.map(b=>(
            <div key={b.label} className="flex items-center gap-2.5">
              <span className="text-xl">{b.emoji}</span>
              <span className="text-sm font-medium text-ink-600">{b.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
