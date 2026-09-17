// Generate a short-lived URL for a storage id so the browser can display it.

import { v } from "convex/values";
import { query } from "./_generated/server";

export const imageUrl = query({
  args: { id: v.id("_storage") },
  handler: async (ctx, { id }) => {
    return await ctx.storage.getUrl(id);
  },
});
