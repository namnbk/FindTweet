"use client";

import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { Id } from "@/convex/_generated/dataModel";
import { TweetComponent } from "./tweetComponent";

const TweetResult = ({
  tweetSearchId,
}: {
  tweetSearchId: Id<"tweet_searches">;
}) => {
  // Hooks
  const tweetSearch = useQuery(api.tweet.getFromSearchId, {
    tweetSearchId: tweetSearchId,
  });
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
    <TweetComponent
      favoriteCount={tweetSearch.ans.favoriteCount}
      fullText={tweetSearch.ans.fullText}
      replyCount={tweetSearch.ans.replyCount}
      retweetCount={tweetSearch.ans.retweetCount}
      viewCount={tweetSearch.ans.viewCount}
      bookmarkCount={tweetSearch.ans.bookmarkCount}
      userName={tweetSearch.ans.userName}
      tweetUrl={tweetSearch.ans.tweetIdContent}
    />
  );
};

export default TweetResult;
