// Seeds a small sample collection so a fresh site looks complete. Idempotent:
// skips seeding when any listing already exists. Admin-only.

import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { requireAdmin } from "./adminAccess";

const SAMPLES = [
  {
    title: "Alder Lounge Chair",
    category: "Seating",
    price: 1240,
    currency: "USD",
    description:
      "A low, generous lounge chair in solid alder with a hand-rubbed oil finish. The wide arms and deep seat are built for long evenings, and the joinery is cut to be re-tightened, not replaced.",
    materials: "Solid alder, linen upholstery",
    dimensions: "W 78 × D 92 × H 74 cm",
    condition: "new" as const,
    featured: true,
    imageUrls: [
      "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1549187774-b4e9b0445b41?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  {
    title: "Meridian Dining Table",
    category: "Tables",
    price: 2890,
    currency: "USD",
    description:
      "Seats eight without shouting. A single book-matched walnut top rests on a trestle base pegged together the old way — no metal fasteners anywhere you can see.",
    materials: "Book-matched walnut, oiled finish",
    dimensions: "L 240 × W 100 × H 75 cm",
    condition: "new" as const,
    featured: true,
    imageUrls: [
      "https://images.unsplash.com/photo-1577140917170-285929fb55b7?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  {
    title: "Grain Sideboard",
    category: "Storage",
    price: 1980,
    currency: "USD",
    description:
      "Reeded oak doors open on soft-close runners, with room enough for the good dishes and the everyday ones. Finished with a matte lacquer that shrugs off daily use.",
    materials: "White oak, brass pulls",
    dimensions: "W 180 × D 45 × H 78 cm",
    condition: "new" as const,
    featured: true,
    imageUrls: [
      "https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  {
    title: "Nordic Bed Frame",
    category: "Beds",
    price: 1650,
    currency: "USD",
    description:
      "A floating platform frame in white ash with a gently curved headboard. No box spring needed; slats are spaced for modern memory foam or latex mattresses.",
    materials: "White ash, natural oil",
    dimensions: "W 168 × L 210 × H 95 cm",
    condition: "new" as const,
    featured: false,
    imageUrls: [
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  {
    title: "Archive Floor Lamp",
    category: "Lighting",
    price: 520,
    currency: "USD",
    description:
      "A slim oak stem under a hand-spun shade. The brass dimmer warms the light from reading-bright to evening-soft.",
    materials: "Oak, spun brass, linen shade",
    dimensions: "H 152 × Ø 38 cm",
    condition: "new" as const,
    featured: false,
    imageUrls: [
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  {
    title: "Hearth Coffee Table",
    category: "Tables",
    price: 890,
    currency: "USD",
    description:
      "A low table for feet, books and unfinished cups. The blackened steel base was waxed by hand; the Douglas fir top was left to silver.",
    materials: "Douglas fir, blackened steel",
    dimensions: "W 120 × D 60 × H 38 cm",
    condition: "vintage" as const,
    featured: false,
    imageUrls: [
      "https://images.unsplash.com/photo-1532372320572-cda25653a26d?auto=format&fit=crop&w=1200&q=80",
    ],
  },
];

export const seedSampleListings = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const existing = await ctx.db.query("furnitureListings").first();
    if (existing) {
      return { seeded: 0 };
    }
    for (const sample of SAMPLES) {
      await ctx.db.insert("furnitureListings", {
        title: sample.title,
        slug: sample.title
          .toLowerCase()
          .trim()
          .replace(/['"]/g, "")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, ""),
        category: sample.category,
        price: sample.price,
        currency: sample.currency,
        description: sample.description,
        materials: sample.materials,
        dimensions: sample.dimensions,
        condition: sample.condition,
        status: "published",
        featured: sample.featured,
        imageIds: [],
        imageUrls: sample.imageUrls,
        imageOrder: [],
        views: 0,
      });
    }
    return { seeded: SAMPLES.length };
  },
});
