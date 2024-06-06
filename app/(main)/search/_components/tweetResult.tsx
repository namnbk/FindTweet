"use client";

import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { Id } from "@/convex/_generated/dataModel";

const TweetResult = ({tweetSearchId}: {tweetSearchId: Id<"tweet_searches">}) => {
    // Hooks
    const tweetSearch = useQuery(api.tweet.getFromSearchId, {tweetSearchId: tweetSearchId});
    // Conditional Rendering
    if (!tweetSearch || !tweetSearch.state) {
        return <></>
    } else if (tweetSearch.state === "Pending") {
        return <div>Loading ...</div>
    } else if (!tweetSearch.ans) {
        return <div>No Tweet Found</div>
    }
    // Rendering
    return <div className="mt-4 border-red-500 border">
        Tweet Result <span>{JSON.stringify(tweetSearch.ans)}</span>
    </div>;
}
 
export default TweetResult;