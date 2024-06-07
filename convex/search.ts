import { v } from "convex/values";
import { action } from "./_generated/server";
import { SearchResult } from "./embedding";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

type EmbedResult = {
  embedId: Id<"tweetEmbeddings">;
  embedValues: number[];
};

export const similarTweets = action({
  args: { tweetId: v.id("tweets") },
  handler: async (ctx, args) => {
    const embeddingResult: EmbedResult | null = await ctx.runQuery(
      internal.tweet.getTweetEmbedding,
      {
        tweetId: args.tweetId,
      }
    );
    let results: SearchResult[] = [];
    if (embeddingResult) {
      results = (
        await ctx.vectorSearch("tweetEmbeddings", "by_embedding", {
          vector: embeddingResult.embedValues,
          limit: 4,
        })
      ).filter((result) => result._id !== embeddingResult?.embedId);
    }
    return results;
  },
});
