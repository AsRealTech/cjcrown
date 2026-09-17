import { StorageImage } from "@/components/public/StorageImage";
import type { Doc, Id } from "@/convex/_generated/dataModel";

type Listing = Doc<"furnitureListings">;

/**
 * Returns the displayable image sources for a listing in the admin's chosen
 * order: uploaded storage images (via StorageImage) and/or external URLs.
 * The hook-safe pattern: components call `orderedImageIds` for uploads and
 * read `imageUrls` directly, then render whichever exists.
 */
export function orderedImageIds(listing: Listing): Id<"_storage">[] {
  const { imageIds, imageOrder } = listing;
  if (!imageOrder || imageOrder.length !== imageIds.length) {
    return imageIds;
  }
  return [...imageIds.keys()]
    .sort((a, b) => (imageOrder[a] ?? a) - (imageOrder[b] ?? b))
    .map((i) => imageIds[i]);
}

export function orderedImageUrls(listing: Listing): string[] {
  return listing.imageUrls ?? [];
}

export function hasAnyImage(listing: Listing): boolean {
  return orderedImageIds(listing).length > 0 || orderedImageUrls(listing).length > 0;
}

/** Single-source listing cover: prefers uploads, falls back to URLs. */
export function ListingCover({
  listing,
  className,
  eager = false,
}: {
  listing: Listing;
  className?: string;
  eager?: boolean;
}) {
  const ids = orderedImageIds(listing);
  const urls = orderedImageUrls(listing);

  if (ids.length > 0) {
    return <StorageImage id={ids[0]} alt={listing.title} className={className} eager={eager} />;
  }
  if (urls.length > 0) {
    return (
      <img
        src={urls[0]}
        alt={listing.title}
        loading={eager ? "eager" : "lazy"}
        className={"size-full object-cover " + (className ?? "")}
      />
    );
  }
  return (
    <div
      className={
        "flex size-full items-center justify-center bg-muted text-sm text-muted-foreground " +
        (className ?? "")
      }
    >
      No image yet
    </div>
  );
}
