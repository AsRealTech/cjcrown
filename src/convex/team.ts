// Team members shown on the public "About / Atelier" section.

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin } from "./adminAccess";

export const listTeam = query({
  args: {},
  handler: async (ctx) => {
    const docs = await ctx.db.query("teamMembers").collect();
    return docs.sort((a, b) => a.order - b.order);
  },
});

export const saveTeamMember = mutation({
  args: {
    id: v.optional(v.id("teamMembers")),
    name: v.string(),
    title: v.string(),
    bio: v.optional(v.string()),
    order: v.number(),
  },
  handler: async (ctx, { id, ...data }) => {
    await requireAdmin(ctx);
    if (id) {
      await ctx.db.patch(id, data);
      return id;
    }
    return await ctx.db.insert("teamMembers", data);
  },
});

export const deleteTeamMember = mutation({
  args: { id: v.id("teamMembers") },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx);
    await ctx.db.delete(id);
  },
});
