import { api } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { internalMutation, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { timeLimit } from "./constants";

// Update the tweet table or create one if it doesn't exist
export const createOrUpdateTweet = internalMutation({
  args: {
    tweetIdContent: v.string(),
    favoriteCount: v.optional(v.number()),
    fullText: v.optional(v.string()),
    quoteCount: v.optional(v.number()),
    replyCount: v.optional(v.number()),
    retweetCount: v.optional(v.number()),
    viewCount: v.optional(v.number()),
    bookmarkCount: v.optional(v.number()),
    userName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // prepare tweet id
    const { tweetIdContent } = args;
    // find according tweet
    const tweet = await ctx.db
      .query("tweets")
      .withIndex("by_tweet_id_content", (q) =>
        q.eq("tweetIdContent", tweetIdContent)
      )
      .first();
    // create or update
    let res: Id<"tweets">;
    if (tweet) {
      await ctx.db.patch(tweet._id, args);
      res = tweet._id;
    } else {
      const tweetInsert = await ctx.db.insert("tweets", args);
      res = tweetInsert;
    }
    return res;
  },
});

// Update Tweet Search
export const updateTweetSearch = internalMutation({
  args: {
    tweetSearchId: v.id("tweet_searches"),
    searchContent: v.optional(v.string()),
    state: v.optional(v.union(v.literal("Done"), v.literal("Pending"))),
    ans: v.optional(v.id("tweets")),
    lastSearchTime: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // prepare
    const { tweetSearchId, ...params } = args;
    // patch
    await ctx.db.patch(tweetSearchId, params);
    return tweetSearchId;
  },
});

// Add or update tweet table so that it reflects real data
export const searchTweet = mutation({
  args: {
    searchContent: v.string(),
  },
  handler: async (ctx, args) => {
    // prepare
    const { searchContent } = args;
    const searchTimeNow = Date.now();
    // see if this search appear before
    const search = await ctx.db
      .query("tweet_searches")
      .withIndex("by_search", (q) => q.eq("searchContent", searchContent))
      .first();
    // if a search is found
    if (search) {
      // check within time interval
      if (searchTimeNow - search.lastSearchTime <= timeLimit) {
        return search._id;
      } else {
        // if out of date, then about to start the search again
        await ctx.db.patch(search._id, {
          state: "Pending",
          lastSearchTime: searchTimeNow,
        });
        // schedule it
        await ctx.scheduler.runAfter(0, api.twitter.fetchAndUpdate, {
          searchContent: searchContent,
          tweetSearchId: search._id,
        });
        // return
        return search._id;
      }
    } else {
      // otherwise, if no search is found
      // create a search
      const newSearchId = await ctx.db.insert("tweet_searches", {
        searchContent: searchContent,
        state: "Pending",
        lastSearchTime: searchTimeNow,
      });
      // schedule a search
      await ctx.scheduler.runAfter(0, api.twitter.fetchAndUpdate, {
        searchContent: searchContent,
        tweetSearchId: newSearchId,
      });
      return newSearchId;
    }
  },
});

// Query the exact tweet by tweet id
export type statusType = "Done" | "Pending";

export const getFromSearchId = query({
  args: {
    tweetSearchId: v.id("tweet_searches"),
  },
  handler: async (ctx, args) => {
    // prepare
    const { tweetSearchId } = args;
    // get the tweet search
    const search = await ctx.db.get(tweetSearchId);
    // get the tweet response
    if (search) {
      const ans = search.ans;
      let tweet = null;
      if (ans) {
        tweet = await ctx.db
          .query("tweets")
          .withIndex("by_id", (q) => q.eq("_id", ans))
          .first();
      }
      return { state: search.state, ans: tweet };
    }
    // state is null meaning the provided id doesn't exist
    return { state: null, ans: null };
  },
});
