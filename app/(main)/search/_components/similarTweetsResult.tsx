import { api } from "@/convex/_generated/api";
import { SearchResult } from "@/convex/embedding";
import { useQuery } from "convex/react";
import { TweetComponent } from "./tweetComponent";

const SimilarTweetsResult = ({
  searchResults,
}: {
  searchResults: SearchResult[];
}) => {
  // Hooks
  const tweetResults = useQuery(api.embedding.fetchResults, {
    results: searchResults,
  });
  // Conditional Rendering
  if (tweetResults === undefined) {
    return <TweetComponent.Skeleton />;
  } else if (tweetResults.length === 0) {
    return (
      <h1 className="text-2xl font-bold text-center mt-3">
        No Similar Tweet Found
      </h1>
    );
  } else {
    // Rendering
    return (
      <div className="flex flex-col gap-y-5 mt-3">
        <h1 className="text-2xl font-bold text-center">Similar Tweets</h1>
        {tweetResults.map((tweetResult) => (
          <div id={tweetResult._id}>
            <TweetComponent
              favoriteCount={tweetResult.favoriteCount}
              fullText={tweetResult.fullText}
              replyCount={tweetResult.replyCount}
              retweetCount={tweetResult.retweetCount}
              viewCount={tweetResult.viewCount}
              bookmarkCount={tweetResult.bookmarkCount}
              userName={tweetResult.userName}
              cardTilte="Tweet"
              tweetUrl={tweetResult.tweetUrl}
            />
          </div>
        ))}
      </div>
    );
  }
};

export default SimilarTweetsResult;
