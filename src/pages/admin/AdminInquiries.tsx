import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import {
  Archive,
  CheckCheck,
  Eye,
  Mail,
  MailOpen,
  Phone,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type InquiryStatus = "new" | "read" | "archived";

export default function AdminInquiries() {
  const inquiries = useQuery(api.inquiries.adminInquiries);
  const setStatus = useMutation(api.inquiries.setInquiryStatus);
  const remove = useMutation(api.inquiries.deleteInquiry);
  const [filter, setFilter] = useState<"all" | InquiryStatus>("all");

  const filtered = (inquiries ?? []).filter(
    (i) => filter === "all" || i.status === filter,
  );
  const newCount = (inquiries ?? []).filter((i) => i.status === "new").length;

  const handleStatus = async (id: string, status: InquiryStatus) => {
    try {
      await setStatus({ id: id as never, status });
      toast.success(
        status === "archived" ? "Archived" : status === "read" ? "Marked as read" : "Moved to new",
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Update failed");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await remove({ id: id as never });
      toast.success("Inquiry deleted");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Delete failed");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold sm:text-3xl">Inquiries</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Messages from the contact form and product pages.
          {newCount > 0 && ` ${newCount} new.`}
        </p>
      </div>

      <div className="flex gap-2">
        {(["all", "new", "read", "archived"] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilter(s)}
            className={`rounded-full border px-3.5 py-1.5 text-sm font-medium capitalize transition-colors ${
              filter === s
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            {s}
            {s === "new" && newCount > 0 && ` (${newCount})`}
          </button>
        ))}
      </div>

      {inquiries === undefined ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="card-soft">
          <CardContent className="p-12 text-center">
            <Mail className="mx-auto size-8 text-muted-foreground" />
            <p className="mt-3 font-display text-lg font-semibold">No inquiries here</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Customer messages will appear in this list.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((inq) => (
            <Card key={inq._id} className={`card-soft ${inq.status === "new" ? "border-primary/30" : ""}`}>
              <CardContent className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{inq.name}</p>
                      {inq.status === "new" && (
                        <Badge className="rounded-full bg-primary text-primary-foreground">New</Badge>
                      )}
                      <Badge variant="secondary" className="rounded-full capitalize">
                        {inq.status}
                      </Badge>
                    </div>
                    <p className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <a href={`mailto:${inq.email}`} className="inline-flex items-center gap-1 hover:text-foreground">
                        <Mail className="size-3" /> {inq.email}
                      </a>
                      {inq.phone && (
                        <a href={`tel:${inq.phone}`} className="inline-flex items-center gap-1 hover:text-foreground">
                          <Phone className="size-3" /> {inq.phone}
                        </a>
                      )}
                      {inq.listingTitle && (
                        <span className="inline-flex items-center gap-1">
                          <Eye className="size-3" /> About “{inq.listingTitle}”
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {inq.status === "new" && (
                      <Button variant="outline" size="sm" onClick={() => handleStatus(inq._id, "read")}>
                        <MailOpen className="size-3.5" /> Mark read
                      </Button>
                    )}
                    {inq.status !== "archived" && (
                      <Button variant="outline" size="sm" onClick={() => handleStatus(inq._id, "archived")}>
                        <Archive className="size-3.5" /> Archive
                      </Button>
                    )}
                    {inq.status === "archived" && (
                      <Button variant="outline" size="sm" onClick={() => handleStatus(inq._id, "read")}>
                        <CheckCheck className="size-3.5" /> Unarchive
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:bg-destructive/10"
                      onClick={() => handleDelete(inq._id)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{inq.message}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
