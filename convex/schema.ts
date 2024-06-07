import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  tweets: defineTable({
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
    embeddingId: v.optional(v.id("tweetEmbeddings")),
  })
    .index("by_tweet_id_content", ["tweetIdContent"])
    .index("by_embeddingId", ["embeddingId"]),

  tweetEmbeddings: defineTable({
    embedding: v.array(v.float64()),
  }).vectorIndex("by_embedding", {
    vectorField: "embedding",
    dimensions: 1536,
  }),

  tweet_searches: defineTable({
    searchContent: v.string(),
    state: v.union(v.literal("Done"), v.literal("Pending")),
    ans: v.optional(v.id("tweets")),
    lastSearchTime: v.number(),
  }).index("by_search", ["searchContent"]),
});
