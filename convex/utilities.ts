export const parseTweetId = (tweetUrl: String) => {
  const splits = tweetUrl.trim().split("/");
  return splits[splits.length - 1];
};
