import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import {
  AlertTriangle,
  Eye,
  Mail,
  Plus,
  Sofa,
  Sparkles,
  TrendingUp,
  ShieldCheck,
} from "lucide-react";
import { Link } from "react-router";
import { toast } from "sonner";

export default function AdminOverview() {
  const { user } = useAuth();
  const listings = useQuery(api.furnitureListings.adminListings) ?? [];
  const inquiries = useQuery(api.inquiries.adminInquiries) ?? [];
  const canClaim = useQuery(api.adminAccess.canClaimAdmin) ?? false;
  const claim = useMutation(api.adminAccess.claimAdmin);
  const seed = useMutation(api.seed.seedSampleListings);

  const published = listings.filter((l) => l.status === "published");
  const featured = listings.filter((l) => l.featured);
  const newInquiries = inquiries.filter((i) => i.status === "new");
  const totalViews = listings.reduce((sum, l) => sum + (l.views ?? 0), 0);
  const topViewed = [...listings]
    .sort((a, b) => (b.views ?? 0) - (a.views ?? 0))
    .slice(0, 4);

  const handleClaim = async () => {
    try {
      await claim({});
      toast.success("You're now an admin — full access granted.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not claim admin.");
    }
  };

  const handleSeed = async () => {
    try {
      const result = await seed({});
      toast.success(
        (result?.seeded ?? 0) > 0
          ? `Added ${result.seeded} sample pieces to the catalog.`
          : "Catalog already has listings — nothing added.",
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Seeding failed.");
    }
  };

  const stats = [
    { label: "Published listings", value: published.length, icon: Sofa },
    { label: "Total views", value: totalViews.toLocaleString(), icon: Eye },
    { label: "New inquiries", value: newInquiries.length, icon: Mail },
    { label: "Featured pieces", value: featured.length, icon: TrendingUp },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold sm:text-3xl">
            Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Here's what's happening across the collection.
          </p>
        </div>
        <div className="flex gap-2">
          {listings.length === 0 && !canClaim && !user?.isAnonymous && (
            <Button variant="outline" className="rounded-full" onClick={handleSeed}>
              <Sparkles className="size-4" /> Load sample collection
            </Button>
          )}
          <Button asChild className="rounded-full">
            <Link to="/admin/listings/new">
              <Plus className="size-4" /> New listing
            </Link>
          </Button>
        </div>
      </div>

      {user?.isAnonymous && (
        <Card className="border-amber-300/60 bg-amber-50/70">
          <CardContent className="flex flex-wrap items-center gap-3 p-4">
            <AlertTriangle className="size-4 shrink-0 text-amber-600" />
            <p className="flex-1 text-sm text-amber-900">
              You're in a guest session, which can't manage site content. Sign
              out and sign back in with your email to get full access.
            </p>
          </CardContent>
        </Card>
      )}

      {canClaim && (
        <Card className="border-amber-300/60 bg-amber-50/70">
          <CardContent className="flex flex-wrap items-center gap-3 p-4">
            <AlertTriangle className="size-4 shrink-0 text-amber-600" />
            <p className="flex-1 text-sm text-amber-900">
              Your account isn't an admin yet, so content changes are blocked
              until you claim access.
            </p>
            <Button
              size="sm"
              onClick={handleClaim}
              className="bg-amber-600 text-white hover:bg-amber-700"
            >
              <ShieldCheck className="size-4" /> Claim admin access
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="card-soft">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{stat.label}</span>
                <stat.icon className="size-4 text-primary" />
              </div>
              <p className="mt-2 font-display text-3xl font-semibold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="card-soft">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Most viewed pieces</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topViewed.length === 0 && (
              <p className="text-sm text-muted-foreground">No listings yet.</p>
            )}
            {topViewed.map((l) => (
              <Link
                key={l._id}
                to={`/admin/listings/${l._id}/edit`}
                className="flex items-center justify-between gap-3 rounded-lg border border-border/50 px-4 py-3 transition-colors hover:bg-accent/50"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{l.title}</p>
                  <p className="text-xs text-muted-foreground">{l.category}</p>
                </div>
                <Badge variant="secondary" className="gap-1 rounded-full">
                  <Eye className="size-3" /> {l.views ?? 0}
                </Badge>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card className="card-soft">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Latest inquiries</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {inquiries.slice(0, 4).map((inq) => (
              <div key={inq._id} className="rounded-lg border border-border/50 px-4 py-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-medium">{inq.name}</p>
                  {inq.status === "new" && (
                    <Badge className="rounded-full bg-primary text-primary-foreground">
                      New
                    </Badge>
                  )}
                </div>
                <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                  {inq.listingTitle ? `Re: ${inq.listingTitle} — ` : ""}
                  {inq.message}
                </p>
              </div>
            ))}
            {inquiries.length === 0 && (
              <p className="text-sm text-muted-foreground">No inquiries yet.</p>
            )}
            {inquiries.length > 0 && (
              <Button asChild variant="ghost" size="sm" className="w-full text-primary">
                <Link to="/admin/inquiries">View all inquiries</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
