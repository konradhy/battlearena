import { v, ConvexError } from "convex/values";
import {
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import { wait, attack, specialAttack, heal } from "./helpers";
import { internal } from "./_generated/api";
import {
  CyberDrake,
  PixelWyrm,
  QuantumSphinx,
  DataGolem,
  ByteSerpent,
} from "./characterTemplate";

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
      attackerType: attacker.type,
      receiverType: receiver.type,
    });

    const action =
      mode === "attack" ? attack : mode === "special" ? specialAttack : heal;
    const result = action({ attacker, receiver });

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
    battle.announcerMessage = "Game Over";
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
    const characters = [
      CyberDrake,
      PixelWyrm,
      QuantumSphinx,
      DataGolem,
      ByteSerpent,
    ];
    const selectRandomCharacter = () => {
      const randomIndex = Math.floor(Math.random() * characters.length);
      return characters[randomIndex];
    };
    const randomCharacter = selectRandomCharacter();
    const randomCharacter2 = selectRandomCharacter();

    const player1 = await ctx.db.insert("characters", {
      level: randomCharacter2.level,
      health: randomCharacter2.health,
      maxHealth: randomCharacter2.maxHealth,
      attack: randomCharacter2.attack,
      defense: randomCharacter2.defense,
      speed: randomCharacter2.speed,
      luck: randomCharacter2.luck,
      specialAttack: randomCharacter2.specialAttack,
      specialDefense: randomCharacter2.specialDefense,
      experience: randomCharacter2.experience,
      name: randomCharacter2.name,
      userId: identity.subject,
      type: randomCharacter2.type,
      image: randomCharacter2.image,
    });

    if (!player1) {
      throw new ConvexError({
        message: "Player not found",
        severity: "low",
      });
    }

    const player2 = await ctx.db.insert("characters", {
      level: randomCharacter.level,
      health: randomCharacter.health,
      maxHealth: randomCharacter.maxHealth,
      attack: randomCharacter.attack,
      defense: randomCharacter.defense,
      speed: randomCharacter.speed,
      luck: randomCharacter.luck,
      specialAttack: randomCharacter.specialAttack,
      specialDefense: randomCharacter.specialDefense,
      experience: randomCharacter.experience,
      name: randomCharacter.name,
      userId: "unassigned",
      type: randomCharacter.type,
      image: randomCharacter.image,
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
      createdBy:
        identity.preferredUsername ||
        identity.nickname ||
        identity.givenName ||
        identity.name ||
        identity.email ||
        "Anonymous",
      announcerMessage: "Nothing has happened yet",
      trivia: undefined,
      triviaResult: undefined,
      triviaRationale: undefined,
      aiBattle: false,
      creatorEmail: identity.email || "Anonymous",
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
      .order("desc")
      .collect();

    return battles;
  },
});

export const joinBattle = mutation({
  args: {
    id: v.id("battles"),
    challenger: v.string(),
  },
  handler: async (ctx, { id, challenger }) => {
    const battle = await ctx.db.get(id);
    if (!battle) {
      throw new ConvexError({
        message: "Battle not found",
        severity: "low",
      });
    }
    battle.challenger = challenger;
    battle.result = "inProgress";
    await ctx.db.patch(id, battle);
  },
});

export const battleAi = mutation({
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
    battle.challenger = "AI";
    battle.aiBattle = true;
    battle.result = "inProgress";
    await ctx.db.patch(id, battle);
  },
});

export const getBattleInternal = internalQuery({
  args: {
    id: v.id("battles"),
  },
  handler: async (ctx, { id }) => {
    const battle = await ctx.db.get(id);
    return battle;
  },
});

export const selectAiMove = mutation({
  args: {
    id: v.id("battles"),
  },
  handler: async (ctx, { id }) => {
    await ctx.scheduler.runAfter(0, internal.generate.selectMove, {
      id,
    });
  },
});
