/**
 * AppFooter — flows naturally at the bottom of page content.
 * NOT fixed/sticky. Only visible when user scrolls to the bottom.
 * Like the Sage Accounting footer in the reference image.
 */
export default function AppFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="flex-shrink-0 border-t border-ink-200/60 dark:border-ink-800 bg-white dark:bg-ink-900 px-5 py-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-[10px] text-ink-400 dark:text-ink-500">
          © {year} VANTIX-CMS · Jewellery Management Platform
        </p>
        <div className="flex items-center gap-4">
          <a href="/dev-status"
            className="text-[10px] text-ink-400 hover:text-gold-600 transition-colors no-underline">
            System status
          </a>
          <span className="text-[10px] text-ink-300 dark:text-ink-600">·</span>
          <a href="https://docs.vantix.io" target="_blank" rel="noreferrer"
            className="text-[10px] text-ink-400 hover:text-gold-600 transition-colors no-underline">
            Docs
          </a>
          <span className="text-[10px] text-ink-300 dark:text-ink-600">·</span>
          <span className="text-[10px] text-ink-300 dark:text-ink-600">v2.0</span>
        </div>
      </div>
    </footer>
  );
}
