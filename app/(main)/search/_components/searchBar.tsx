"use client"

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";

import { useState } from "react";

const SearchBar = () => {
  // Variable
  const [search, setSearch] = useState("");
  const search_tweet = useMutation(api.tweet.addOrUpdateTweet)
  
  return (
    <div className="flex items-center justify-center gap-x-1 p-2 md:px-[20%]">
      <Input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="px-2 focus-visible:ring-transparent bg-secondary"
        placeholder="Filter by page title..."
      />
      <Button onClick={() => search_tweet({tweetId: search})}>Search</Button>
    </div>
  );
};

export default SearchBar;
