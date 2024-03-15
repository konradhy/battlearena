import { v, ConvexError } from "convex/values";
import { internalQuery, mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";

export const getPlayerById = query({
  args: {
    id: v.id("characters"),
  },
  handler: async (ctx, { id }) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new ConvexError({
        message: "You must be logged in to view company details.",
        severity: "low",
      });
    }

    const character = await ctx.db.get(id);
    return character;
  },
});

export const handleAttack = mutation({
  args: {
    id: v.id("characters"),
    result: v.number(),
  },
  handler: async (ctx, { id, result }) => {
    const character = await ctx.db.get(id);

    if (!character) {
      throw new ConvexError({
        message: "Player not found",
        severity: "low",
      });
    }

    character.health -= result;
    await ctx.db.patch(id, character);

    return character;
  },
});

export const getCharacterInternal = internalQuery({
  args: {
    id: v.id("characters"),
  },
  handler: async (ctx, { id }) => {
    const character = await ctx.db.get(id);
    return character;
  },
});
