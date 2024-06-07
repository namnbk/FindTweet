import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Update tweet every 15 minutes
// crons.interval(
//   "update tweet",
//   { minutes: 15 }, // every minute
//   internal.tweet.updateTweets
// );

// Clean unused search tweet every 3 hours
crons.interval(
  "clean search tweet",
  { hours: 3 }, // every hours
  internal.tweet.cleanTweetSearches
);

export default crons;
