// Admin access: check the current user's role, and self-serve promotion.
// V1 policy: any authenticated (non-anonymous) user can claim admin via
// claimAdmin — this app is for "me and a small team", no invite codes yet.
// Anonymous guests are never admins.
//
// Queries use requireAdminOrNull (return null for non-admins) so dashboards
// can render a "claim access" banner instead of crashing. Mutations always
// use requireAdmin (throw) so unauthorized writes are blocked with a toast.

import { getAuthUserId } from "@convex-dev/auth/server";
import { Doc } from "./_generated/dataModel";
import { mutation, query, QueryCtx } from "./_generated/server";
import { ROLES } from "./schema";

export async function getCurrentUser(
  ctx: QueryCtx,
): Promise<Doc<"users"> | null> {
  const userId = await getAuthUserId(ctx);
  if (userId === null) return null;
  return await ctx.db.get(userId);
}

export async function requireAdmin(ctx: QueryCtx): Promise<Doc<"users">> {
  const user = await getCurrentUser(ctx);
  if (!user) {
    throw new Error("You must be signed in to do that.");
  }
  if (user.isAnonymous) {
    throw new Error("Sign in with an email account to manage the site.");
  }
  if (user.role !== ROLES.ADMIN) {
    throw new Error("You do not have admin access.");
  }
  return user;
}

/** For queries: null when not an admin so pages can degrade gracefully. */
export async function requireAdminOrNull(
  ctx: QueryCtx,
): Promise<Doc<"users"> | null> {
  const user = await getCurrentUser(ctx);
  if (!user || user.isAnonymous || user.role !== ROLES.ADMIN) return null;
  return user;
}

/** Signed in with a real (non-anonymous) account but not yet an admin? */
export const canClaimAdmin = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.isAnonymous) return false;
    return user.role !== ROLES.ADMIN;
  },
});

/** One-time self-serve promotion to admin for authenticated email users. */
export const claimAdmin = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("You must be signed in to do that.");
    }
    if (user.isAnonymous) {
      throw new Error(
        "Guest sessions cannot manage the site. Sign in with your email.",
      );
    }
    if (user.role === ROLES.ADMIN) return;
    await ctx.db.patch(user._id, { role: ROLES.ADMIN });
  },
});

/** Demote back to a plain user (lets an admin hand the dashboard over). */
export const revokeAdmin = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== ROLES.ADMIN) return;
    await ctx.db.patch(user._id, { role: ROLES.USER });
  },
});
