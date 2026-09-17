import { StorageImage } from "@/components/public/StorageImage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { orderedImageIds, orderedImageUrls } from "@/hooks/use-listing-image";
import { api } from "@/convex/_generated/api";
import { formatPrice } from "@/lib/site";
import { useMutation, useQuery } from "convex/react";
import {
  Eye,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";

export default function AdminListings() {
  const listings = useQuery(api.furnitureListings.adminListings);
  const setStatus = useMutation(api.furnitureListings.setListingStatus);
  const setFeatured = useMutation(api.furnitureListings.setListingFeatured);
  const remove = useMutation(api.furnitureListings.deleteListing);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");

  const filtered = useMemo(() => {
    if (!listings) return [];
    let items = listings;
    if (statusFilter !== "all") items = items.filter((l) => l.status === statusFilter);
    if (query.trim()) {
      const q = query.toLowerCase();
      items = items.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.category.toLowerCase().includes(q),
      );
    }
    return items;
  }, [listings, query, statusFilter]);

  const handleStatus = async (id: string, status: "published" | "draft") => {
    try {
      await setStatus({ id: id as never, status });
      toast.success(status === "published" ? "Listing published" : "Listing unpublished");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Update failed");
    }
  };

  const handleFeatured = async (id: string, featured: boolean) => {
    try {
      await setFeatured({ id: id as never, featured });
      toast.success(featured ? "Marked as featured" : "Removed from featured");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Update failed");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await remove({ id: id as never });
      toast.success("Listing deleted");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Delete failed");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold sm:text-3xl">Listings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create, publish, feature and remove furniture pieces.
          </p>
        </div>
        <Button asChild className="rounded-full">
          <Link to="/admin/listings/new">
            <Plus className="size-4" /> New listing
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search listings…"
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "published", "draft"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={`rounded-full border px-3.5 py-1.5 text-sm font-medium capitalize transition-colors ${
                statusFilter === s
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {listings === undefined ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="card-soft">
          <CardContent className="p-12 text-center">
            <p className="font-display text-lg font-semibold">No listings found</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Create your first piece to start filling the catalog.
            </p>
            <Button asChild className="mt-6 rounded-full">
              <Link to="/admin/listings/new">
                <Plus className="size-4" /> New listing
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((listing) => {
            const uploaded = orderedImageIds(listing);
            const external = orderedImageUrls(listing);
            return (
              <Card key={listing._id} className="card-soft">
                <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                  <div className="relative h-20 w-full shrink-0 overflow-hidden rounded-lg bg-muted sm:w-32">
                    {uploaded[0] ? (
                      <StorageImage id={uploaded[0]} alt={listing.title} />
                    ) : external[0] ? (
                      <img src={external[0]} alt={listing.title} className="size-full object-cover" />
                    ) : (
                      <div className="flex size-full items-center justify-center text-xs text-muted-foreground">
                        No image
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate font-medium">{listing.title}</p>
                      {listing.featured && (
                        <Badge className="rounded-full bg-primary/15 text-primary">
                          <Sparkles className="size-3" /> Featured
                        </Badge>
                      )}
                      <Badge
                        variant={listing.status === "published" ? "secondary" : "outline"}
                        className="rounded-full"
                      >
                        {listing.status}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {listing.category} · {formatPrice(listing.price, listing.currency)} ·{" "}
                      <span className="inline-flex items-center gap-1">
                        <Eye className="size-3" /> {listing.views ?? 0} views
                      </span>
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatus(listing._id, listing.status === "published" ? "draft" : "published")}
                    >
                      {listing.status === "published" ? "Unpublish" : "Publish"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleFeatured(listing._id, !listing.featured)}
                    >
                      <Sparkles className="size-3.5" />
                      {listing.featured ? "Unfeature" : "Feature"}
                    </Button>
                    <Button asChild variant="outline" size="sm">
                      <Link to={`/admin/listings/${listing._id}/edit`}>
                        <Pencil className="size-3.5" /> Edit
                      </Link>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10">
                          <Trash2 className="size-3.5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete “{listing.title}”?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This permanently removes the listing and its images.
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive text-white hover:bg-destructive/90"
                            onClick={() => handleDelete(listing._id)}
                          >
                            Delete listing
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
