import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useSiteSettings, settingWithDefault, SITE_SETTINGS_KEYS, SITE } from "@/lib/site";
import { useMutation } from "convex/react";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function InquiryForm({
  listingId,
  listingTitle,
  compact = false,
}: {
  listingId?: Id<"furnitureListings">;
  listingTitle?: string;
  compact?: boolean;
}) {
  const submitInquiry = useMutation(api.inquiries.submitInquiry);
  const settings = useSiteSettings();
  const email = settingWithDefault(settings, SITE_SETTINGS_KEYS.contactEmail, SITE.email);

  const [name, setName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSending(true);
    try {
      await submitInquiry({
        listingId,
        listingTitle,
        name: name.trim(),
        email: contactEmail.trim(),
        phone: phone.trim() || undefined,
        message: message.trim(),
      });
      setSent(true);
      toast.success("Inquiry sent — we'll reply within one business day.");
    } catch (error) {
      console.error(error);
      toast.error("Could not send your inquiry. Please try again.");
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-border/70 bg-card px-6 py-10 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <CheckCircle2 className="size-6" />
        </span>
        <h3 className="font-display text-lg font-semibold">Thank you, {name.split(" ")[0] || "friend"}.</h3>
        <p className="max-w-sm text-sm text-muted-foreground">
          Your inquiry is on its way to {email}. We usually reply within one
          business day.
        </p>
        <Button variant="outline" size="sm" onClick={() => setSent(false)}>
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className={compact ? "space-y-4" : "grid gap-4 sm:grid-cols-2"}>
        <div className="space-y-2">
          <Label htmlFor="inq-name">Name</Label>
          <Input
            id="inq-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="inq-email">Email</Label>
          <Input
            id="inq-email"
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="inq-phone">
          Phone <span className="text-muted-foreground">(optional)</span>
        </Label>
        <Input
          id="inq-phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+1 555 000 0000"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="inq-message">Message</Label>
        <Textarea
          id="inq-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={
            listingTitle
              ? `I'm interested in the ${listingTitle}…`
              : "Tell us about your space, timeline, or the piece you have in mind…"
          }
          rows={compact ? 3 : 5}
          required
        />
      </div>
      <Button type="submit" className="w-full" disabled={sending}>
        {sending ? (
          <>
            <Loader2 className="size-4 animate-spin" /> Sending…
          </>
        ) : (
          <>
            <Send className="size-4" /> Send inquiry
          </>
        )}
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        Or email us directly at {email}
      </p>
    </form>
  );
}
