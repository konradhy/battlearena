import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  characters: defineTable({
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
    userId: v.string(),
    type: v.string(),
    image:v.string()
  }),

  battles: defineTable({
    player1: v.id("characters"),
    player2: v.id("characters"),
    result: v.string(),
    turn: v.number(),
    inSequence: v.boolean(),
    announcerMessage: v.string(),
    trivia: v.optional(v.string()),
    triviaResult: v.optional(v.boolean()),
    triviaRationale: v.optional(v.string()),
    aiBattle: v.boolean(),
    createdBy: v.string(),
    creatorEmail:v.string(),
    challenger: v.optional(v.string()),
  }),
});
