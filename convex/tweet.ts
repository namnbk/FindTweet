import { api, internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import {
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import { v } from "convex/values";
import { timeLimit } from "./constants";
import { embed } from "./embedding";
import { paginationOptsValidator } from "convex/server";

// Get the full text of a tweet id
export const getTweetEmbedding = internalQuery({
  args: {
    tweetId: v.id("tweets"),
  },
  handler: async (ctx, args) => {
    // Get the according tweet
    const tweet = await ctx.db.get(args.tweetId);
    if (tweet && tweet.embeddingId) {
      const embed = await ctx.db.get(tweet.embeddingId);
      if (embed) return { embedId: embed._id, embedValues: embed.embedding };
    }
  },
});

const howPopular = (view: number | undefined, love: number | undefined) => {
  // get a weighted metrics
  const score = (view ? view : 0) * 0.7 + (love ? love : 0) * 0.3;
  // get the according message
  if (score < 80000) {
    return ". This post is not popular";
  } else if (score < 900000) {
    return ". This post is quite popular";
  } else {
    return ". This post is very popular";
  }
};

// Update the tweet table or create one if it doesn't exist
export const createOrUpdateTweet = internalMutation({
  args: {
    tweetIdContent: v.string(),
    tweetUrl: v.optional(v.string()),
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
      // if tweet alreayd exist, then update the args
      await ctx.db.patch(tweet._id, args);
      res = tweet._id;
    } else {
      // otherwise, insert new tweet into the table
      const tweetInsertId = await ctx.db.insert("tweets", args);
      // Kick off an action to generate an embedding for this movie
      await ctx.scheduler.runAfter(
        0,
        internal.embedding.generateAndAddEmbedding,
        {
          tweetId: tweetInsertId,
          fullText:
            args.fullText +
              howPopular(args.viewCount, args.favoriteCount) +
              `{. By ${args.userName ? args.userName : "guest"}}` ||
            "No Tweet Description",
        }
      );
      res = tweetInsertId;
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

// Keep every tweek up to date
export const updateTweets = internalMutation({
  args: {},
  handler: async (ctx, args) => {
    // Get all tweets
    const tweets = await ctx.db.query("tweets").collect();
    // Spinning all updates
    let updates: Promise<Id<"_scheduled_functions">>[] = [];
    for (let tweet of tweets) {
      updates.push(
        ctx.scheduler.runAfter(0, api.tweet.searchTweet, {
          searchContent: tweet.tweetIdContent,
        })
      );
    }
    // Run Promises
    await Promise.all(updates);
  },
});

// Clean unused searches
export const cleanTweetSearches = internalMutation({
  args: {},
  handler: async (ctx, args) => {
    // filtering out unused search
    const unusedSearches = await ctx.db
      .query("tweet_searches")
      .filter((q) => q.eq(q.field("ans"), undefined))
      .collect();
    // batch all the unused search to delete
    let deletes: Promise<void>[] = [];
    for (let unusedSearch of unusedSearches) {
      deletes.push(ctx.db.delete(unusedSearch._id));
    }
    // delete all
    await Promise.all(deletes);
  },
});

// Return all tweets in the database
// in descending order of view, with pagination
export const getAllTweets = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    const tweets = await ctx.db
      .query("tweets")
      .withIndex("by_view")
      .order("desc")
      .paginate(args.paginationOpts);
    return tweets;
  },
});
