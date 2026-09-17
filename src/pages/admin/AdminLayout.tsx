import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/convex/_generated/api";
import {
  Armchair,
  ChevronLeft,
  LayoutDashboard,
  LogOut,
  Mail,
  Settings,
  Sofa,
} from "lucide-react";
import { NavLink, Link, Outlet, useNavigate } from "react-router";
import { useQuery } from "convex/react";

const NAV = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/admin/listings", label: "Listings", icon: Sofa },
  { to: "/admin/inquiries", label: "Inquiries", icon: Mail },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const inquiries = useQuery(api.inquiries.adminInquiries) ?? [];
  const newCount = inquiries.filter((i) => i.status === "new").length;

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-border/60 bg-sidebar md:flex">
        <div className="flex h-16 items-center gap-2.5 border-b border-border/60 px-5">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Armchair className="size-4" />
          </span>
          <div>
            <p className="font-display text-sm font-semibold leading-tight">Atelier Admin</p>
            <p className="text-[11px] text-muted-foreground">Content studio</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground"
                }`
              }
            >
              <item.icon className="size-4" />
              {item.label}
              {item.label === "Inquiries" && newCount > 0 && (
                <Badge className="ml-auto rounded-full bg-primary px-1.5 text-[10px] text-primary-foreground">
                  {newCount}
                </Badge>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-border/60 p-3">
          <Link
            to="/"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground"
          >
            <ChevronLeft className="size-4" />
            View public site
          </Link>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col md:pl-60">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border/60 bg-background/85 px-4 backdrop-blur-md sm:px-6">
          <div className="flex items-center gap-3 md:hidden">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Armchair className="size-4" />
            </span>
            <span className="font-display text-sm font-semibold">Atelier Admin</span>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden text-right sm:block">
              <span className="block text-sm font-medium leading-tight">
                {user?.name || user?.email || "Team member"}
              </span>
              <span className="block text-xs text-muted-foreground">{user?.email}</span>
            </span>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="size-4" /> Sign out
            </Button>
          </div>
        </header>

        {/* Mobile nav */}
        <div className="border-b border-border/60 bg-card/50 px-4 py-2 md:hidden">
          <nav className="flex gap-1 overflow-x-auto">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
