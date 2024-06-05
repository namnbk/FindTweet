"use client";

import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { SearchType } from "../page";

const TweetResult = ({search}: {search: SearchType}) => {
    // Hooks
    const {searchId, searchValue} = search
    const tweetState = useQuery(api.tweet.getTweet, {tweetId: searchValue, scheduleId: searchId});
    // Conditional Rendering
    if (!tweetState || tweetState.status === "Pending") {
        return <p>
            Loading...
        </p>
    } else if (tweetState.status === "Done" && !tweetState.tweet) {
        return <p>
            Tweet Invalid
        </p>
    }
    // Rendering
    return <div className="mt-4 border-red-500 border">
        Tweet Result <span>{JSON.stringify(tweetState.tweet)}</span>
    </div>;
}
 
export default TweetResult;