import { v, ConvexError } from "convex/values";
import {
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import { wait, attack, specialAttack, heal } from "./helpers";
import { internal } from "./_generated/api";

export const getBattleDetails = query({
  args: {
    id: v.id("battles"),
  },
  handler: async (ctx, { id }) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new ConvexError({
        message: "You must be logged in to view company details.",
        severity: "low",
      });
    }

    const battle = await ctx.db.get(id);
    return battle;
  },
});

export const setBattleSequence = mutation({
  args: {
    id: v.id("battles"),
    mode: v.string(),
    turn: v.number(),
  },
  handler: async (ctx, { id, mode, turn }) => {
    const battle = await ctx.db.get(id);

    if (!battle) {
      throw new ConvexError({
        message: "Battle not found",
        severity: "low",
      });
    }

    const playerStats = await ctx.db.get(battle.player1);
    const opponentStats = await ctx.db.get(battle.player2);
    if (!playerStats || !opponentStats) {
      throw new ConvexError({
        message: "Players not found",
        severity: "low",
      });
    }

    const attacker = turn === 0 ? playerStats : opponentStats;
    const receiver = turn === 0 ? opponentStats : playerStats;
    if (!attacker || !receiver) {
      throw new ConvexError({
        message: "Players not found",
        severity: "low",
      });
    }
    battle.inSequence = true;
    battle.trivia = undefined;
    battle.triviaResult = undefined;
    battle.triviaRationale = undefined;

    await ctx.db.patch(id, battle);

    await ctx.scheduler.runAfter(0, internal.generate.announcerMessage, {
      attacker: attacker.name,
      receiver: receiver.name,
      attackerHealth: attacker.health,
      receiverHealth: receiver.health,
      attackerMaxHealth: attacker.maxHealth,
      receiverMaxHealth: receiver.maxHealth,
      previousMessage: battle.announcerMessage,
      moment: "start",
      mode,
      id,
    });
    //break

    const action =
      mode === "attack" ? attack : mode === "special" ? specialAttack : heal;
    const result = action({ attacker, receiver });
    //await wait(1000); // Simulate action time

    if (mode === "heal") {
      attacker.health += result;
    }
    if (mode === "attack" || mode === "special") {
      receiver.health -= result;
    }

    await ctx.db.patch(id, battle);
    if (turn === 0) {
      await ctx.db.patch(battle.player1, attacker);
      await ctx.db.patch(battle.player2, receiver);
    } else {
      await ctx.db.patch(battle.player1, receiver);
      await ctx.db.patch(battle.player2, attacker);
    }

    await ctx.scheduler.runAfter(15000, internal.battle.updateTurn, {
      id,
      turn,
    });

    return battle;
  },
});

export const setAnnouncerMessage = internalMutation({
  args: {
    id: v.id("battles"),
    message: v.string(),
  },
  handler: async (ctx, { id, message }) => {
    const battle = await ctx.db.get(id);
    if (!battle) {
      throw new ConvexError({
        message: "Battle not found",
        severity: "low",
      });
    }
    battle.announcerMessage = message;

    await ctx.db.patch(id, battle);
  },
});

export const updateTurn = internalMutation({
  args: {
    id: v.id("battles"),
    turn: v.number(),
  },
  handler: async (ctx, { id, turn }) => {
    const battle = await ctx.db.get(id);
    if (!battle) {
      throw new ConvexError({
        message: "Battle not found",
        severity: "low",
      });
    }
    battle.turn = turn === 0 ? 1 : 0;
    battle.inSequence = false;

    await ctx.db.patch(id, battle);
  },
});

export const trivia = query({
  args: {
    id: v.id("battles"),
  },
  handler: async (ctx, { id }) => {
    const battle = await ctx.db.get(id);
    if (!battle) {
      throw new ConvexError({
        message: "Battle not found",
        severity: "low",
      });
    }

    return battle;
  },
});

export const answerTrivia = mutation({
  args: {
    id: v.id("battles"),
    answer: v.string(),
    question: v.string(),
  },
  handler: async (ctx, { id, answer, question }) => {
    const battle = await ctx.db.get(id);
    if (!battle) {
      throw new ConvexError({
        message: "Battle not found",
        severity: "low",
      });
    }
    await ctx.scheduler.runAfter(0, internal.generate.answerQuestion, {
      id,
      question,
      answer,
    });

    return battle;
  },
});

export const generateQuestion = mutation({
  args: {
    id: v.id("battles"),
    level: v.string(),
    topic: v.string(),
  },
  handler: async (ctx, { id, level, topic }) => {
    const battle = await ctx.db.get(id);
    if (!battle) {
      throw new ConvexError({
        message: "Battle not found",
        severity: "low",
      });
    }

    await ctx.scheduler.runAfter(0, internal.generate.question, {
      id,
      level,
      topic,
    });

    return battle;
  },
});

export const setQuestion = internalMutation({
  args: {
    id: v.id("battles"),
    question: v.string(),
  },
  handler: async (ctx, { id, question }) => {
    const battle = await ctx.db.get(id);
    if (!battle) {
      throw new ConvexError({
        message: "Battle not found",
        severity: "low",
      });
    }
    battle.trivia = question;

    await ctx.db.patch(id, battle);
  },
});

export const setTriviaResult = internalMutation({
  args: {
    id: v.id("battles"),
    result: v.boolean(),
    rationale: v.string(),
  },
  handler: async (ctx, { id, result, rationale }) => {
    const battle = await ctx.db.get(id);
    if (!battle) {
      throw new ConvexError({
        message: "Battle not found",
        severity: "low",
      });
    }
    battle.triviaResult = result;
    battle.triviaRationale = rationale;
    battle.trivia = undefined;

    await ctx.db.patch(id, battle);
  },
});

//game over sets everyone's health to max health, turn to 0, annoucermessage to undefined, insequence to false
export const gameOver = mutation({
  args: {
    id: v.id("battles"),
  },
  handler: async (ctx, { id }) => {
    const battle = await ctx.db.get(id);
    if (!battle) {
      throw new ConvexError({
        message: "Battle not found",
        severity: "low",
      });
    }
    const player1 = await ctx.db.get(battle.player1);
    const player2 = await ctx.db.get(battle.player2);
    if (!player1 || !player2) {
      throw new ConvexError({
        message: "Players not found",
        severity: "low",
      });
    }
    player1.health = player1.maxHealth;
    player2.health = player2.maxHealth;
    battle.turn = 0;
    battle.announcerMessage = "Nothing has happened yet";
    battle.inSequence = false;
    battle.result = "over";

    await ctx.db.patch(battle.player1, player1);
    await ctx.db.patch(battle.player2, player2);
    await ctx.db.patch(id, battle);
  },
});

export const createBattle = mutation({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError({
        message: "You must be logged in to create a battle.",
        severity: "low",
      });
    }

    const player1 = await ctx.db.insert("players", {
      level: 1,
      health: 100,
      maxHealth: 100,
      attack: 10,
      defense: 10,
      speed: 10,
      luck: 10,
      specialAttack: 40,
      specialDefense: 10,
      experience: 0,
      name: "Malignant Tiger",
    });

    if (!player1) {
      throw new ConvexError({
        message: "Player not found",
        severity: "low",
      });
    }

    const player2 = await ctx.db.insert("players", {
      level: 1,
      health: 100,
      maxHealth: 100,
      attack: 10,
      defense: 10,
      speed: 10,
      luck: 10,
      specialAttack: 40,
      specialDefense: 10,
      experience: 0,
      name: "Sneaky Snake",
    });
    if (!player2) {
      throw new ConvexError({
        message: "Player not found",
        severity: "low",
      });
    }
    const battle = await ctx.db.insert("battles", {
      player1,
      player2,
      result: "pending",
      turn: 0,
      inSequence: false,
      playerHealth: 100,
      opponentHealth: 100,
      announcerMessage: "Nothing has happened yet",
      trivia: undefined,
      triviaResult: undefined,
      triviaRationale: undefined,
      aiBattle: false,
    });

    return battle;
  },
});

export const listBattles = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError({
        message: "You must be logged in to view battles.",
        severity: "low",
      });
    }

    const battles = await ctx.db
      .query("battles")
      .filter((q) => q.eq(q.field("result"), "pending"))
      .collect();

    return battles;
  },
});
