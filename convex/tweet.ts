import { api } from "./_generated/api";
import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Update the tweet table or create one if it doesn't exist
export const createOrUpdateTweet = mutation({
  args: {
    tweetId: v.string(),
    favoriteCount: v.optional(v.number()),
    fullText: v.optional(v.string()),
    quoteCount: v.optional(v.number()),
    replyCount: v.optional(v.number()),
    retweetCount: v.optional(v.number()),
    viewCount: v.optional(v.number()),
    bookmarkCount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // prepare tweet id
    const { tweetId } = args;
    // find according tweet
    const tweet = await ctx.db
      .query("tweets")
      .withIndex("by_tweet_id", (q) => q.eq("tweetId", tweetId))
      .first();
    // create or update
    if (tweet) {
      return await ctx.db.patch(tweet._id, args);
    } else {
      return await ctx.db.insert("tweets", args);
    }
  },
});

// Add/Update tweet table so that it reflects real data
export const addOrUpdateTweet = mutation({
  args: {
    tweetId: v.string(),
  },
  handler: async (ctx, args) => {
    // prepare tweet id
    const { tweetId } = args;
    // get the corresponding tweet
    const tweet = await ctx.db
      .query("tweets")
      .withIndex("by_tweet_id", (q) => q.eq("tweetId", tweetId))
      .first();
    // add or update new value to this tweet every 5 minutes
    if (!tweet || Date.now() - tweet._creationTime > 5000) {
      await ctx.scheduler.runAfter(0, api.twitter.fetchAndUpdate, {
        tweetId: tweetId,
      });
    }
  },
});
