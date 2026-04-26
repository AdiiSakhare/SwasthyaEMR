import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/data/auth";
import { useStore } from "@/data/store";
import { Logo } from "./Logo";
import { Avatar } from "./ui/avatar";
import { Button } from "./ui/button";
import { GlobalSearch } from "./GlobalSearch";
import { Search, LogOut, Calendar } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";

export function AppShell({ navItems, portalLabel }) {
  const { user, logout } = useAuth();
  const { clinic } = useStore();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-full flex">
      <aside className="hidden lg:flex flex-col w-64 fixed inset-y-0 left-0 p-4 z-30">
        <div className="bg-card rounded-2xl border border-border flex flex-col flex-1 p-4 shadow-sm">
          <div className="px-2 py-1.5">
            <Logo />
          </div>

          <div className="mt-4 px-2">
            <button
              onClick={() => setSearchOpen(true)}
              className="w-full flex items-center gap-2 px-3 h-10 rounded-xl bg-muted text-sm text-muted-foreground hover:bg-muted/80 transition-colors"
            >
              <Search className="size-4" />
              <span className="text-xs flex-1 text-left">Search patients...</span>
              <kbd className="text-[10px] font-medium bg-background px-1.5 py-0.5 rounded border border-border">⌘K</kbd>
            </button>
          </div>

          <nav className="mt-4 flex flex-col gap-0.5 flex-1">
            <p className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {portalLabel}
            </p>
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    "group flex items-center gap-2.5 px-3 h-9 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )
                }
              >
                <item.icon className="size-4 shrink-0" />
                <span className="truncate">{item.label}</span>
                {item.badge != null && (
                  <span className="ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="mt-auto pt-3 border-t border-border">
            <div className="flex items-center gap-3 p-2 rounded-xl">
              <Avatar name={user?.name} size="md" />
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-sm font-medium text-foreground truncate">{user?.name}</span>
                <span className="text-xs text-muted-foreground capitalize">{user?.role}</span>
              </div>
              <button
                onClick={handleLogout}
                className="size-8 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground"
                aria-label="Logout"
                title="Logout"
              >
                <LogOut className="size-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        <header className="sticky top-0 z-20 bg-slate-50/80 backdrop-blur-xl px-4 sm:px-6 lg:px-8 py-3.5 lg:py-4 border-b border-border/60">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 lg:hidden">
              <Logo size={28} />
            </div>
            <div className="hidden lg:flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="size-4" />
              <span className="font-medium text-foreground">{formatDate(new Date(), { weekday: "short" })}</span>
              <span className="size-1 rounded-full bg-border" />
              <span>{clinic.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon-sm" className="lg:hidden" onClick={handleLogout} title="Logout">
                <LogOut className="size-4" />
              </Button>
              <div className="hidden lg:flex items-center gap-2.5 px-3 h-9 rounded-full bg-card border border-border">
                <Avatar name={user?.name} size="sm" />
                <span className="text-xs font-medium text-foreground capitalize">{user?.role}</span>
              </div>
            </div>
          </div>
        </header>

        <nav className="lg:hidden bg-card border-b border-border px-2 overflow-x-auto">
          <div className="flex items-center gap-0.5 py-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-1.5 px-3 h-8 rounded-lg text-xs font-medium whitespace-nowrap transition-colors",
                    isActive ? "bg-primary/10 text-primary" : "text-muted-foreground"
                  )
                }
              >
                <item.icon className="size-3.5" />
                {item.label}
              </NavLink>
            ))}
          </div>
        </nav>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      <GlobalSearch />
    </div>
  );
}
