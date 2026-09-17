// Site settings stored as simple key/value strings. All values have sensible
// defaults on the client (src/lib/site.ts) so the site works before the admin
// customizes anything.

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin } from "./adminAccess";

export const getSettings = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query("siteSettings").collect();
    const map: Record<string, string> = {};
    for (const row of rows) map[row.key] = row.value;
    return map;
  },
});

export const setSetting = mutation({
  args: { key: v.string(), value: v.string() },
  handler: async (ctx, { key, value }) => {
    await requireAdmin(ctx);
    const existing = await ctx.db
      .query("siteSettings")
      .withIndex("by_key", (q) => q.eq("key", key))
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, { value });
    } else {
      await ctx.db.insert("siteSettings", { key, value });
    }
  },
});
