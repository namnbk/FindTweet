"use client";

import { api } from "@/convex/_generated/api";
import { useAction, useQuery } from "convex/react";
import { Id } from "@/convex/_generated/dataModel";
import { TweetComponent } from "./tweetComponent";
import { SetStateAction, useEffect, useState } from "react";
import SimilarTweetsResult from "./similarTweetsResult";
import { SearchResult } from "@/convex/embedding";

const TweetResult = ({
  tweetSearchId,
  similarTweetOn,
  setSimilarTweetOn,
}: {
  tweetSearchId: Id<"tweet_searches">;
  similarTweetOn: boolean;
  setSimilarTweetOn: React.Dispatch<SetStateAction<boolean>>;
}) => {
  // Hooks
  const tweetSearch = useQuery(api.tweet.getFromSearchId, {
    tweetSearchId: tweetSearchId,
  });
  const [searchResults, setSearchResults] = useState<
    SearchResult[] | undefined
  >(undefined);
  const vectorSearch = useAction(api.search.similarTweets);

  // Function
  const onSearchSimilarTweets = async () => {
    // Set UI state
    setSimilarTweetOn(true);
    // Get Result
    if (tweetSearch && tweetSearch.ans && tweetSearch.ans._id) {
      const results = await vectorSearch({ tweetId: tweetSearch?.ans?._id });
      setSearchResults(results);
    }
  };

  // Conditional Rendering
  if (!tweetSearch || !tweetSearch.state) {
    return <></>;
  } else if (tweetSearch.state === "Pending") {
    return <TweetComponent.Skeleton />;
  } else if (!tweetSearch.ans) {
    return <TweetComponent.NotFound />;
  }
  // Rendering
  return (
    <div>
      <TweetComponent
        favoriteCount={tweetSearch.ans.favoriteCount}
        fullText={tweetSearch.ans.fullText}
        replyCount={tweetSearch.ans.replyCount}
        retweetCount={tweetSearch.ans.retweetCount}
        viewCount={tweetSearch.ans.viewCount}
        bookmarkCount={tweetSearch.ans.bookmarkCount}
        userName={tweetSearch.ans.userName}
        tweetUrl={tweetSearch.ans.tweetUrl}
        onSearchSimilar={onSearchSimilarTweets}
      />
      {similarTweetOn && searchResults ? (
        <SimilarTweetsResult searchResults={searchResults} />
      ) : (
        <></>
      )}
    </div>
  );
};

export default TweetResult;
