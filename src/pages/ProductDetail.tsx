import { SiteFooter } from "@/components/public/SiteFooter";
import { SiteHeader } from "@/components/public/SiteHeader";
import { StorageImage } from "@/components/public/StorageImage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { InquiryForm } from "@/components/public/InquiryForm";
import { WhatsAppListingCta, WhatsAppFloatingButton } from "@/components/public/WhatsAppCta";
import { api } from "@/convex/_generated/api";
import { orderedImageIds, orderedImageUrls } from "@/hooks/use-listing-image";
import { CONDITION_LABELS, formatPrice, useSiteSettings, settingWithDefault, SITE_SETTINGS_KEYS, SITE } from "@/lib/site";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import {
  ArrowLeft,
  Eye,
  MessageSquare,
  Ruler,
  ShieldCheck,
  TreePine,
  Truck,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const listing = useQuery(
    api.furnitureListings.publicListingBySlug,
    slug ? { slug } : "skip",
  );

  // Track a view once per mount.
  const trackView = useMutation(api.furnitureListings.trackView);
  const [viewed, setViewed] = useState(false);
  useEffect(() => {
    if (listing && !viewed) {
      setViewed(true);
      trackView({ id: listing._id }).catch(() => {});
    }
  }, [listing, viewed, trackView]);

  if (listing === undefined) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="container-site section-pad flex-1">
          <div className="mx-auto max-w-6xl">
            <div className="aspect-[16/9] w-full animate-pulse rounded-2xl bg-muted" />
          </div>
        </main>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="container-site section-pad flex-1">
          <div className="mx-auto max-w-md text-center">
            <h1 className="font-display text-3xl font-semibold">Piece not found</h1>
            <p className="mt-3 text-sm text-muted-foreground">
              This listing may have been unpublished or removed.
            </p>
            <Button asChild className="mt-6 rounded-full">
              <Link to="/catalog">Back to the collection</Link>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return <Detail listing={listing} />;
}

function Detail({ listing }: { listing: Doc<"furnitureListings"> }) {
  const uploaded = orderedImageIds(listing);
  const external = orderedImageUrls(listing);
  const gallery: { kind: "upload"; id: Id<"_storage"> }[] | { kind: "url"; src: string }[] =
    uploaded.length > 0
      ? uploaded.map((id) => ({ kind: "upload" as const, id }))
      : external.map((src) => ({ kind: "url" as const, src }));
  const [active, setActive] = useState(0);
  const settings = useSiteSettings();
  const email = settingWithDefault(settings, SITE_SETTINGS_KEYS.contactEmail, SITE.email);
  const phone = settingWithDefault(settings, SITE_SETTINGS_KEYS.contactPhone, SITE.phone);
  const address = settingWithDefault(settings, SITE_SETTINGS_KEYS.contactAddress, SITE.address);
  const hours = settingWithDefault(settings, SITE_SETTINGS_KEYS.contactHours, SITE.hours);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        <div className="container-site pt-8">
          <Link
            to="/catalog"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" /> Back to collection
          </Link>
        </div>

        <section className="container-site py-8 lg:py-12">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
            {/* Gallery */}
            <div>
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border/60 bg-muted">
                {gallery.length > 0 ? (
                  gallery[active].kind === "upload" ? (
                    <StorageImage
                      id={gallery[active].id}
                      alt={listing.title}
                      eager
                    />
                  ) : (
                    <img
                      src={gallery[active].src}
                      alt={listing.title}
                      className="size-full object-cover"
                    />
                  )
                ) : (
                  <div className="flex size-full items-center justify-center text-sm text-muted-foreground">
                    No image yet
                  </div>
                )}
              </div>
              {gallery.length > 1 && (
                <div className="mt-4 grid grid-cols-4 gap-3">
                  {gallery.map((item, i) => (
                    <button
                      key={item.kind === "upload" ? item.id : item.src}
                      type="button"
                      onClick={() => setActive(i)}
                      className={`relative aspect-square overflow-hidden rounded-lg border-2 transition-all ${
                        active === i
                          ? "border-primary"
                          : "border-transparent opacity-70 hover:opacity-100"
                      }`}
                    >
                      {item.kind === "upload" ? (
                        <StorageImage id={item.id} alt={`${listing.title} ${i + 1}`} />
                      ) : (
                        <img
                          src={item.src}
                          alt={`${listing.title} ${i + 1}`}
                          className="size-full object-cover"
                        />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="rounded-full px-3 py-1">
                  {listing.category}
                </Badge>
                {listing.condition && (
                  <Badge variant="outline" className="rounded-full px-3 py-1">
                    {CONDITION_LABELS[listing.condition]}
                  </Badge>
                )}
                {listing.featured && (
                  <Badge className="rounded-full bg-primary/15 px-3 py-1 text-primary">
                    Featured
                  </Badge>
                )}
              </div>

              <h1 className="mt-4 font-display text-3xl font-semibold leading-tight sm:text-4xl">
                {listing.title}
              </h1>
              <p className="mt-3 text-2xl font-semibold text-foreground">
                {formatPrice(listing.price, listing.currency)}
              </p>

              <p className="mt-6 text-pretty leading-7 text-muted-foreground">
                {listing.description}
              </p>

              {/* Specs */}
              <dl className="mt-8 space-y-4 border-t border-border/70 pt-8 text-sm">
                {listing.materials && (
                  <div className="flex gap-3">
                    <TreePine className="mt-0.5 size-4 shrink-0 text-primary" />
                    <div>
                      <dt className="font-medium">Materials</dt>
                      <dd className="mt-0.5 text-muted-foreground">{listing.materials}</dd>
                    </div>
                  </div>
                )}
                {listing.dimensions && (
                  <div className="flex gap-3">
                    <Ruler className="mt-0.5 size-4 shrink-0 text-primary" />
                    <div>
                      <dt className="font-medium">Dimensions</dt>
                      <dd className="mt-0.5 text-muted-foreground">{listing.dimensions}</dd>
                    </div>
                  </div>
                )}
                <div className="flex gap-3">
                  <Eye className="mt-0.5 size-4 shrink-0 text-primary" />
                  <div>
                    <dt className="font-medium">Views</dt>
                    <dd className="mt-0.5 text-muted-foreground">{listing.views}</dd>
                  </div>
                </div>
              </dl>

              {/* Assurance */}
              <div className="mt-8 grid gap-3 rounded-xl border border-border/60 bg-card/60 p-4 sm:grid-cols-3">
                {[
                  { icon: ShieldCheck, label: "10-year joinery warranty" },
                  { icon: Truck, label: "White-glove delivery" },
                  { icon: MessageSquare, label: "Reply within 1 day" },
                ].map((a) => (
                  <div key={a.label} className="flex items-center gap-2.5 text-xs font-medium text-muted-foreground">
                    <a.icon className="size-4 shrink-0 text-primary" />
                    {a.label}
                  </div>
                ))}
              </div>

              {/* CTAs */}
              <div className="mt-8 flex flex-col gap-3">
                {/* WhatsApp is the primary conversion channel */}
                <WhatsAppListingCta listing={listing} />
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="lg" variant="outline" className="flex-1 rounded-full">
                        <MessageSquare className="size-4" /> Inquire about this piece
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-lg">
                      <DialogHeader>
                        <DialogTitle className="font-display">Inquire — {listing.title}</DialogTitle>
                        <DialogDescription>
                          Tell us a little about your space and timeline. We reply
                          within one business day.
                        </DialogDescription>
                      </DialogHeader>
                      <InquiryForm
                        listingId={listing._id as Id<"furnitureListings">}
                        listingTitle={listing.title}
                        compact
                      />
                    </DialogContent>
                  </Dialog>
                  <Button asChild size="lg" variant="outline" className="flex-1 rounded-full">
                    <a href={`mailto:${email}`}>Email us</a>
                  </Button>
                </div>
              </div>

              <p className="mt-6 text-xs text-muted-foreground">
                Prefer to talk? Call {phone} · Showroom: {address} · {hours}
              </p>
            </div>
          </div>
        </section>

        {/* Related */}
        <RelatedStrip current={listing} />
      </main>

      <SiteFooter />
      <WhatsAppFloatingButton />
    </div>
  );
}

function RelatedStrip({ current }: { current: Doc<"furnitureListings"> }) {
  const listings = useQuery(api.furnitureListings.publicListings) ?? [];
  const related = listings
    .filter((l) => l._id !== current._id && l.category === current.category)
    .slice(0, 3);
  const fallback = related.length > 0
    ? related
    : listings.filter((l) => l._id !== current._id).slice(0, 3);

  if (fallback.length === 0) return null;

  return (
    <section className="border-t border-border/60 bg-card/40">
      <div className="container-site section-pad">
        <h2 className="font-display text-2xl font-semibold">You may also like</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {fallback.map((listing) => (
            <ListingCardLink key={listing._id} listing={listing} />
          ))}
        </div>
      </div>
    </section>
  );
}

// Local import to avoid circular component dependencies in one file.
import { ListingCard } from "@/components/public/ListingCard";

function ListingCardLink({ listing }: { listing: Doc<"furnitureListings"> }) {
  return <ListingCard listing={listing} />;
}
