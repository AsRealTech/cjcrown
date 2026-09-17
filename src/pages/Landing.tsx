import { Reveal } from "@/components/public/Reveal";
import { WhatsAppButton, WhatsAppFloatingButton } from "@/components/public/WhatsAppCta";
import { SiteFooter } from "@/components/public/SiteFooter";
import { SiteHeader } from "@/components/public/SiteHeader";
import { ListingCard } from "@/components/public/ListingCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { useSiteSettings, settingWithDefault, SITE_SETTINGS_KEYS, SITE } from "@/lib/site";
import { useQuery } from "convex/react";
import {
  ArrowRight,
  Compass,
  Hammer,
  Leaf,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router";

const VALUES = [
  {
    icon: Hammer,
    title: "Made by hand",
    body: "Every piece is bench-made in our own workshop — no flat-pack, no shortcuts.",
  },
  {
    icon: Leaf,
    title: "Honest materials",
    body: "Solid oak, walnut, linen and steel. Materials that age gracefully instead of wearing out.",
  },
  {
    icon: Compass,
    title: "Designed to last",
    body: "Quiet proportions and joinery built for decades of daily use, not seasons.",
  },
  {
    icon: Sparkles,
    title: "Finished to order",
    body: "Choose finishes and fabrics that suit your room. Each order is made just for you.",
  },
];

export default function Landing() {
  const settings = useSiteSettings();
  const listings = useQuery(api.furnitureListings.publicListings) ?? [];
  const featured = listings.filter((l) => l.featured).slice(0, 3);
  const showcase = (featured.length >= 3 ? featured : listings).slice(0, 3);

  const brand = settingWithDefault(settings, SITE_SETTINGS_KEYS.brandName, SITE.name);
  const heroHeadline = settingWithDefault(
    settings,
    SITE_SETTINGS_KEYS.heroHeadline,
    "Furniture made to be lived with.",
  );
  const heroSub = settingWithDefault(
    settings,
    SITE_SETTINGS_KEYS.heroSub,
    "Hearth & Grain crafts solid-wood seating, tables and storage in small batches — designed to anchor calm, well-used rooms for decades.",
  );
  const aboutIntro = settingWithDefault(
    settings,
    SITE_SETTINGS_KEYS.aboutIntro,
    "We are a small workshop of makers who believe a room should feel settled. Our furniture is built slowly, finished by hand, and made to be repaired — never replaced.",
  );
  const ctaHeadline = settingWithDefault(
    settings,
    SITE_SETTINGS_KEYS.ctaHeadline,
    "Visit the showroom",
  );
  const ctaBody = settingWithDefault(
    settings,
    SITE_SETTINGS_KEYS.ctaBody,
    "See and sit in the full collection at our Portland workshop. Coffee is on us.",
  );

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="absolute inset-0 -z-10 bg-gradient-to-b from-accent/60 via-background to-background"
          />
          <div className="container-site section-pad grid items-center gap-12 lg:grid-cols-2">
            <div>
              <Reveal>
                <Badge variant="outline" className="mb-6 gap-1.5 rounded-full border-primary/30 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
                  <Sparkles className="size-3" />
                  New collection — Autumn 2026
                </Badge>
              </Reveal>
              <Reveal delay={0.05}>
                <h1 className="text-balance font-display text-4xl font-semibold leading-[1.08] sm:text-5xl lg:text-6xl">
                  {heroHeadline}
                </h1>
              </Reveal>
              <Reveal delay={0.1}>
                <p className="mt-6 max-w-xl text-pretty text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
                  {heroSub}
                </p>
              </Reveal>
              <Reveal delay={0.15}>
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <Button asChild size="lg" className="rounded-full px-6">
                    <Link to="/catalog">
                      Explore the collection
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="rounded-full px-6">
                    <Link to="/contact">Book a showroom visit</Link>
                  </Button>
                </div>
              </Reveal>
              <Reveal delay={0.2}>
                <dl className="mt-12 grid max-w-md grid-cols-3 gap-6 border-t border-border/70 pt-8">
                  {[
                    ["12 yrs", "In the workshop"],
                    ["480+", "Pieces delivered"],
                    ["4.9★", "Client rating"],
                  ].map(([value, label]) => (
                    <div key={label}>
                      <dt className="sr-only">{label}</dt>
                      <dd className="font-display text-2xl font-semibold">{value}</dd>
                      <dd className="mt-1 text-xs text-muted-foreground">{label}</dd>
                    </div>
                  ))}
                </dl>
              </Reveal>
            </div>

            <Reveal delay={0.15} className="relative">
              <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card shadow-[0_24px_60px_-24px_rgba(30,25,15,0.25)]">
                <div className="aspect-[4/3] w-full bg-gradient-to-br from-accent via-secondary to-muted">
                  <HeroCollage />
                </div>
              </div>
              <div className="absolute -bottom-6 -left-6 hidden rounded-xl border border-border/60 bg-card px-5 py-4 shadow-lg sm:block">
                <p className="font-display text-sm font-semibold">Bench-made in Portland</p>
                <p className="mt-1 text-xs text-muted-foreground">Solid oak · Walnut · Linen</p>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Featured pieces */}
        <section className="border-t border-border/60">
          <div className="container-site section-pad">
            <Reveal>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                    Featured pieces
                  </p>
                  <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">
                    Quiet favourites from the collection
                  </h2>
                </div>
                <Button asChild variant="ghost" className="gap-1.5 text-primary">
                  <Link to="/catalog">
                    View all pieces <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </div>
            </Reveal>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {showcase.map((listing, i) => (
                <Reveal key={listing._id} delay={i * 0.07}>
                  <ListingCard listing={listing} />
                </Reveal>
              ))}
              {listings.length === 0 && (
                <Card className="card-soft sm:col-span-2 lg:col-span-3">
                  <CardContent className="p-10 text-center text-sm text-muted-foreground">
                    The collection is being curated — check back soon.
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="border-t border-border/60 bg-card/40">
          <div className="container-site section-pad">
            <Reveal>
              <div className="max-w-2xl">
                <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                  Why {brand}
                </p>
                <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">
                  Built the slow way, on purpose
                </h2>
                <p className="mt-4 text-pretty leading-7 text-muted-foreground">{aboutIntro}</p>
              </div>
            </Reveal>
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {VALUES.map((value, i) => (
                <Reveal key={value.title} delay={i * 0.06}>
                  <Card className="card-soft h-full">
                    <CardContent className="p-6">
                      <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <value.icon className="size-5" />
                      </span>
                      <h3 className="mt-4 font-display text-lg font-semibold">{value.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{value.body}</p>
                    </CardContent>
                  </Card>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* CTA band */}
        <section className="border-t border-border/60">
          <div className="container-site section-pad">
            <Reveal>
              <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-primary px-6 py-14 text-center text-primary-foreground sm:px-12">
                <div
                  aria-hidden
                  className="absolute inset-0 opacity-25"
                  style={{
                    background:
                      "radial-gradient(600px 240px at 50% 0%, rgba(255,255,255,0.35), transparent 70%)",
                  }}
                />
                <div className="relative mx-auto max-w-2xl">
                  <h2 className="font-display text-3xl font-semibold sm:text-4xl">{ctaHeadline}</h2>
                  <p className="mt-4 text-pretty leading-7 text-primary-foreground/85">{ctaBody}</p>
                  <div className="mt-8 flex flex-wrap items-center gap-3">
                    <Button asChild size="lg" variant="secondary" className="rounded-full px-6">
                      <Link to="/contact">Book a visit</Link>
                    </Button>
                    <WhatsAppButton
                      enabledKey={SITE_SETTINGS_KEYS.whatsappHomeEnabled}
                      className="[&>span]:text-[#04310f]"
                    />
                    <Button
                      asChild
                      size="lg"
                      variant="outline"
                      className="rounded-full border-primary-foreground/30 bg-transparent px-6 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                    >
                      <Link to="/catalog">Browse online</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      <SiteFooter />
      <WhatsAppFloatingButton />
    </div>
  );
}

/** Warm, abstract "workshop" collage used as the hero visual (no stock photo dependency). */
function HeroCollage() {
  return (
    <div className="grid size-full grid-cols-3 grid-rows-3 gap-1 p-1">
      {[
        "from-[#d9c6ad] to-[#c8b092]",
        "from-[#b98a5e] to-[#a5764c]",
        "from-[#e6ddd0] to-[#d4c8b6]",
        "from-[#8a6a4b] to-[#75573c]",
        "from-[#d9c6ad] to-[#cbb79b]",
        "from-[#c2a482] to-[#ab8b67]",
        "from-[#e6ddd0] to-[#d8cdbd]",
        "from-[#a98a67] to-[#94744f]",
        "from-[#d9c6ad] to-[#c4ae8e]",
      ].map((grad, i) => (
        <div
          key={i}
          className={`rounded-lg bg-gradient-to-br ${grad} transition-transform duration-500 hover:scale-[1.03]`}
        />
      ))}
    </div>
  );
}
