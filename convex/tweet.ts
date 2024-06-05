import { api } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { internalMutation, mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Update the tweet table or create one if it doesn't exist
export const createOrUpdateTweet = internalMutation({
  args: {
    tweetId: v.string(),
    favoriteCount: v.optional(v.number()),
    fullText: v.optional(v.string()),
    quoteCount: v.optional(v.number()),
    replyCount: v.optional(v.number()),
    retweetCount: v.optional(v.number()),
    viewCount: v.optional(v.number()),
    bookmarkCount: v.optional(v.number()),
    lastUpdate: v.number(),
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
const timeLimit = 20000; // update if more than 10 seconds
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
    // add or update new value to this tweet every time limit interval
    const dateNow = Date.now();
    if (tweet === null || dateNow - tweet.lastUpdate > timeLimit) {
      const scheduleId: Id<"_scheduled_functions"> =
        await ctx.scheduler.runAfter(0, api.twitter.fetchAndUpdate, {
          tweetId: tweetId,
          fetchTime: dateNow,
        });
      return scheduleId;
    }
    // 0 meaning no mutation is necessary
    return 0;
  },
});

// Query the exact tweet by tweet id
export type statusType = "Done" | "Pending";

export const getTweet = query({
  args: {
    tweetId: v.string(),
    scheduleId: v.union(v.id("_scheduled_functions"), v.literal(0)),
  },
  handler: async (ctx, args) => {
    // Tweet id
    const { tweetId, scheduleId } = args;
    // Check the result of the scheduled function first
    let scheduledStatus;
    // Query the result depending on status
    if (
      scheduleId === 0 ||
      ((scheduledStatus = await ctx.db.system.get(scheduleId)) &&
        (scheduledStatus.state.kind === "success" ||
          scheduledStatus.state.kind === "failed"))
    ) {
      const tweet = await ctx.db
        .query("tweets")
        .withIndex("by_tweet_id", (q) => q.eq("tweetId", tweetId))
        .first();
      const status: statusType = "Done";
      return { status: status, tweet: tweet };
    }
    // Otherwise, return the status only
    const status: statusType = "Pending";
    return { status: status };
  },
});
