import OpenAI from "openai";
import { ConvexError, v } from "convex/values";
import {
  internalAction,
  internalMutation,
  internalQuery,
} from "./_generated/server";
import { attack } from "./helpers";
import { internal } from "./_generated/api";

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
  },
  handler: async (ctx, args) => {
    try {
      const openai = new OpenAI();
      const completion = await openai.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `You are an ancient and wise entity, observing the unfolding of countless supernatural battles through the aeons. Today, you've turned your attention to a new duel, one that vibrates with the echoes of ancient power and modern resolve. Your task is to narrate the clash between two extraordinary beings, providing insight into their actions, the flow of the battle, and the impact of their powers on the world around them. You are the Announcer, the voice that shapes the narrative of this battle. 

Character 1: ${args.attacker}. Currently at ${args.attackerHealth} health out of a maximum of ${args.attackerMaxHealth}

Character 2: ${args.receiver}., who is type snow. Currently stands at ${args.receiverHealth} health out of a total of ${args.receiverMaxHealth}

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

//will take a look at a question and an answer
//it will then determine if the answer is correct using gpt.3.5
//will use json mode and return an object with the result which is a boolean of true if correct and false if wrong
//will also return rationale which is the reason why the answer is correct or wrong

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
