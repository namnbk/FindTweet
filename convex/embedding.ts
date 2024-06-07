import { v } from "convex/values";
import { query, internalMutation, internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { Doc, Id } from "./_generated/dataModel";

export type Result = Doc<"tweets"> & { _score: number };
export type SearchResult = { _id: Id<"tweetEmbeddings">; _score: number };

// Given a string, call OpenAI GPT to embed the string into vector of numbers
export async function embed(text: string): Promise<number[]> {
  const key = process.env.OPENAI_KEY;
  if (!key) {
    throw new Error("OPENAI_KEY environment variable not set!");
  }
  const req = { input: text, model: "text-embedding-ada-002" };
  const resp = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify(req),
  });
  if (!resp.ok) {
    const msg = await resp.text();
    throw new Error(`OpenAI API error: ${msg}`);
  }
  const json = await resp.json();
  const vector = json["data"][0]["embedding"];
  console.log(`Computed embedding of "${text}": ${vector.length} dimensions`);
  return vector;
}

export const generateAndAddEmbedding = internalAction({
  args: { tweetId: v.id("tweets"), fullText: v.string() },
  handler: async (ctx, args) => {
    const embedding = await embed(args.fullText);
    await ctx.runMutation(internal.embedding.addEmbedding, {
      tweetId: args.tweetId,
      embedding,
    });
  },
});

export const addEmbedding = internalMutation({
  args: { tweetId: v.id("tweets"), embedding: v.array(v.number()) },
  handler: async (ctx, args) => {
    const tweet = await ctx.db.get(args.tweetId);
    if (tweet === null) {
      // No tweet to update
      return;
    }
    // add to embedding table
    const tweetEmbeddingId = await ctx.db.insert("tweetEmbeddings", {
      embedding: args.embedding,
    });
    // link to the tweet table
    await ctx.db.patch(args.tweetId, {
      embeddingId: tweetEmbeddingId,
    });
  },
});

export const fetchResults = query({
  args: {
    results: v.array(
      v.object({ _id: v.id("tweetEmbeddings"), _score: v.float64() })
    ),
  },
  handler: async (ctx, args) => {
    const out: Result[] = [];
    for (const result of args.results) {
      const doc = await ctx.db
        .query("tweets")
        .withIndex("by_embeddingId", (q) => q.eq("embeddingId", result._id))
        .unique();
      if (doc === null) {
        continue;
      }
      out.push({
        ...doc,
        _score: result._score,
      });
    }
    return out;
  },
});
