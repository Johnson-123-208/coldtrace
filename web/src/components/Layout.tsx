import { Link, Outlet } from "react-router-dom";

export function Layout() {
  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-line bg-surface/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
          <Link to="/" className="group flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky to-navy text-sm font-bold text-white shadow-sm">
              CT
            </span>
            <div>
              <p className="text-lg font-semibold tracking-tight text-ink">ColdTrace</p>
              <p className="text-xs text-muted">by Inform8</p>
            </div>
          </Link>
          <p className="hidden text-xs text-muted sm:block">
            Cold-chain integrity demo · SIMULATED telemetry
          </p>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-8">
        <Outlet />
      </main>
      <footer className="border-t border-line py-6 text-center text-xs text-muted">
        ColdTrace MVP — not for clinical or GxP use · Inform8 Communications
      </footer>
    </div>
  );
}