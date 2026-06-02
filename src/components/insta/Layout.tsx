import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { Home, Search, Film, User, PlusSquare, Heart } from "lucide-react";
import { type ReactNode } from "react";

const navItems = [
  { to: "/", label: "Home", icon: Home },
  { to: "/explore", label: "Explore", icon: Search },
  { to: "/reels", label: "Reels", icon: Film },
  { to: "/profile", label: "Profile", icon: User },
] as const;

function NavLink({ to, icon: Icon, label, active }: { to: string; icon: typeof Home; label: string; active: boolean }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-4 px-3 py-3 rounded-lg hover:bg-accent transition-colors"
    >
      <Icon className={active ? "w-7 h-7" : "w-6 h-6"} strokeWidth={active ? 2.5 : 1.75} />
      <span className={`hidden xl:inline text-base ${active ? "font-semibold" : ""}`}>{label}</span>
    </Link>
  );
}

export function InstaLayout({ children }: { children?: ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 h-screen w-20 xl:w-64 border-r border-border flex-col p-3 z-40">
        <Link to="/" className="px-3 py-6">
          <span className="hidden xl:block text-2xl font-bold tracking-tight" style={{ fontFamily: "'Brush Script MT', cursive" }}>
            Instaclone
          </span>
          <span className="xl:hidden text-2xl">📷</span>
        </Link>
        <nav className="flex flex-col gap-1 mt-2">
          {navItems.map((n) => (
            <NavLink key={n.to} {...n} active={path === n.to} />
          ))}
          <button className="flex items-center gap-4 px-3 py-3 rounded-lg hover:bg-accent transition-colors text-left">
            <PlusSquare className="w-6 h-6" strokeWidth={1.75} />
            <span className="hidden xl:inline text-base">Create</span>
          </button>
          <button className="flex items-center gap-4 px-3 py-3 rounded-lg hover:bg-accent transition-colors text-left">
            <Heart className="w-6 h-6" strokeWidth={1.75} />
            <span className="hidden xl:inline text-base">Notifications</span>
          </button>
        </nav>
      </aside>

      {/* Mobile top bar */}
      <header className="md:hidden sticky top-0 z-40 flex items-center justify-between px-4 h-14 border-b border-border bg-background/80 backdrop-blur">
        <Link to="/" className="text-2xl font-bold" style={{ fontFamily: "'Brush Script MT', cursive" }}>
          Instaclone
        </Link>
        <Heart className="w-6 h-6" />
      </header>

      {/* Main */}
      <main className="md:ml-20 xl:ml-64 pb-16 md:pb-0">
        {children ?? <Outlet />}
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 grid grid-cols-4 border-t border-border bg-background/95 backdrop-blur h-14">
        {navItems.map(({ to, icon: Icon }) => {
          const active = path === to;
          return (
            <Link key={to} to={to} className="flex items-center justify-center">
              <Icon className="w-6 h-6" strokeWidth={active ? 2.75 : 1.75} />
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
