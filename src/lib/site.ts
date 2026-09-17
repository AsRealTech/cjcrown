import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

/** Central place for site content defaults; admins override via dashboard. */
export const SITE = {
  name: "Hearth & Grain",
  tagline: "Furniture made to be lived with",
  email: "hello@hearthandgrain.com",
  phone: "+1 (555) 214-8870",
  address: "218 Meridian Row, Suite 4, Portland, OR",
  hours: "Mon–Sat, 10am–6pm",
  instagram: "@hearthandgrain",
};

export const SITE_SETTINGS_KEYS = {
  brandName: "brandName",
  tagline: "tagline",
  heroHeadline: "heroHeadline",
  heroSub: "heroSub",
  heroImagePrompt: "heroImageNote",
  contactEmail: "contactEmail",
  contactPhone: "contactPhone",
  contactAddress: "contactAddress",
  contactHours: "contactHours",
  aboutIntro: "aboutIntro",
  ctaHeadline: "ctaHeadline",
  ctaBody: "ctaBody",
  // WhatsApp CTA configuration (stored in DB, never hard-coded in components)
  whatsappEnabled: "whatsappEnabled",
  whatsappNumber: "whatsappNumber",
  whatsappDefaultMessage: "whatsappDefaultMessage",
  whatsappPrimaryLabel: "whatsappPrimaryLabel",
  whatsappFloatingEnabled: "whatsappFloatingEnabled",
  whatsappFloatingLabel: "whatsappFloatingLabel",
  whatsappListingEnabled: "whatsappListingEnabled",
  whatsappListingLabel: "whatsappListingLabel",
  whatsappListingTemplate: "whatsappListingTemplate",
  whatsappHomeEnabled: "whatsappHomeEnabled",
  whatsappHomeLabel: "whatsappHomeLabel",
  whatsappContactEnabled: "whatsappContactEnabled",
  whatsappContactLabel: "whatsappContactLabel",
} as const;

/** Fallbacks used only when an admin hasn't set a value yet. */
export const SITE_DEFAULTS: Record<string, string> = {
  brandName: SITE.name,
  heroHeadline: "Furniture made to be lived with.",
  whatsappEnabled: "true",
  whatsappFloatingEnabled: "true",
  whatsappListingEnabled: "true",
  whatsappHomeEnabled: "true",
  whatsappContactEnabled: "true",
  whatsappDefaultMessage:
    "Hello! I found you through your furniture website and I'd like to know more.",
  whatsappPrimaryLabel: "Chat on WhatsApp",
  whatsappFloatingLabel: "Hi! I have a question about your furniture.",
  whatsappListingLabel: "Chat on WhatsApp",
  whatsappListingTemplate:
    "Hello, I'm interested in the {listing}. Is it still available?",
  whatsappHomeLabel: "Ask us on WhatsApp",
  whatsappContactLabel: "Message us on WhatsApp",
  contactEmail: SITE.email,
  contactPhone: SITE.phone,
  contactAddress: SITE.address,
  contactHours: SITE.hours,
  ctaHeadline: "Visit the showroom",
  ctaBody: "See and sit in the full collection at our Portland workshop. Coffee is on us.",
};

export type SiteSettingsMap = Partial<Record<string, string>>;

export function settingWithDefault(
  settings: SiteSettingsMap | undefined,
  key: string,
  fallback: string,
): string {
  const value = settings?.[key];
  return value && value.trim().length > 0 ? value : fallback;
}

/** Reactive site settings with defaults applied. */
export function useSiteSettings() {
  const raw = useQuery(api.siteSettings.getSettings);
  return raw ?? {};
}

export function formatPrice(price: number, currency = "USD"): string {
  if (!price || price <= 0) return "Price on request";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}

export const CONDITION_LABELS: Record<string, string> = {
  new: "New",
  "like-new": "Like new",
  good: "Good",
  vintage: "Vintage",
};

/* ------------------------------------------------------------------ */
/* WhatsApp helpers                                                    */
/* ------------------------------------------------------------------ */

/**
 * Normalizes any admin-entered phone number into the digits-only form the
 * wa.me link format expects (country code + number, no +, spaces or dashes).
 */
export function normalizeWhatsAppNumber(raw: string): string {
  const digits = (raw || "").replace(/[^\d]/g, "");
  return digits.replace(/^0+/, "");
}

export function isValidWhatsAppNumber(raw: string): boolean {
  const digits = normalizeWhatsAppNumber(raw);
  return digits.length >= 8 && digits.length <= 15;
}

export function formatWhatsAppDisplay(raw: string): string {
  const digits = normalizeWhatsAppNumber(raw);
  if (digits.length < 4) return raw;
  return `+${digits}`;
}

/**
 * Builds a wa.me deep link. Returns null when the CTA is disabled or no
 * (valid) WhatsApp number has been configured — callers should hide the
 * button entirely in that case.
 */
export function buildWhatsAppLink(options: {
  settings: SiteSettingsMap | undefined;
  enabledKey: keyof typeof SITE_SETTINGS_KEYS;
  message?: string;
}): string | null {
  const { settings, enabledKey, message } = options;
  // Master switch first, then the per-placement switch.
  const master = settingWithDefault(settings, SITE_SETTINGS_KEYS.whatsappEnabled, "true");
  if (master !== "true") return null;
  const enabled = settingWithDefault(settings, enabledKey, SITE_DEFAULTS[enabledKey] ?? "true");
  if (enabled !== "true") return null;

  const number = settingWithDefault(settings, SITE_SETTINGS_KEYS.whatsappNumber, "");
  if (!isValidWhatsAppNumber(number)) return null;

  const base = `https://wa.me/${normalizeWhatsAppNumber(number)}`;
  const text = (message ?? settingWithDefault(
    settings,
    SITE_SETTINGS_KEYS.whatsappDefaultMessage,
    SITE_DEFAULTS.whatsappDefaultMessage,
  )).trim();
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

/** Fills the admin-configured listing message template. */
export function renderListingWhatsAppMessage(
  settings: SiteSettingsMap | undefined,
  listingTitle: string,
  listingRef?: string,
): string {
  const template = settingWithDefault(
    settings,
    SITE_SETTINGS_KEYS.whatsappListingTemplate,
    SITE_DEFAULTS.whatsappListingTemplate,
  );
  const ref = listingRef ? `\nRef: ${listingRef}` : "";
  return template.replace(/\{listing\}/g, listingTitle).trim() + ref;
}
