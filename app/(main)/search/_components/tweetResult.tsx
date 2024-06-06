"use client";

import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { Id } from "@/convex/_generated/dataModel";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Bookmark,
  Car,
  Eye,
  Heart,
  MessageCircle,
  Repeat2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

type TweetType = {
  favoriteCount: number | undefined;
  fullText: string | undefined;
  replyCount: number | undefined;
  retweetCount: number | undefined;
  viewCount: number | undefined;
  bookmarkCount: number | undefined;
  userName: string | undefined;
};

const TweetComponent = (tweet: TweetType) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tweet Found</CardTitle>
        <CardDescription>
          by {tweet.userName ? tweet.userName : "Guest"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div>
          {tweet.fullText ? tweet.fullText : "Description cannot be loaded"}
        </div>
        <div className="flex gap-10 mt-5">
          <div className="flex gap-1 items-center text-gray-500">
            <Eye className="w-5 h-5 " />
            <p className="font-bold ">
              {tweet.viewCount ? tweet.viewCount : "N/A"} <span></span>
            </p>
          </div>
          <div className="flex gap-1 items-center text-gray-500">
            <Heart className="w-5 h-5 " />
            <p className="font-bold ">
              {tweet.favoriteCount ? tweet.favoriteCount : "N/A"} <span></span>
            </p>
          </div>
          <div className="flex gap-1 items-center text-gray-500">
            <Repeat2 className="w-5 h-5 " />
            <p className="font-bold ">
              {tweet.retweetCount ? tweet.retweetCount : "N/A"} <span></span>
            </p>
          </div>
          <div className="flex gap-1 items-center text-gray-500">
            <MessageCircle className="w-5 h-5 " />
            <p className="font-bold ">
              {tweet.replyCount ? tweet.replyCount : "N/A"} <span></span>
            </p>
          </div>
          <div className="flex gap-1 items-center text-gray-500">
            <Bookmark className="w-5 h-5 " />
            <p className="font-bold ">
              {tweet.bookmarkCount ? tweet.bookmarkCount : "N/A"} <span></span>
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button>Explore</Button>
      </CardFooter>
    </Card>
  );
};

const TweetComponentNotFound = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tweet Not Found</CardTitle>
        <CardDescription>
          Cannot load the tweet link. Please check your source and try again.
        </CardDescription>
      </CardHeader>
    </Card>
  );
};

const SkeletonCard = () => {
  return (
    <div className="flex flex-col space-y-3">
      <Skeleton className="h-[125px] w-full rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
      </div>
    </div>
  );
};

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
    return <SkeletonCard />;
  } else if (!tweetSearch.ans) {
    return <TweetComponentNotFound />;
  }
  // Rendering
  return (
    <div className="mt-4">
      <TweetComponent
        favoriteCount={tweetSearch.ans.favoriteCount}
        fullText={tweetSearch.ans.fullText}
        replyCount={tweetSearch.ans.replyCount}
        retweetCount={tweetSearch.ans.retweetCount}
        viewCount={tweetSearch.ans.viewCount}
        bookmarkCount={tweetSearch.ans.bookmarkCount}
        userName={tweetSearch.ans.userName}
      />
      {/* Tweet Result <span>{JSON.stringify(tweetSearch.ans)}</span> */}
    </div>
  );
};

export default TweetResult;
