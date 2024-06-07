"use client";

import { useState } from "react";
import SearchBar from "./_components/searchBar";
import TweetResult from "./_components/tweetResult";
import { Id } from "@/convex/_generated/dataModel";

const SearchPage = () => {
  // Hooks
  const [tweetSearchId, setTweetSearchId] =
    useState<Id<"tweet_searches"> | null>(null);
  const [similarTweetOn, setSimilarTweetOn] = useState(false);

  // Render
  return (
    <div className="md:px-[15%] px-2 pb-2">
      <h1 className="text-4xl font-bold text-center">Find Your Tweet</h1>
      <SearchBar
        setTweetSearchId={setTweetSearchId}
        setSimilarTweetOn={setSimilarTweetOn}
      />
      {tweetSearchId ? (
        <TweetResult
          tweetSearchId={tweetSearchId}
          similarTweetOn={similarTweetOn}
          setSimilarTweetOn={setSimilarTweetOn}
        />
      ) : (
        <></>
      )}
    </div>
  );
};

export default SearchPage;
