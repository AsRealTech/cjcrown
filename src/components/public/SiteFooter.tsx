import { useSiteSettings, settingWithDefault, SITE_SETTINGS_KEYS, SITE, buildWhatsAppLink } from "@/lib/site";
import { WhatsAppIcon } from "@/components/public/WhatsAppCta";
import { Armchair, Download, Mail, MapPin, Phone } from "lucide-react";
import { Link } from "react-router";

export function SiteFooter() {
  const settings = useSiteSettings();
  const brand = settingWithDefault(settings, SITE_SETTINGS_KEYS.brandName, SITE.name);
  const email = settingWithDefault(settings, SITE_SETTINGS_KEYS.contactEmail, SITE.email);
  const phone = settingWithDefault(settings, SITE_SETTINGS_KEYS.contactPhone, SITE.phone);
  const address = settingWithDefault(settings, SITE_SETTINGS_KEYS.contactAddress, SITE.address);
  const whatsappHref = buildWhatsAppLink({
    settings,
    enabledKey: SITE_SETTINGS_KEYS.whatsappHomeEnabled,
  });

  return (
    <footer className="border-t border-border/60 bg-card/60">
      <div className="container-site grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Armchair className="size-4" />
            </span>
            <span className="font-display text-base font-semibold">{brand}</span>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-6 text-muted-foreground">
            Considered furniture for calm, well-used rooms. Made in small
            batches from honest materials.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold">Explore</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
            <li>
              <Link to="/catalog" className="hover:text-foreground">
                Full collection
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-foreground">
                Contact & showroom
              </Link>
            </li>
            <li>
              <Link to="/auth" className="hover:text-foreground">
                Team sign in
              </Link>
            </li>
            <li>
              <a
                href="/hearth-and-grain-source.zip"
                download
                className="inline-flex items-center gap-1.5 hover:text-foreground"
                title="Download the full project source code as a zip file"
              >
                <Download className="size-3.5" />
                Download source code
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold">Visit</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0" />
              <span>{address}</span>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold">Reach us</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <Mail className="size-4 shrink-0" />
              <a href={`mailto:${email}`} className="hover:text-foreground">
                {email}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="size-4 shrink-0" />
              <a href={`tel:${phone.replace(/[^+\d]/g, "")}`} className="hover:text-foreground">
                {phone}
              </a>
            </li>
            {whatsappHref && (
              <li className="flex items-center gap-2">
                <WhatsAppIcon className="size-4 shrink-0 text-[#25D366]" />
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground"
                >
                  WhatsApp us
                </a>
              </li>
            )}
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60">
        <div className="container-site flex flex-col items-center justify-between gap-2 py-5 text-xs text-muted-foreground sm:flex-row">
          <span>
            © {new Date().getFullYear()} {brand}. All rights reserved.
          </span>
          <span>Designed for quiet rooms.</span>
        </div>
      </div>
    </footer>
  );
}
