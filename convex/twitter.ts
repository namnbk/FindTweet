import { api, internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { action } from "./_generated/server";
import { v } from "convex/values";
import { parseTweetId } from "./utilities";

async function getRequest(tweetID: string) {
  // These are the parameters for the API request
  const token = process.env.TWITTER_TOKEN;
  if (!token) {
    throw new Error("TWITTER_TOKEN environment variable not set!");
  }
  const endpointURL = `https://api.x.com/graphql/Xl5pC_lBk_gcO2ItU39DQw/TweetResultByRestId?variables=%7B%22tweetId%22%3A%22${tweetID}%22%2C%22withCommunity%22%3Afalse%2C%22includePromotedContent%22%3Afalse%2C%22withVoice%22%3Afalse%7D&features=%7B%22creator_subscriptions_tweet_preview_api_enabled%22%3Atrue%2C%22communities_web_enable_tweet_community_results_fetch%22%3Atrue%2C%22c9s_tweet_anatomy_moderator_badge_enabled%22%3Atrue%2C%22articles_preview_enabled%22%3Atrue%2C%22tweetypie_unmention_optimization_enabled%22%3Atrue%2C%22responsive_web_edit_tweet_api_enabled%22%3Atrue%2C%22graphql_is_translatable_rweb_tweet_is_translatable_enabled%22%3Atrue%2C%22view_counts_everywhere_api_enabled%22%3Atrue%2C%22longform_notetweets_consumption_enabled%22%3Atrue%2C%22responsive_web_twitter_article_tweet_consumption_enabled%22%3Atrue%2C%22tweet_awards_web_tipping_enabled%22%3Afalse%2C%22creator_subscriptions_quote_tweet_preview_enabled%22%3Afalse%2C%22freedom_of_speech_not_reach_fetch_enabled%22%3Atrue%2C%22standardized_nudges_misinfo%22%3Atrue%2C%22tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled%22%3Atrue%2C%22rweb_video_timestamps_enabled%22%3Atrue%2C%22longform_notetweets_rich_text_read_enabled%22%3Atrue%2C%22longform_notetweets_inline_media_enabled%22%3Atrue%2C%22rweb_tipjar_consumption_enabled%22%3Atrue%2C%22responsive_web_graphql_exclude_directive_enabled%22%3Atrue%2C%22verified_phone_label_enabled%22%3Afalse%2C%22responsive_web_graphql_skip_user_profile_image_extensions_enabled%22%3Afalse%2C%22responsive_web_graphql_timeline_navigation_enabled%22%3Atrue%2C%22responsive_web_enhance_cards_enabled%22%3Afalse%7D&fieldToggles=%7B%22withArticleRichContentState%22%3Atrue%2C%22withArticlePlainText%22%3Afalse%2C%22withGrokAnalyze%22%3Afalse%7D`;

  // This is the HTTP header that adds bearer token authentication
  // Fetch
  const res = await fetch(endpointURL, {
    method: "GET",
    headers: {
      "User-Agent": "v2TweetLookupJS",
      authorization: `Bearer ${token}`,
    },
  });
  // Check result
  if (res.ok) {
    const body = await res.json();
    console.log("Here is the response", body);
    return body;
  } else {
    console.log("No response", res.status);
    return null;
  }
}

const parseTweet = (tweetResp: any) => {
  try {
    const res = tweetResp.data.tweetResult.result;
    return {
      favoriteCount: parseInt(res.legacy.favorite_count),
      fullText: res.legacy.full_text,
      quoteCount: parseInt(res.legacy.quote_count),
      replyCount: parseInt(res.legacy.reply_count),
      retweetCount: parseInt(res.legacy.retweet_count),
      viewCount: parseInt(res.views.count),
      bookmarkCount: parseInt(res.legacy.bookmark_count),
      userName: res.core.user_results.result.legacy.name,
    };
  } catch (e) {
    return null;
  }
};

// tweetIdContent is the search content
export const fetchAndUpdate = action({
  args: {
    searchContent: v.string(),
    tweetSearchId: v.id("tweet_searches"),
  },
  handler: async (ctx, args) => {
    // prepare
    const { searchContent, tweetSearchId } = args;
    try {
      // Parse out tweet id
      const searchTweetId = parseTweetId(searchContent);
      // fetch twitter api request
      const response = await getRequest(searchTweetId);
      // look into response
      let metrics;
      if (response && (metrics = parseTweet(response))) {
        // fetch success
        // update tweet
        const tweetId: Id<"tweets"> = await ctx.runMutation(
          internal.tweet.createOrUpdateTweet,
          {
            tweetIdContent: searchTweetId,
            tweetUrl: searchContent,
            ...metrics,
          }
        );
        // update tweet search
        console.log("Found API fetch and update the searhc");
        await ctx.runMutation(internal.tweet.updateTweetSearch, {
          tweetSearchId: tweetSearchId,
          ans: tweetId,
        });
      }
    } catch (e) {
      console.log("Error when request", e);
    } finally {
      // Finally, the search is done
      await ctx.runMutation(internal.tweet.updateTweetSearch, {
        tweetSearchId: tweetSearchId,
        state: "Done",
      });
    }
  },
});
