import type { AuthConfig } from "convex/server";

// Provider for this project's own sign-in (email/username + password and
// guest sessions, see src/convex/auth.ts). The deployment self-issues JWTs
// (iss = CONVEX_SITE_URL) validated via OIDC discovery at
// `${domain}/.well-known/openid-configuration`, served by
// auth.addHttpRoutes() in convex/http.ts. Do NOT convert this entry to
// `type: "customJwt"` — that path rejects tokens without a `kid` header, so
// sign-in would silently never confirm and RequireAuth would loop back to
// /auth forever.
//
// CONVEX_SITE_URL must be set on the deployment, e.g.:
//   npx convex env set CONVEX_SITE_URL https://<deployment-name>.convex.site
const selfHostedProvider = {
  domain: process.env.CONVEX_SITE_URL!,
  applicationID: "convex",
};

// Freebuff-preview-only federated tokens let a signed-in freebuff.com user
// carry their identity into this project. Only managed preview deployments
// set VLY_CONVEX_AUTH_ISSUER. Self-hosted deployments never set it — and a
// stray/invalid value (e.g. "me") would make the Convex server reject the
// whole auth config push with InvalidAuthConfig — so the provider is only
// included when the variable is a proper http(s) URL.
const managedIssuer = process.env.VLY_CONVEX_AUTH_ISSUER ?? "";
const freebuffPreviewProviders = /^https?:\/\/\S+\.\S+/.test(managedIssuer)
  ? [
      {
        type: "customJwt" as const,
        issuer: managedIssuer,
        jwks: `${managedIssuer}/api/web/.well-known/jwks.json`,
        applicationID: "vly-convex",
        algorithm: "RS256" as const,
      },
    ]
  : [];

export default {
  providers: [selfHostedProvider, ...freebuffPreviewProviders],
} satisfies AuthConfig;
