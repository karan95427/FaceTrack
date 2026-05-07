import { NavLink, Outlet } from "react-router-dom";
import { Activity, ScanFace, Sparkles } from "lucide-react";

const navItems = [
  { to: "/enrollment", label: "Enrollment", icon: ScanFace },
  { to: "/live", label: "Live Detection", icon: Activity }
];

export default function AppShell() {
  return (
    <div className="min-h-screen bg-void text-slate-100">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_18%_8%,rgba(32,246,255,.16),transparent_26%),radial-gradient(circle_at_82%_12%,rgba(139,92,246,.18),transparent_30%),linear-gradient(180deg,#05070d_0%,#080c18_48%,#05070d_100%)]" />
      <header className="sticky top-0 z-40 border-b border-white/10 bg-void/78 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg border border-cyanx/35 bg-cyanx/10 shadow-glow">
              <Sparkles className="h-5 w-5 text-cyanx" />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-[0.24em] text-cyanx">FACEAI</p>
              <h1 className="text-base font-semibold text-white sm:text-lg">Recognition Command Center</h1>
            </div>
          </div>
          <nav className="flex rounded-lg border border-white/10 bg-white/[0.04] p-1">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-md px-3 py-2 text-sm transition ${
                    isActive ? "bg-cyanx/15 text-cyanx" : "text-slate-400 hover:text-white"
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <Outlet />
    </div>
  );
}
