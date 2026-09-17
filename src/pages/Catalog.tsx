import { Reveal } from "@/components/public/Reveal";
import { SiteFooter } from "@/components/public/SiteFooter";
import { SiteHeader } from "@/components/public/SiteHeader";
import { ListingCard } from "@/components/public/ListingCard";
import { WhatsAppFloatingButton } from "@/components/public/WhatsAppCta";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api } from "@/convex/_generated/api";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";

const CATEGORIES = [
  "All",
  "Seating",
  "Tables",
  "Storage",
  "Beds",
  "Lighting",
  "Outdoor",
  "Decor",
];

export default function Catalog() {
  const listings = useQuerySafe();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState<"featured" | "price-asc" | "price-desc" | "newest">("featured");

  const filtered = useMemo(() => {
    let items = listings ?? [];
    if (category !== "All") {
      items = items.filter((l) => l.category === category);
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      items = items.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.description.toLowerCase().includes(q) ||
          (l.materials ?? "").toLowerCase().includes(q),
      );
    }
    const sorted = [...items];
    if (sort === "price-asc") {
      sorted.sort((a, b) => (a.price || Infinity) - (b.price || Infinity));
    } else if (sort === "price-desc") {
      sorted.sort((a, b) => b.price - a.price);
    } else if (sort === "newest") {
      sorted.sort((a, b) => b._creationTime - a._creationTime);
    }
    return sorted;
  }, [listings, query, category, sort]);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        <section className="border-b border-border/60 bg-card/40">
          <div className="container-site py-12 sm:py-16">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">
              The collection
            </p>
            <h1 className="mt-2 font-display text-4xl font-semibold sm:text-5xl">
              Browse every piece
            </h1>
            <p className="mt-4 max-w-2xl text-pretty leading-7 text-muted-foreground">
              Solid-wood furniture bench-made in small batches. Filter by room
              type, or search for a specific material or form.
            </p>
          </div>
        </section>

        <section className="container-site py-10">
          {/* Controls */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search pieces, materials…"
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                    category === cat
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Results */}
          {listings === undefined ? (
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-[4/3] animate-pulse rounded-xl bg-muted" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <Card className="card-soft mt-12">
              <CardContent className="p-12 text-center">
                <p className="font-display text-lg font-semibold">Nothing matches that search</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Try a different keyword or category.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((listing, i) => (
                <Reveal key={listing._id} delay={Math.min(i * 0.05, 0.3)}>
                  <ListingCard listing={listing} />
                </Reveal>
              ))}
            </div>
          )}
        </section>
      </main>

      <SiteFooter />
      <WhatsAppFloatingButton />
    </div>
  );
}

// small wrapper so the query result stays `undefined` while loading
import { useQuery } from "convex/react";
function useQuerySafe() {
  return useQuery(api.furnitureListings.publicListings);
}
