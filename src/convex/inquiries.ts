// Public inquiries submitted from the site; managed in the admin dashboard.

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin, requireAdminOrNull } from "./adminAccess";

export const submitInquiry = mutation({
  args: {
    listingId: v.optional(v.id("furnitureListings")),
    listingTitle: v.optional(v.string()),
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    message: v.string(),
  },
  handler: async (ctx, input) => {
    const id = await ctx.db.insert("inquiries", {
      ...input,
      status: "new",
      createdAt: Date.now(),
    });
    return id;
  },
});

export const adminInquiries = query({
  args: {},
  handler: async (ctx) => {
    if (!(await requireAdminOrNull(ctx))) return null;
    const docs = await ctx.db.query("inquiries").collect();
    return docs.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const setInquiryStatus = mutation({
  args: {
    id: v.id("inquiries"),
    status: v.union(v.literal("new"), v.literal("read"), v.literal("archived")),
  },
  handler: async (ctx, { id, status }) => {
    await requireAdmin(ctx);
    await ctx.db.patch(id, { status });
  },
});

export const deleteInquiry = mutation({
  args: { id: v.id("inquiries") },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx);
    await ctx.db.delete(id);
  },
});
