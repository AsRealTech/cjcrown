import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import {
  formatWhatsAppDisplay,
  isValidWhatsAppNumber,
  normalizeWhatsAppNumber,
  SITE_DEFAULTS,
  SITE_SETTINGS_KEYS,
} from "@/lib/site";
import { useMutation, useQuery } from "convex/react";
import { Loader2, Plus, Save, Trash2, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const FIELDS: { key: string; label: string; type?: "text" | "textarea"; hint?: string }[] = [
  { key: "brandName", label: "Brand name", hint: "Shown in the header, footer and titles." },
  { key: "heroHeadline", label: "Home hero headline", type: "textarea" },
  { key: "heroSub", label: "Home hero subheading", type: "textarea" },
  { key: "aboutIntro", label: "About intro paragraph", type: "textarea" },
  { key: "ctaHeadline", label: "CTA band headline" },
  { key: "ctaBody", label: "CTA band body", type: "textarea" },
  { key: "contactEmail", label: "Contact email" },
  { key: "contactPhone", label: "Contact phone" },
  { key: "contactAddress", label: "Showroom address" },
  { key: "contactHours", label: "Opening hours" },
];

const DEFAULT_HINTS: Record<string, string> = {
  brandName: "Hearth & Grain",
  heroHeadline: "Furniture made to be lived with.",
  heroSub: "Solid-wood furniture, made in small batches…",
  aboutIntro: "We are a small workshop of makers…",
  ctaHeadline: "Visit the showroom",
  ctaBody: "See and sit in the full collection…",
  contactEmail: "hello@hearthandgrain.com",
  contactPhone: "+1 (555) 214-8870",
  contactAddress: "218 Meridian Row, Suite 4, Portland, OR",
  contactHours: "Mon–Sat, 10am–6pm",
};

type TeamMember = {
  id?: string;
  name: string;
  title: string;
  bio: string;
};

const WHATSAPP_FIELDS = [
  { key: SITE_SETTINGS_KEYS.whatsappNumber, label: "WhatsApp number" },
  { key: SITE_SETTINGS_KEYS.whatsappDefaultMessage, label: "Default WhatsApp message" },
  { key: SITE_SETTINGS_KEYS.whatsappPrimaryLabel, label: "Primary CTA text" },
  { key: SITE_SETTINGS_KEYS.whatsappFloatingLabel, label: "Floating button message" },
  { key: SITE_SETTINGS_KEYS.whatsappListingLabel, label: "Listing CTA text" },
  { key: SITE_SETTINGS_KEYS.whatsappListingTemplate, label: "Listing message template" },
  { key: SITE_SETTINGS_KEYS.whatsappHomeLabel, label: "Homepage CTA text" },
  { key: SITE_SETTINGS_KEYS.whatsappContactLabel, label: "Contact page CTA text" },
];

const WHATSAPP_TOGGLE_FIELDS = [
  {
    key: SITE_SETTINGS_KEYS.whatsappFloatingEnabled,
    label: "Floating WhatsApp button",
    hint: "Bubble pinned to the bottom-right corner on every public page.",
  },
  {
    key: SITE_SETTINGS_KEYS.whatsappListingEnabled,
    label: "Listing “Chat on WhatsApp” button",
    hint: "Shown on every published product page and catalog card hover area.",
  },
  {
    key: SITE_SETTINGS_KEYS.whatsappHomeEnabled,
    label: "Homepage WhatsApp CTA",
    hint: "Button inside the homepage CTA band.",
  },
  {
    key: SITE_SETTINGS_KEYS.whatsappContactEnabled,
    label: "Contact page WhatsApp CTA",
    hint: "Button in the contact page info column.",
  },
] as const;

export default function AdminSettings() {
  const settings = useQuery(api.siteSettings.getSettings);
  const team = useQuery(api.team.listTeam);
  const setSetting = useMutation(api.siteSettings.setSetting);
  const saveMember = useMutation(api.team.saveTeamMember);
  const deleteMember = useMutation(api.team.deleteTeamMember);
  const { user } = useAuth();

  const [values, setValues] = useState<Record<string, string>>({});
  const [localTeam, setLocalTeam] = useState<TeamMember[]>([{ name: "", title: "", bio: "" }]);
  const [saving, setSaving] = useState(false);
  const [hydratedSettings, setHydratedSettings] = useState(false);
  const [hydratedTeam, setHydratedTeam] = useState(false);

  useEffect(() => {
    if (settings && !hydratedSettings) {
      setValues({ ...settings });
      setHydratedSettings(true);
    }
  }, [settings, hydratedSettings]);

  // Seed local team state from the server exactly once per fresh dataset.
  useEffect(() => {
    if (team !== undefined && !hydratedTeam) {
      setLocalTeam(
        team.length > 0
          ? team.map((m) => ({ id: m._id, name: m.name, title: m.title, bio: m.bio ?? "" }))
          : [{ name: "", title: "", bio: "" }],
      );
      setHydratedTeam(true);
    }
  }, [team, hydratedTeam]);

  const handleSaveAll = async () => {
    // Validate the WhatsApp number before persisting anything.
    const waNumber = values[SITE_SETTINGS_KEYS.whatsappNumber] ?? "";
    if (waNumber.trim() && !isValidWhatsAppNumber(waNumber)) {
      toast.error(
        "WhatsApp number looks invalid. Include country code, digits only, e.g. 15551234567.",
      );
      return;
    }
    setSaving(true);
    try {
      for (const field of [...FIELDS, ...WHATSAPP_FIELDS]) {
        const value = values[field.key] ?? "";
        if (value !== (settings?.[field.key] ?? "")) {
          await setSetting({ key: field.key, value: value.trim() });
        }
      }
      toast.success("Settings saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveMember = async (member: TeamMember, index: number) => {
    if (!member.name.trim() || !member.title.trim()) {
      toast.error("Team members need at least a name and a title.");
      return;
    }
    try {
      await saveMember({
        id: (member.id ?? undefined) as never,
        name: member.name.trim(),
        title: member.title.trim(),
        bio: member.bio.trim() || undefined,
        order: index,
      });
      toast.success("Team member saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Save failed");
    }
  };

  const handleDeleteMember = async (id: string) => {
    try {
      await deleteMember({ id: id as never });
      toast.success("Team member removed");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Delete failed");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold sm:text-3xl">Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Site content, contact details and your team profile.
          </p>
        </div>
        <Button onClick={handleSaveAll} disabled={saving} className="rounded-full">
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          Save changes
        </Button>
      </div>

      {/* Signed-in profile */}
      <Card className="card-soft">
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Your profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <UserRound className="size-6" />
            </span>
            <div>
              <p className="font-medium">{user?.name || "Team member"}</p>
              <p className="text-sm text-muted-foreground">
                {user?.email} · role: {user?.role ?? "user"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Site content */}
      <Card className="card-soft">
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Site content</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {FIELDS.map((field) => (
            <div key={field.key} className="space-y-2">
              <Label htmlFor={`set-${field.key}`}>{field.label}</Label>
              {field.type === "textarea" ? (
                <Textarea
                  id={`set-${field.key}`}
                  rows={2}
                  value={values[field.key] ?? ""}
                  onChange={(e) => setValues((v) => ({ ...v, [field.key]: e.target.value }))}
                  placeholder={`Default: ${DEFAULT_HINTS[field.key]}`}
                />
              ) : (
                <Input
                  id={`set-${field.key}`}
                  value={values[field.key] ?? ""}
                  onChange={(e) => setValues((v) => ({ ...v, [field.key]: e.target.value }))}
                  placeholder={`Default: ${DEFAULT_HINTS[field.key]}`}
                />
              )}
              {field.hint && <p className="text-xs text-muted-foreground">{field.hint}</p>}
            </div>
          ))}
          <p className="text-xs text-muted-foreground">
            Empty fields fall back to the polished defaults shown as placeholders.
          </p>
        </CardContent>
      </Card>

      {/* WhatsApp CTA settings */}
      <Card className="card-soft">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <span className="flex size-6 items-center justify-center rounded-md bg-[#25D366]/15 text-[#128C4A]">
              <svg viewBox="0 0 24 24" fill="currentColor" className="size-3.5" aria-hidden>
                <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.9-4.45 9.9-9.91C21.95 6.45 17.5 2 12.04 2zm5.8 14.03c-.24.68-1.4 1.3-1.93 1.35-.53.05-1.02.24-3.45-.72-2.93-1.15-4.75-4.2-4.9-4.4-.14-.2-1.15-1.53-1.15-2.92 0-1.39.73-2.07 1-2.35.26-.29.57-.36.76-.36.19 0 .38 0 .55.01.18.01.41-.07.64.49.24.58.81 1.99.88 2.13.07.14.12.31.02.5-.1.19-.15.31-.29.48-.14.17-.3.38-.43.51-.14.14-.29.29-.12.57.17.29.75 1.24 1.61 2.01 1.11.99 2.04 1.3 2.33 1.44.29.15.46.12.63-.07.17-.19.72-.84.91-1.13.19-.29.38-.24.65-.14.26.09 1.68.79 1.97.94.29.14.48.22.55.34.07.13.07.75-.17 1.42z" />
              </svg>
            </span>
            WhatsApp CTA
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between rounded-lg border border-border/60 p-3">
            <div>
              <p className="text-sm font-medium">Enable WhatsApp CTA</p>
              <p className="text-xs text-muted-foreground">
                Master switch — hides every WhatsApp button on the public site when off.
              </p>
            </div>
            <Switch
              checked={(values[SITE_SETTINGS_KEYS.whatsappEnabled] ?? "true") === "true"}
              onCheckedChange={(checked) =>
                setValues((v) => ({
                  ...v,
                  [SITE_SETTINGS_KEYS.whatsappEnabled]: checked ? "true" : "false",
                }))
              }
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="set-wa-number">WhatsApp phone number</Label>
              <Input
                id="set-wa-number"
                value={values[SITE_SETTINGS_KEYS.whatsappNumber] ?? ""}
                onChange={(e) =>
                  setValues((v) => ({ ...v, [SITE_SETTINGS_KEYS.whatsappNumber]: e.target.value }))
                }
                placeholder="+1 555 123 4567"
                inputMode="tel"
              />
              <p className="text-xs text-muted-foreground">
                Include the country code. Spaces and dashes are fine — stored
                clean in the database, never hard-coded in the site.
              </p>
              {(values[SITE_SETTINGS_KEYS.whatsappNumber] ?? "").trim() !== "" && (
                <p
                  className={`text-xs font-medium ${
                    isValidWhatsAppNumber(values[SITE_SETTINGS_KEYS.whatsappNumber] ?? "")
                      ? "text-emerald-600"
                      : "text-destructive"
                  }`}
                >
                  {isValidWhatsAppNumber(values[SITE_SETTINGS_KEYS.whatsappNumber] ?? "")
                    ? `Valid ✓ wa.me/${normalizeWhatsAppNumber(
                        values[SITE_SETTINGS_KEYS.whatsappNumber] ?? "",
                      )}`
                    : "Invalid — use 8–15 digits with country code"}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="set-wa-default">Default WhatsApp message</Label>
              <Textarea
                id="set-wa-default"
                rows={3}
                value={values[SITE_SETTINGS_KEYS.whatsappDefaultMessage] ?? ""}
                onChange={(e) =>
                  setValues((v) => ({
                    ...v,
                    [SITE_SETTINGS_KEYS.whatsappDefaultMessage]: e.target.value,
                  }))
                }
                placeholder={`Default: ${SITE_DEFAULTS.whatsappDefaultMessage}`}
              />
              <p className="text-xs text-muted-foreground">
                Used by the floating button and any CTA without its own message.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="set-wa-primary">Primary CTA text</Label>
              <Input
                id="set-wa-primary"
                value={values[SITE_SETTINGS_KEYS.whatsappPrimaryLabel] ?? ""}
                onChange={(e) =>
                  setValues((v) => ({
                    ...v,
                    [SITE_SETTINGS_KEYS.whatsappPrimaryLabel]: e.target.value,
                  }))
                }
                placeholder={`Default: ${SITE_DEFAULTS.whatsappPrimaryLabel}`}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="set-wa-home">Homepage CTA text</Label>
              <Input
                id="set-wa-home"
                value={values[SITE_SETTINGS_KEYS.whatsappHomeLabel] ?? ""}
                onChange={(e) =>
                  setValues((v) => ({
                    ...v,
                    [SITE_SETTINGS_KEYS.whatsappHomeLabel]: e.target.value,
                  }))
                }
                placeholder={`Default: ${SITE_DEFAULTS.whatsappHomeLabel}`}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="set-wa-contact">Contact page CTA text</Label>
              <Input
                id="set-wa-contact"
                value={values[SITE_SETTINGS_KEYS.whatsappContactLabel] ?? ""}
                onChange={(e) =>
                  setValues((v) => ({
                    ...v,
                    [SITE_SETTINGS_KEYS.whatsappContactLabel]: e.target.value,
                  }))
                }
                placeholder={`Default: ${SITE_DEFAULTS.whatsappContactLabel}`}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="set-wa-listing">Listing CTA text</Label>
              <Input
                id="set-wa-listing"
                value={values[SITE_SETTINGS_KEYS.whatsappListingLabel] ?? ""}
                onChange={(e) =>
                  setValues((v) => ({
                    ...v,
                    [SITE_SETTINGS_KEYS.whatsappListingLabel]: e.target.value,
                  }))
                }
                placeholder={`Default: ${SITE_DEFAULTS.whatsappListingLabel}`}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="set-wa-template">Listing message template</Label>
            <Textarea
              id="set-wa-template"
              rows={2}
              value={values[SITE_SETTINGS_KEYS.whatsappListingTemplate] ?? ""}
              onChange={(e) =>
                setValues((v) => ({
                  ...v,
                  [SITE_SETTINGS_KEYS.whatsappListingTemplate]: e.target.value,
                }))
              }
              placeholder={`Default: ${SITE_DEFAULTS.whatsappListingTemplate}`}
            />
            <p className="text-xs text-muted-foreground">
              Use <code className="rounded bg-muted px-1">&#123;listing&#125;</code> where the
              furniture name should appear. The listing reference (slug) is added
              automatically on a second line.
            </p>
          </div>

          <div className="space-y-3 border-t border-border/60 pt-4">
            <div className="space-y-2">
              <Label htmlFor="set-wa-floating-msg">Floating button message</Label>
              <Input
                id="set-wa-floating-msg"
                value={values[SITE_SETTINGS_KEYS.whatsappFloatingLabel] ?? ""}
                onChange={(e) =>
                  setValues((v) => ({
                    ...v,
                    [SITE_SETTINGS_KEYS.whatsappFloatingLabel]: e.target.value,
                  }))
                }
                placeholder={`Default: ${SITE_DEFAULTS.whatsappFloatingLabel}`}
              />
              <p className="text-xs text-muted-foreground">
                Pre-filled message used when visitors click the floating bubble.
              </p>
            </div>
            {WHATSAPP_TOGGLE_FIELDS.map((toggle) => (
              <div
                key={toggle.key}
                className="flex items-center justify-between rounded-lg border border-border/60 p-3"
              >
                <div>
                  <p className="text-sm font-medium">{toggle.label}</p>
                  <p className="text-xs text-muted-foreground">{toggle.hint}</p>
                </div>
                <Switch
                  checked={(values[toggle.key] ?? "true") === "true"}
                  onCheckedChange={(checked) =>
                    setValues((v) => ({ ...v, [toggle.key]: checked ? "true" : "false" }))
                  }
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Team members */}
      <Card className="card-soft">
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Team members</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {team === undefined ? (
            <div className="h-16 animate-pulse rounded bg-muted" />
          ) : (
            <>
              {localTeam.map((member, index) => (
                <div
                  key={member.id ?? `new-${index}`}
                  className="rounded-xl border border-border/60 p-4"
                >
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Name</Label>
                      <Input
                        value={member.name}
                        onChange={(e) => {
                          const next = [...localTeam];
                          next[index] = { ...member, name: e.target.value };
                          setLocalTeam(next);
                        }}
                        placeholder="e.g. Mara Lindqvist"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input
                        value={member.title}
                        onChange={(e) => {
                          const next = [...localTeam];
                          next[index] = { ...member, title: e.target.value };
                          setLocalTeam(next);
                        }}
                        placeholder="e.g. Founder & lead maker"
                      />
                    </div>
                  </div>
                  <div className="mt-3 space-y-2">
                    <Label>Short bio (optional)</Label>
                    <Textarea
                      rows={2}
                      value={member.bio}
                      onChange={(e) => {
                        const next = [...localTeam];
                        next[index] = { ...member, bio: e.target.value };
                        setLocalTeam(next);
                      }}
                    />
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleSaveMember(member, index)}>
                      Save member
                    </Button>
                    {member.id && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => handleDeleteMember(member.id!)}
                      >
                        <Trash2 className="size-3.5" /> Remove
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLocalTeam([...localTeam, { name: "", title: "", bio: "" }])}
              >
                <Plus className="size-3.5" /> Add team member
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
