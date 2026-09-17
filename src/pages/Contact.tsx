import { SiteFooter } from "@/components/public/SiteFooter";
import { SiteHeader } from "@/components/public/SiteHeader";
import { InquiryForm } from "@/components/public/InquiryForm";
import { WhatsAppButton, WhatsAppFloatingButton } from "@/components/public/WhatsAppCta";
import { Card, CardContent } from "@/components/ui/card";
import { useSiteSettings, settingWithDefault, SITE_SETTINGS_KEYS, SITE } from "@/lib/site";
import { Clock, Mail, MapPin, Phone } from "lucide-react";

export default function Contact() {
  const settings = useSiteSettings();
  const email = settingWithDefault(settings, SITE_SETTINGS_KEYS.contactEmail, SITE.email);
  const phone = settingWithDefault(settings, SITE_SETTINGS_KEYS.contactPhone, SITE.phone);
  const address = settingWithDefault(settings, SITE_SETTINGS_KEYS.contactAddress, SITE.address);
  const hours = settingWithDefault(settings, SITE_SETTINGS_KEYS.contactHours, SITE.hours);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        <section className="border-b border-border/60 bg-card/40">
          <div className="container-site py-12 sm:py-16">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">
              Contact
            </p>
            <h1 className="mt-2 font-display text-4xl font-semibold sm:text-5xl">
              Let's furnish something lasting
            </h1>
            <p className="mt-4 max-w-2xl text-pretty leading-7 text-muted-foreground">
              Ask about a piece, plan a custom commission, or book a visit to
              the showroom. We answer every message within one business day.
            </p>
          </div>
        </section>

        <section className="container-site py-12 lg:py-16">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:gap-14">
            {/* Info cards */}
            <div className="space-y-4">
              {[
                { icon: Mail, label: "Email", value: email, href: `mailto:${email}` },
                { icon: Phone, label: "Phone", value: phone, href: `tel:${phone.replace(/[^+\d]/g, "")}` },
                { icon: MapPin, label: "Showroom", value: address },
                { icon: Clock, label: "Hours", value: hours },
              ].map((item) => (
                <Card key={item.label} className="card-soft">
                  <CardContent className="flex items-start gap-4 p-5">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <item.icon className="size-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold">{item.label}</p>
                      {item.href ? (
                        <a
                          href={item.href}
                          className="mt-1 block truncate text-sm text-muted-foreground hover:text-foreground"
                        >
                          {item.value}
                        </a>
                      ) : (
                        <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.value}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}

              <div className="rounded-xl border border-primary/25 bg-primary/5 p-5">
                <p className="font-display text-sm font-semibold text-primary">
                  Trade & interior designers
                </p>
                <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
                  We offer trade pricing and finish samples for studios. Mention
                  your practice in the message and we'll send our trade packet.
                </p>
              </div>

              <WhatsAppButton
                enabledKey={SITE_SETTINGS_KEYS.whatsappContactEnabled}
                className="w-full [&>button]:w-full"
              />
            </div>

            {/* Form */}
            <Card className="card-soft h-fit">
              <CardContent className="p-6 sm:p-8">
                <h2 className="font-display text-xl font-semibold">Send an inquiry</h2>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  Fields marked with an asterisk are required.
                </p>
                <div className="mt-6">
                  <InquiryForm />
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <SiteFooter />
      <WhatsAppFloatingButton />
    </div>
  );
}
