import { Button } from "@/components/ui/button";
import { useSiteSettings, settingWithDefault, SITE_SETTINGS_KEYS, SITE } from "@/lib/site";
import { Armchair, Menu, X } from "lucide-react";
import { useState } from "react";
import { Link, NavLink } from "react-router";

const NAV = [
  { to: "/catalog", label: "Collection" },
  { to: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const settings = useSiteSettings();
  const brand = settingWithDefault(settings, SITE_SETTINGS_KEYS.brandName, SITE.name);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="container-site flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Armchair className="size-5" />
          </span>
          <span className="font-display text-lg font-semibold tracking-tight">
            {brand}
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors hover:text-foreground ${
                  isActive ? "text-foreground" : "text-muted-foreground"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Button asChild variant="outline" size="sm">
            <Link to="/catalog">Browse pieces</Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/contact">Book a visit</Link>
          </Button>
        </div>

        <button
          type="button"
          className="flex size-9 items-center justify-center rounded-md border border-border/70 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="size-4" /> : <Menu className="size-4" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border/60 bg-background px-4 pb-4 pt-2 md:hidden">
          <nav className="flex flex-col">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="rounded-md px-2 py-2.5 text-sm font-medium text-foreground/90 hover:bg-accent"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-2 flex gap-2">
              <Button asChild variant="outline" size="sm" className="flex-1">
                <Link to="/catalog" onClick={() => setOpen(false)}>
                  Browse
                </Link>
              </Button>
              <Button asChild size="sm" className="flex-1">
                <Link to="/contact" onClick={() => setOpen(false)}>
                  Book a visit
                </Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
