// Site chrome: fixed nav and footer. The nav demo link is the mono bracket
// garment with a magnetic pull (wired in the page motion pass via data attrs).
import { Link } from "@tanstack/react-router";

const NAV_LINKS = [
  { href: "#room", label: "The room" },
  { href: "#formats", label: "Formats" },
  { href: "#engine", label: "Engine" },
  { href: "#tv", label: "TV night" },
  { href: "#pricing", label: "Pricing" },
];

export function SiteNav() {
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-chalk/10 bg-pitch/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 md:px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <img src="/assets/logo-fdr.png" alt="Fantasy Draft Room logo" className="h-8 w-8 rounded-[4px] object-cover" />
          <span className="font-display text-sm font-bold tracking-tight text-chalk">Fantasy Draft Room</span>
        </Link>
        <nav className="ml-auto hidden items-center gap-6 md:flex" aria-label="Site">
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href} className="text-sm text-mist transition-colors hover:text-chalk">
              {l.label}
            </a>
          ))}
        </nav>
        <Link
          to="/demo"
          data-magnetic
          className="ml-auto font-chyron text-xs font-semibold uppercase tracking-widest text-chalk transition-colors hover:text-scarlet md:ml-0"
        >
          [ Demo ]
        </Link>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-chalk/10 bg-pitch">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 md:flex-row md:items-center md:px-6">
        <div className="flex items-center gap-2.5">
          <img src="/assets/logo-fdr.png" alt="" className="h-7 w-7 rounded-[4px] object-cover" />
          <div>
            <p className="font-display text-sm font-bold text-chalk">Fantasy Draft Room</p>
            <p className="font-chyron text-[11px] text-mist">Built for league night.</p>
          </div>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 md:ml-auto" aria-label="Footer">
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href} className="text-xs text-mist transition-colors hover:text-chalk">
              {l.label}
            </a>
          ))}
          <Link to="/demo" className="text-xs text-mist transition-colors hover:text-chalk">
            Demo
          </Link>
          <Link to="/tv" className="text-xs text-mist transition-colors hover:text-chalk">
            TV board
          </Link>
        </nav>
        <p className="font-chyron text-[11px] text-mist/70">© 2026 Fantasy Draft Room</p>
      </div>
    </footer>
  );
}
