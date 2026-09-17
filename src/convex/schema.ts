import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// default user roles. can add / remove based on the project as needed
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
);
export type Role = Infer<typeof roleValidator>;

const schema = defineSchema(
  {
    // default auth tables using convex auth.
    ...authTables, // do not remove or modify

    // the users table is the default users table that is brought in by the authTables
    users: defineTable({
      name: v.optional(v.string()), // name of the user. do not remove
      image: v.optional(v.string()), // image of the user. do not remove
      email: v.optional(v.string()), // email of the user. do not remove
      emailVerificationTime: v.optional(v.number()), // email verification time. do not remove
      isAnonymous: v.optional(v.boolean()), // is the user anonymous. do not remove

      role: v.optional(roleValidator), // role of the user. do not remove

      username: v.optional(v.string()), // lowercase, unique when present; used for username login
    })
      .index("email", ["email"]) // index for the email. do not remove or modify
      .index("by_username", ["username"]),

    furnitureListings: defineTable({
      title: v.string(),
      slug: v.string(),
      category: v.string(),
      price: v.number(), // 0 = "price on request"
      currency: v.string(),
      description: v.string(),
      materials: v.optional(v.string()),
      dimensions: v.optional(v.string()),
      condition: v.optional(
        v.union(
          v.literal("new"),
          v.literal("like-new"),
          v.literal("good"),
          v.literal("vintage"),
        ),
      ),
      status: v.union(v.literal("published"), v.literal("draft")),
      featured: v.boolean(),
      imageIds: v.array(v.id("_storage")),
      imageUrls: v.optional(v.array(v.string())), // external image URLs (alternative to uploads)
      imageOrder: v.array(v.number()), // parallel to imageIds: index -> position rank
      views: v.number(),
      updatedBy: v.optional(v.id("users")),
    })
      .index("by_status", ["status"])
      .index("by_category", ["category"])
      .index("by_slug", ["slug"])
      .index("by_featured", ["featured"]),

    inquiries: defineTable({
      listingId: v.optional(v.id("furnitureListings")),
      listingTitle: v.optional(v.string()),
      name: v.string(),
      email: v.string(),
      phone: v.optional(v.string()),
      message: v.string(),
      status: v.union(v.literal("new"), v.literal("read"), v.literal("archived")),
      createdAt: v.number(),
    })
      .index("by_status", ["status"])
      .index("by_created", ["createdAt"]),

    siteSettings: defineTable({
      key: v.string(),
      value: v.string(),
    }).index("by_key", ["key"]),

    teamMembers: defineTable({
      name: v.string(),
      title: v.string(),
      bio: v.optional(v.string()),
      order: v.number(),
    }).index("by_order", ["order"]),

    // add other tables here
  },
  {
    schemaValidation: false,
  },
);

export default schema;
