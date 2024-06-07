"use client";

import { api } from "@/convex/_generated/api";
import { usePaginatedQuery } from "convex/react";
import { TweetComponent } from "../search/_components/tweetComponent";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";

// number of items to load at a time
const loadsPerTime = 3;

const Leaderboard = () => {
  const { results, status, loadMore } = usePaginatedQuery(
    api.tweet.getAllTweets,
    {},
    { initialNumItems: loadsPerTime }
  );
  return (
    <div className="px-1 md:px-[10%] pb-2">
      {results?.map((result) => (
        <div key={result._id} className="mb-3">
          <TweetComponent
            favoriteCount={result.favoriteCount}
            fullText={result.fullText}
            replyCount={result.replyCount}
            retweetCount={result.retweetCount}
            viewCount={result.viewCount}
            bookmarkCount={result.bookmarkCount}
            userName={result.userName}
            cardTilte="Tweet"
            tweetUrl={result.tweetUrl}
          />
        </div>
      ))}
      <Button
        className="mt-5 mx-[45%] border-2"
        onClick={() => loadMore(loadsPerTime)}
        disabled={status !== "CanLoadMore"}
      >
        {status === "CanLoadMore" ? (
          <div className="flex items-center gap-1">
            <RefreshCcw className="h-4 w-4" />
            <p>Load more</p>
          </div>
        ) : (
          <p>Cannot Load Anymore</p>
        )}
      </Button>
    </div>
  );
};

export default Leaderboard;
