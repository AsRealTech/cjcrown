// Internal lookup used by the credentials provider during sign-in.
// Internal so browsers can't enumerate usernames/emails.

import { internalQuery } from "./_generated/server";
import { v } from "convex/values";

export const findByUsername = internalQuery({
  args: { username: v.string() },
  handler: async (ctx, { username }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", username))
      .first();
    if (!user) return null;
    return { _id: user._id, email: user.email ?? null };
  },
});
