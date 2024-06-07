import {
  Bookmark,
  Car,
  CornerLeftDown,
  ExternalLink,
  Eye,
  Heart,
  MessageCircle,
  Repeat2,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type TweetType = {
  favoriteCount: number | undefined;
  fullText: string | undefined;
  replyCount: number | undefined;
  retweetCount: number | undefined;
  viewCount: number | undefined;
  bookmarkCount: number | undefined;
  userName: string | undefined;
  tweetUrl: string | undefined;
  cardTilte?: string;
  onSearchSimilar?: () => void;
};

export const TweetComponent = (tweet: TweetType) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {tweet.cardTilte ? tweet.cardTilte : "Tweet Found"}
        </CardTitle>
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
              {tweet.viewCount !== undefined ? tweet.viewCount : "N/A"}{" "}
              <span></span>
            </p>
          </div>
          <div className="flex gap-1 items-center text-gray-500">
            <Heart className="w-5 h-5 " />
            <p className="font-bold ">
              {tweet.favoriteCount !== undefined ? tweet.favoriteCount : "N/A"}{" "}
              <span></span>
            </p>
          </div>
          <div className="flex gap-1 items-center text-gray-500">
            <Repeat2 className="w-5 h-5 " />
            <p className="font-bold ">
              {tweet.retweetCount !== undefined ? tweet.retweetCount : "N/A"}{" "}
              <span></span>
            </p>
          </div>
          <div className="flex gap-1 items-center text-gray-500">
            <MessageCircle className="w-5 h-5 " />
            <p className="font-bold ">
              {tweet.replyCount !== undefined ? tweet.replyCount : "N/A"}{" "}
              <span></span>
            </p>
          </div>
          <div className="flex gap-1 items-center text-gray-500">
            <Bookmark className="w-5 h-5 " />
            <p className="font-bold ">
              {tweet.bookmarkCount !== undefined ? tweet.bookmarkCount : "N/A"}{" "}
              <span></span>
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="gap-2">
        <Link
          href={tweet.tweetUrl !== undefined ? tweet.tweetUrl : "/"}
          rel="noopener noreferrer"
          target="_blank"
        >
          <Button className="flex gap-1">
            <ExternalLink className="h-4 w-4" />
            Tweet
          </Button>
        </Link>
        {tweet.onSearchSimilar ? (
          <Button
            className="flex gap-1"
            onClick={() => tweet.onSearchSimilar!()}
          >
            <CornerLeftDown className="h-4 w-4" />
            Similar Tweet
          </Button>
        ) : (
          <></>
        )}
      </CardFooter>
    </Card>
  );
};

TweetComponent.NotFound = function TweetComponentNotFound() {
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

TweetComponent.Skeleton = function SkeletonCard() {
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
