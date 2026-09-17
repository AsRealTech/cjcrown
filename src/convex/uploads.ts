// Image uploads: admin-only mutation that mints a short-lived upload URL.
// The client POSTs the file to that URL, then stores the returned storage id.

import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { requireAdmin } from "./adminAccess";

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

/** Remove an orphaned image after the admin cancels an edit. */
export const deleteStorageFile = mutation({
  args: { id: v.id("_storage") },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx);
    await ctx.storage.delete(id);
  },
});
