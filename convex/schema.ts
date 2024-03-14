import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  players: defineTable({
    level: v.number(),
    health: v.number(),
    maxHealth: v.number(),
    attack: v.number(),
    defense: v.number(),
    speed: v.number(),
    luck: v.number(),
    specialAttack: v.number(),
    specialDefense: v.number(),
    experience: v.number(),
    name: v.string(),
  }),

  battles: defineTable({
    player1: v.id("players"),
    player2: v.id("players"),
    result: v.string(),
    turn: v.number(),
    inSequence: v.boolean(),
    playerHealth: v.number(),
    opponentHealth: v.number(),
    playerStats: v.optional(v.id("players")),
    opponentStats: v.optional(v.id("players")),
    announcerMessage: v.string(),
    trivia: v.optional(v.string()),
    triviaResult: v.optional(v.boolean()),
    triviaRationale: v.optional(v.string()),
    aiBattle: v.optional(v.boolean()),
  }),
});
