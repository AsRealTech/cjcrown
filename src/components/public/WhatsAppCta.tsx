import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  buildWhatsAppLink,
  renderListingWhatsAppMessage,
  settingWithDefault,
  SITE_DEFAULTS,
  SITE_SETTINGS_KEYS,
  useSiteSettings,
} from "@/lib/site";
import type { Doc } from "@/convex/_generated/dataModel";

export function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.9-4.45 9.9-9.91C21.95 6.45 17.5 2 12.04 2zm5.8 14.03c-.24.68-1.4 1.3-1.93 1.35-.53.05-1.02.24-3.45-.72-2.93-1.15-4.75-4.2-4.9-4.4-.14-.2-1.15-1.53-1.15-2.92 0-1.39.73-2.07 1-2.35.26-.29.57-.36.76-.36.19 0 .38 0 .55.01.18.01.41-.07.64.49.24.58.81 1.99.88 2.13.07.14.12.31.02.5-.1.19-.15.31-.29.48-.14.17-.3.38-.43.51-.14.14-.29.29-.12.57.17.29.75 1.24 1.61 2.01 1.11.99 2.04 1.3 2.33 1.44.29.15.46.12.63-.07.17-.19.72-.84.91-1.13.19-.29.38-.24.65-.14.26.09 1.68.79 1.97.94.29.14.48.22.55.34.07.13.07.75-.17 1.42z" />
    </svg>
  );
}

/** Primary WhatsApp CTA button (home / contact / general). */
export function WhatsAppButton({
  enabledKey,
  message,
  className,
  size = "lg",
}: {
  enabledKey:
    | typeof SITE_SETTINGS_KEYS.whatsappHomeEnabled
    | typeof SITE_SETTINGS_KEYS.whatsappContactEnabled;
  message?: string;
  className?: string;
  size?: "sm" | "default" | "lg";
}) {
  const settings = useSiteSettings();
  const href = buildWhatsAppLink({ settings, enabledKey, message });
  if (!href) return null;

  const label = settingWithDefault(
    settings,
    enabledKey === SITE_SETTINGS_KEYS.whatsappHomeEnabled
      ? SITE_SETTINGS_KEYS.whatsappHomeLabel
      : SITE_SETTINGS_KEYS.whatsappContactLabel,
    enabledKey === SITE_SETTINGS_KEYS.whatsappHomeEnabled
      ? SITE_DEFAULTS.whatsappHomeLabel
      : SITE_DEFAULTS.whatsappContactLabel,
  );

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn("inline-flex", className)}
      aria-label={label}
    >
      <Button size={size} className="gap-2 rounded-full bg-[#25D366] text-[#04310f] hover:bg-[#1ebe5b]">
        <WhatsAppIcon className="size-4" />
        {label}
      </Button>
    </a>
  );
}

/** Listing-scoped WhatsApp CTA with a dynamic, template-driven message. */
export function WhatsAppListingCta({
  listing,
  className,
  size = "lg",
  variant = "solid",
}: {
  listing: Pick<Doc<"furnitureListings">, "title" | "slug" | "_id">;
  className?: string;
  size?: "sm" | "default" | "lg";
  variant?: "solid" | "outline";
}) {
  const settings = useSiteSettings();
  const href = buildWhatsAppLink({
    settings,
    enabledKey: SITE_SETTINGS_KEYS.whatsappListingEnabled,
    message: renderListingWhatsAppMessage(settings, listing.title, listing.slug),
  });
  if (!href) return null;

  const label = settingWithDefault(
    settings,
    SITE_SETTINGS_KEYS.whatsappListingLabel,
    SITE_DEFAULTS.whatsappListingLabel,
  );

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn("inline-flex", className)}
      aria-label={`${label}: ${listing.title}`}
    >
      {variant === "solid" ? (
        <Button size={size} className="w-full gap-2 rounded-full bg-[#25D366] text-[#04310f] hover:bg-[#1ebe5b]">
          <WhatsAppIcon className="size-4" />
          {label}
        </Button>
      ) : (
        <Button
          size={size}
          variant="outline"
          className="w-full gap-2 rounded-full border-[#25D366]/40 text-[#128C4A] hover:bg-[#25D366]/10 hover:text-[#0e7a3f]"
        >
          <WhatsAppIcon className="size-4" />
          {label}
        </Button>
      )}
    </a>
  );
}

/** Floating WhatsApp bubble shown across the public site. */
export function WhatsAppFloatingButton() {
  const settings = useSiteSettings();
  const floatingMessage = settingWithDefault(
    settings,
    SITE_SETTINGS_KEYS.whatsappFloatingLabel,
    SITE_DEFAULTS.whatsappFloatingLabel,
  );
  const href = buildWhatsAppLink({
    settings,
    enabledKey: SITE_SETTINGS_KEYS.whatsappFloatingEnabled,
    message: floatingMessage,
  });
  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className={cn(
        "fixed bottom-5 right-5 z-50 flex size-14 items-center justify-center rounded-full",
        "bg-[#25D366] text-white shadow-[0_8px_24px_-6px_rgba(37,211,102,0.6)]",
        "transition-transform hover:scale-105 active:scale-95",
      )}
    >
      <WhatsAppIcon className="size-7" />
      <span className="absolute -right-0.5 -top-0.5 size-3.5 rounded-full border-2 border-background bg-[#ff5b5b]" />
    </a>
  );
}
