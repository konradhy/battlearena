import { v, ConvexError } from "convex/values";
import { internalQuery, mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

export const getPlayerById = query({
  args: {
    id: v.id("players"),
  },
  handler: async (ctx, { id }) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new ConvexError({
        message: "You must be logged in to view company details.",
        severity: "low",
      });
    }

    const player = await ctx.db.get(id);
    return player;
  },
});

export const handleAttack = mutation({
  args: {
    id: v.id("players"),
    result: v.number(),
  },
  handler: async (ctx, { id, result }) => {
    const player = await ctx.db.get(id);

    if (!player) {
      throw new ConvexError({
        message: "Player not found",
        severity: "low",
      });
    }

    player.health -= result;
    await ctx.db.patch(id, player);

    return player;
  },
});
