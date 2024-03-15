import OpenAI from "openai";
import { ConvexError, v } from "convex/values";
import {
  internalAction,
  internalMutation,
  internalQuery,
} from "./_generated/server";
import { attack } from "./helpers";
import { api, internal } from "./_generated/api";

export const announcerMessage = internalAction({
  args: {
    attacker: v.string(),
    receiver: v.string(),
    attackerHealth: v.number(),
    receiverHealth: v.number(),
    attackerMaxHealth: v.number(),
    receiverMaxHealth: v.number(),
    moment: v.string(),
    mode: v.string(),
    id: v.id("battles"),
    previousMessage: v.string(),
    attackerType: v.string(),
    receiverType: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const openai = new OpenAI();
      const completion = await openai.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `You are an ancient and wise entity, observing the unfolding of countless supernatural battles through the aeons. Today, you've turned your attention to a new duel, one that vibrates with the echoes of ancient power and modern resolve. Your task is to narrate the clash between two extraordinary beings, providing insight into their actions, the flow of the battle, and the impact of their powers on the world around them. You are the Announcer, the voice that shapes the narrative of this battle. 

Character 1: ${args.attacker}. Currently at ${args.attackerHealth} health out of a maximum of ${args.attackerMaxHealth}. who is type ${args.attackerType}

Character 2: ${args.receiver}., who is type ${args.receiverType}. Currently stands at ${args.receiverHealth} health out of a total of ${args.receiverMaxHealth}

The air crackles with anticipation as ${args.attacker} launches an attack using their ${args.mode}, a move renowned across dimensions for its nature.

Craft vivid narrative around character 1s move. End with a cliffhanger about what the other character will do next. Keep it short. Two sentences max
For context, the previous message was: ${args.previousMessage}.



`,
          },
        ],
        model: "gpt-3.5-turbo-1106",
        max_tokens: 100,
      });

      const narrative = completion.choices[0].message.content;
      if (narrative) {
        await ctx.runMutation(internal.battle.setAnnouncerMessage, {
          id: args.id,
          message: narrative,
        });
      }
    } catch (e) {
      throw new ConvexError({
        message: "Error" + e,
        severity: "low",
      });
    }
  },
});

export const question = internalAction({
  args: {
    id: v.id("battles"),
    level: v.string(),
    topic: v.string(),
  },
  handler: async (ctx, { id, level, topic }) => {
    try {
      const openai = new OpenAI();
      const completion = await openai.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `Generate a question about ${topic}. It shouldn't be too basic. It should have a one word/sentence answer. It's difficulty level is ${level}. Only generate a the question`,
          },
        ],

        model: "gpt-3.5-turbo-1106",
        max_tokens: 100,

        temperature: 2,
      });

      const question = completion.choices[0].message.content;
      if (!question) {
        throw new ConvexError({
          message: "Error" + "No question generated",
          severity: "low",
        });
      }

      await ctx.runMutation(internal.battle.setQuestion, {
        id,
        question,
      });
    } catch (e) {
      throw new ConvexError({
        message: "Error" + e,
        severity: "low",
      });
    }
  },
});

export const answerQuestion = internalAction({
  args: {
    id: v.id("battles"),
    question: v.string(),
    answer: v.string(),
  },
  handler: async (ctx, { id, question, answer }) => {
    try {
      const openai = new OpenAI();
      const completion = await openai.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `You will look at the a question, and an answer from a user and determine if it is correct. You will respond in JSON. The first key will be result and it will be a boolean. The second key will be rationale and it will be a string. `,
          },
          {
            role: "user",
            content: `The question I got was: ${question}. The answer I am giving is: ${answer}`,
          },
        ],
        model: "gpt-3.5-turbo-1106",
        response_format: { type: "json_object" },
      });

      const message = completion.choices[0].message.content;

      if (!message) {
        throw new ConvexError({
          message: "Error" + "No message generated",
          severity: "low",
        });
      }
      const parsedMessage = JSON.parse(message) as {
        result: boolean;
        rationale: string;
      };

      await ctx.runMutation(internal.battle.setTriviaResult, {
        id,
        result: parsedMessage.result,
        rationale: parsedMessage.rationale,
      });
    } catch (e) {
      throw new ConvexError({
        message: "Error" + e,
        severity: "low",
      });
    }
  },
});

export const selectMove = internalAction({
  args: {
    id: v.id("battles"),
  },
  handler: async (ctx, { id }) => {
    const battle = await ctx.runQuery(internal.battle.getBattleInternal, {
      id,
    });
    if (!battle) {
      throw new ConvexError({
        message: "Error" + "No battle found",
        severity: "low",
      });
    }

    const attacker = await ctx.runQuery(
      internal.characters.getCharacterInternal,
      { id: battle.player1 },
    );
    const receiver = await ctx.runQuery(
      internal.characters.getCharacterInternal,
      { id: battle.player2 },
    );

    if (!attacker || !receiver) {
      throw new ConvexError({
        message: "Error" + "No player found",
        severity: "low",
      });
    }

    try {
      const openai = new OpenAI();
      const completion = await openai.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `You are a character in a battle. You have to make a move. You have three options: attack, special, heal. You have to make a choice. 
            here are your stats:
            Your health: ${attacker.health}
            Your max health: ${attacker.maxHealth}
            Your attack: ${attacker.attack}
            Your defense: ${attacker.defense}
            Your speed: ${attacker.speed}
            Your luck: ${attacker.luck}
            Your special attack: ${attacker.specialAttack}
            Your special defense: ${attacker.specialDefense}
            Your experience: ${attacker.experience}
            Your type: ${attacker.type}

            here are your opponents stats:
            Their health: ${receiver.health}
            Their max health: ${receiver.maxHealth}
            Their attack: ${receiver.attack}
            Their defense: ${receiver.defense}
            Their speed: ${receiver.speed}
            Their luck: ${receiver.luck}
            Their special attack: ${receiver.specialAttack}
            Their special defense: ${receiver.specialDefense}
            Their experience: ${receiver.experience}
                   Their type: ${receiver.type}

 respond with a JSON object. It should have a key called move and a value of attack, special or heal. It should also have a key called rationale and a string explaining why you made the move.
      
         
            `,
          },
        ],
        model: "gpt-3.5-turbo-1106",
        max_tokens: 100,
        response_format: { type: "json_object" },
        temperature: 1,
      });

      const message = completion.choices[0].message.content;
      if (!message) {
        throw new ConvexError({
          message: "Error" + "No message generated",
          severity: "low",
        });
      }

      const parsedMessage = JSON.parse(message) as {
        move: string;
        rationale: string;
      };

      if (
        parsedMessage.move !== "attack" &&
        parsedMessage.move !== "special" &&
        parsedMessage.move !== "heal"
      ) {
        console.log("message", parsedMessage);
        parsedMessage.move = "attack";
      }

      console.log("message", message);

      await ctx.runMutation(api.battle.setBattleSequence, {
        id,
        mode: parsedMessage.move,
        turn: battle.turn,
      });
    } catch (e) {
      throw new ConvexError({
        message: "Error" + e,
        severity: "low",
      });
    }
  },
});
