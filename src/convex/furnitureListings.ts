// Furniture listings: public queries for the catalog, admin CRUD for the
// dashboard. Images are uploaded to Convex storage by the admin editor and
// stored as storage ids.

import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { requireAdmin, requireAdminOrNull } from "./adminAccess";

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const conditionValidator = v.optional(
  v.union(
    v.literal("new"),
    v.literal("like-new"),
    v.literal("good"),
    v.literal("vintage"),
  ),
);

export const CATEGORIES = [
  "Seating",
  "Tables",
  "Storage",
  "Beds",
  "Lighting",
  "Outdoor",
  "Decor",
] as const;

/** One listing card / detail as returned to the client. */
export const listingFields = {
  title: v.string(),
  slug: v.string(),
  category: v.string(),
  price: v.number(),
  currency: v.string(),
  description: v.string(),
  materials: v.optional(v.string()),
  dimensions: v.optional(v.string()),
  condition: conditionValidator,
  status: v.union(v.literal("published"), v.literal("draft")),
  featured: v.boolean(),
  imageIds: v.array(v.id("_storage")),
  imageUrls: v.optional(v.array(v.string())),
  imageOrder: v.array(v.number()),
  views: v.number(),
  _creationTime: v.number(),
};

export const publicListings = query({
  args: {},
  handler: async (ctx) => {
    const docs = await ctx.db
      .query("furnitureListings")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .collect();
    return docs.sort((a, b) => {
      if (a.featured !== b.featured) return a.featured ? -1 : 1;
      return b._creationTime - a._creationTime;
    });
  },
});

export const publicListingBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const doc = await ctx.db
      .query("furnitureListings")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();
    if (!doc || doc.status !== "published") return null;
    return doc;
  },
});

/** Increment the view counter when a visitor opens a product page. */
export const trackView = mutation({
  args: { id: v.id("furnitureListings") },
  handler: async (ctx, { id }) => {
    const doc = await ctx.db.get(id);
    if (!doc) return;
    await ctx.db.patch(id, { views: (doc.views ?? 0) + 1 });
  },
});

export const adminListings = query({
  args: {},
  handler: async (ctx) => {
    if (!(await requireAdminOrNull(ctx))) return null;
    const docs = await ctx.db.query("furnitureListings").collect();
    return docs.sort(
      (a, b) => Number(b.featured) - Number(a.featured) || b._creationTime - a._creationTime,
    );
  },
});

export const adminListing = query({
  args: { id: v.id("furnitureListings") },
  handler: async (ctx, { id }) => {
    if (!(await requireAdminOrNull(ctx))) return null;
    return await ctx.db.get(id);
  },
});

const listingInput = {
  title: v.string(),
  category: v.string(),
  price: v.number(),
  currency: v.string(),
  description: v.string(),
  materials: v.optional(v.string()),
  dimensions: v.optional(v.string()),
  condition: conditionValidator,
  status: v.union(v.literal("published"), v.literal("draft")),
  featured: v.boolean(),
  imageIds: v.array(v.id("_storage")),
  imageUrls: v.optional(v.array(v.string())),
  imageOrder: v.array(v.number()),
};

export const createListing = mutation({
  args: listingInput,
  handler: async (ctx, input) => {
    const user = await requireAdmin(ctx);
    const base = slugify(input.title) || "listing";
    let slug = base;
    let n = 2;
    // ensure unique slug
    while (
      await ctx.db
        .query("furnitureListings")
        .withIndex("by_slug", (q) => q.eq("slug", slug))
        .first()
    ) {
      slug = `${base}-${n++}`;
    }
    const id = await ctx.db.insert("furnitureListings", {
      ...input,
      slug,
      views: 0,
      updatedBy: user._id,
    });
    return id;
  },
});

export const updateListing = mutation({
  args: { id: v.id("furnitureListings"), ...listingInput },
  handler: async (ctx, { id, ...input }) => {
    const user = await requireAdmin(ctx);
    await ctx.db.patch(id, { ...input, updatedBy: user._id });
  },
});

export const setListingStatus = mutation({
  args: {
    id: v.id("furnitureListings"),
    status: v.union(v.literal("published"), v.literal("draft")),
  },
  handler: async (ctx, { id, status }) => {
    await requireAdmin(ctx);
    await ctx.db.patch(id, { status });
  },
});

export const setListingFeatured = mutation({
  args: { id: v.id("furnitureListings"), featured: v.boolean() },
  handler: async (ctx, { id, featured }) => {
    await requireAdmin(ctx);
    await ctx.db.patch(id, { featured });
  },
});

export const deleteListing = mutation({
  args: { id: v.id("furnitureListings") },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx);
    const doc = await ctx.db.get(id);
    if (!doc) return;
    for (const imageId of doc.imageIds) {
      await ctx.storage.delete(imageId);
    }
    await ctx.db.delete(id);
  },
});

/** Validate image ordering invariants used by the admin editor. */
export function normalizeImageOrder(
  imageIds: Id<"_storage">[],
  imageOrder: number[],
): number[] {
  if (imageOrder.length !== imageIds.length) {
    return imageIds.map((_, i) => i);
  }
  return imageOrder;
}
