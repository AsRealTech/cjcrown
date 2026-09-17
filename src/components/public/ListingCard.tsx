import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ListingCover } from "@/hooks/use-listing-image";
import { WhatsAppListingCta } from "@/components/public/WhatsAppCta";
import { formatPrice, CONDITION_LABELS } from "@/lib/site";
import type { Doc } from "@/convex/_generated/dataModel";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router";

type Listing = Doc<"furnitureListings">;

export function ListingCard({ listing }: { listing: Listing }) {
  return (
    <Link
      to={`/furniture/${listing.slug}`}
      className="group block focus-visible:outline-none"
    >
      <Card className="card-soft hover-lift h-full overflow-hidden pt-0 transition-shadow group-focus-visible:ring-2 group-focus-visible:ring-ring">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <ListingCover
            listing={listing}
            className="transition-transform duration-700 group-hover:scale-[1.04]"
          />
          <div className="absolute left-3 top-3 flex gap-1.5">
            {listing.featured && (
              <Badge className="bg-primary/90 text-primary-foreground backdrop-blur">
                Featured
              </Badge>
            )}
            {listing.condition && CONDITION_LABELS[listing.condition] && (
              <Badge
                variant="secondary"
                className="bg-background/85 text-foreground backdrop-blur"
              >
                {CONDITION_LABELS[listing.condition]}
              </Badge>
            )}
          </div>
        </div>
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                {listing.category}
              </p>
              <h3 className="mt-1 font-display text-lg font-semibold leading-snug">
                {listing.title}
              </h3>
            </div>
            <ArrowUpRight className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary" />
          </div>
          <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">
            {listing.description}
          </p>
          <div className="mt-4 flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-foreground">
              {formatPrice(listing.price, listing.currency)}
            </p>
            <WhatsAppListingCta listing={listing} size="sm" variant="outline" className="shrink-0" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
